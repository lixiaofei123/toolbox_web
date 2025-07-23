/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用静态导出
  output: 'export',
  
  // 禁用图片优化（静态导出不支持）
  images: {
    unoptimized: true,
  },
  
  // 设置基础路径（如果部署在子目录）
  // basePath: '/base64-converter',
  
  // 设置资源前缀（如果使用CDN）
  // assetPrefix: 'https://cdn.example.com',
  
  // 严格模式
  reactStrictMode: true,
  
  // 实验性功能
  experimental: {
    // 启用应用目录
    appDir: true,
  },
  
  // 编译器选项
  compiler: {
    // 移除 console.log
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 环境变量
  env: {
    CUSTOM_KEY: 'base64-converter',
  },
  
  // 重定向规则
  async redirects() {
    return [
      {
        source: '/md5-generator',
        destination: '/hash-generator',
        permanent: true,
      },
    ]
  },
  
  // 头部设置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  // Webpack 配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 自定义 webpack 配置
    return config
  },
  
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
