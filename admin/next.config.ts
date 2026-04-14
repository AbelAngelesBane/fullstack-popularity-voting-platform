import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[
      {
        hostname:"mhzvtnpclzvarnjibhjc.supabase.co",
        protocol:"https",
        port:""
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  cacheComponents:true  
};

export default nextConfig;
