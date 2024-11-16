/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eth.blockscout.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
