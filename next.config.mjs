/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    distDir: 'out',
    images:{
        unoptimized:false,
        domains:['mafekvxxizlcavhbkybi.supabase.co'],
        loader: 'default',
        path: '/_next/image'
    },
    reactStrictMode: true,
    poweredByHeader: false,
};

export default nextConfig;
