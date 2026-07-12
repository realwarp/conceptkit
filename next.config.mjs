/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.pollinations.ai" },
      { protocol: "https", hostname: "**.replicate.delivery" },
      { protocol: "https", hostname: "**.replicate.com" },
      { protocol: "https", hostname: "huggingface.co" },
      { protocol: "https", hostname: "**.hf.co" },
    ],
  },
};

export default nextConfig;
