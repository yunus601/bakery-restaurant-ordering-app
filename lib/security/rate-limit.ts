import "server-only";

import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function enforceRateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const allowed = await prisma.$transaction(async (tx) => {
    const bucket = await tx.rateLimitBucket.findUnique({ where: { key }, select: { count: true, resetAt: true } });
    if (!bucket || bucket.resetAt <= now) {
      await tx.rateLimitBucket.upsert({ where: { key }, create: { key, count: 1, resetAt }, update: { count: 1, resetAt } });
      return true;
    }
    const updated = await tx.rateLimitBucket.updateMany({ where: { key, resetAt: { gt: now }, count: { lt: limit } }, data: { count: { increment: 1 } } });
    return updated.count === 1;
  });
  if (!allowed) throw new RateLimitError();
}

export async function requestRateLimitKey(prefix: string) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip") ?? "unknown";
  return `${prefix}:${ip}`;
}

export class RateLimitError extends Error {}
