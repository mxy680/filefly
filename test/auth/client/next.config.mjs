/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/auth/:path*',
                destination: 'http://localhost:4000/auth/:path*', // Proxy to the backend server
            },
        ];
    },
};

export default nextConfig;
