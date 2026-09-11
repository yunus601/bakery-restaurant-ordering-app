import { NextResponse } from "next/server";

import { deliverPendingOrderNotifications } from "@/lib/notifications/outbox";
import { RateLimitError, enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try { await enforceRateLimit("notification-worker", 10, 60_000); } catch (error) {
    if (error instanceof RateLimitError) return new NextResponse("Too Many Requests", { status: 429 });
    throw error;
  }
  return NextResponse.json(await deliverPendingOrderNotifications());
}
