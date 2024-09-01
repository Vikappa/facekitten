/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            {
              key: "Access-Control-Allow-Origin",
              value: "*", 
            },
            {
              key: "Access-Control-Allow-Methods",
              value: "GET, POST, PUT, DELETE, OPTIONS",
            },
            {
              key: "Access-Control-Allow-Headers",
              value: "Content-Type, Authorization",
            },
          ],
        },
      ];
    },
    images: {
      formats: ["image/avif", "image/webp"],
      remotePatterns: [
        {
          hostname: "images.pexels.com",
        },
      ],
    },
  };
  
  export default nextConfig;
  