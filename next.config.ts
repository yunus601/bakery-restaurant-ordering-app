import type { NextConfig } from "next";

const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: cloudinaryCloudName
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            port: "",
            pathname: `/${cloudinaryCloudName}/image/upload/**`,
            search: "",
          },
        ]
      : [],
  },
};

export default nextConfig;
