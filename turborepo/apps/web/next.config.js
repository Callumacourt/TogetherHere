/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '192.168.6.50',
    '*.ngrok-free.app',
    '*.ngrok.io',
    'localhost',
    '127.0.0.1',
  ],
};

export default nextConfig;
