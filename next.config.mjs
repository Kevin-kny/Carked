/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsHmrCache: false,
    },

    images: {
        remotePatterns:[
            {
                protocol: "https",
                hostname: "jlqwbqnthevzlscflibd.supabase.co",
            },
        ],
    },
};

export default nextConfig;
