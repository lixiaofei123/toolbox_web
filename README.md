# 在线工具箱 (Online Toolbox)

> 本项目由 AI 生成，基于 Next.js + React + TypeScript 构建，集成多种实用开发者工具，所有功能均在本地浏览器端运行，保护您的隐私。
> 
> This project is AI-generated, built with Next.js + React + TypeScript, and integrates a variety of practical developer tools. All features run locally in your browser to protect your privacy.

---

## 项目简介 (Project Introduction)

这是一个功能丰富的在线工具箱，专为开发者和日常用户设计。所有工具都在本地浏览器中运行，无需上传数据到服务器，确保您的隐私和数据安全。项目采用现代化的技术栈，提供流畅的用户体验和响应式设计。

This is a feature-rich online toolbox designed for developers and everyday users. All tools run locally in your browser without uploading data to servers, ensuring your privacy and data security. The project uses modern technology stack to provide smooth user experience and responsive design.

---

## 功能列表 (Features)

### 🔄 编码转换工具 (Encoding & Conversion Tools)
- **Base64 转换器** (Base64 Converter): 图片与Base64字符串互转 | Image & Base64 string conversion
- **URL 编码器** (URL Encoder): URL编码解码工具 | Encode & decode URLs
- **时间戳转换器** (Timestamp Converter): 时间戳与日期时间互转 | Timestamp & datetime conversion

### 🖼️ 图片处理工具 (Image Processing Tools)
- **图片格式转换器** (Image Converter): JPG/PNG/WebP/GIF 格式互转 | JPG/PNG/WebP/GIF conversion
- **图片编辑器** (Image Editor): 剪裁、调整尺寸和比例 | Crop, resize, aspect ratio
- **颜色取色器** (Color Picker): 从图片中精确提取颜色值 | Extract colors from images precisely

### 🎨 颜色工具 (Color Tools)
- **颜色转换器** (Color Converter): HEX/RGB/HSL 颜色格式互转 | HEX/RGB/HSL conversion

### 🔐 安全工具 (Security Tools)
- **哈希值生成器** (Hash Generator): MD5/SHA-1/SHA-256/SHA-384/SHA-512 哈希值生成 | Generate hash values with multiple algorithms
- **密码生成器** (Password Generator): 生成安全的随机密码 | Generate secure random passwords
- **JWT 解析器** (JWT Parser): 解析JWT token和验证签名 | Parse & verify JWT tokens
- **UUID 生成器** (UUID Generator): 批量生成唯一标识符 | Batch generate UUIDs

### 📝 文本处理工具 (Text Processing Tools)
- **JSON 格式化器** (JSON Formatter): JSON美化、压缩、格式验证 | Beautify, minify, validate JSON
- **正则表达式测试器** (Regex Tester): 验证正则表达式语法，测试匹配结果 | Test regex syntax & matches
- **文本差异对比器** (Text Diff): 对比两段文本的差异 | Compare text differences
- **文本搜索替换器** (Text Search Replace): 批量搜索替换文本内容 | Batch search and replace text

### 🛠️ 开发工具 (Development Tools)
- **二维码工具** (QR Code Tools): 生成和识别二维码 | Generate & scan QR codes
- **Cron 表达式生成器** (Cron Generator): 生成和分析Cron表达式 | Generate & analyze cron expressions

---

## 技术栈 (Tech Stack)

### 前端框架 (Frontend Framework)
- **[Next.js](https://nextjs.org/) 15**: React 全栈框架 | React full-stack framework
- **[React](https://react.dev/) 19**: 用户界面库 | User interface library
- **[TypeScript](https://www.typescriptlang.org/)**: 类型安全的 JavaScript | Type-safe JavaScript

### 样式和UI (Styling & UI)
- **[Tailwind CSS](https://tailwindcss.com/)**: 实用优先的CSS框架 | Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)**: 无样式的可访问组件 | Unstyled accessible components
- **[Lucide React](https://lucide.dev/)**: 美观的图标库 | Beautiful icon library

### 工具库 (Utility Libraries)
- **[CryptoJS](https://cryptojs.gitbook.io/)**: 加密算法库 | Cryptographic algorithms
- **[date-fns](https://date-fns.org/)**: 现代化日期工具库 | Modern date utility library
- **[Recharts](https://recharts.org/)**: React 图表库 | React charting library
- **[Zod](https://zod.dev/)**: TypeScript 优先的模式验证 | TypeScript-first schema validation
- **[QRCode.js](https://github.com/davidshimjs/qrcodejs)**: 二维码生成库 | QR code generation
- **[jsQR](https://github.com/cozmo/jsQR)**: 二维码识别库 | QR code scanning

---

## 快速开始 (Quick Start)

### 环境要求 (Prerequisites)
- Node.js 18+ 
- pnpm (推荐) | pnpm (recommended) 或 npm/yarn

### 安装与运行 (Installation & Running)

#### 1. 克隆项目 (Clone the repository)
\`\`\`bash
git clone <repository-url>
cd online-toolbox
\`\`\`

#### 2. 安装依赖 (Install dependencies)
\`\`\`bash
pnpm install
# 或者 (or)
npm install
\`\`\`

#### 3. 启动开发环境 (Start development server)
\`\`\`bash
pnpm dev
# 或者 (or)
npm run dev
\`\`\`

访问 http://localhost:3000 查看应用
Visit http://localhost:3000 to view the application

#### 4. 构建生产环境 (Build for production)
\`\`\`bash
pnpm build
# 或者 (or)
npm run build
\`\`\`

#### 5. 启动生产环境 (Start production server)
\`\`\`bash
pnpm start
# 或者 (or)
npm start
\`\`\`

---

## 项目结构 (Project Structure)

\`\`\`
├── app/                    # Next.js App Router 页面 (App Router pages)
│   ├── base64-converter/   # Base64 转换器 (Base64 converter)
│   ├── color-converter/    # 颜色转换器 (Color converter)
│   ├── color-picker/       # 颜色取色器 (Color picker)
│   ├── cron-generator/     # Cron 表达式生成器 (Cron generator)
│   ├── hash-generator/     # 哈希值生成器 (Hash generator)
│   ├── image-converter/    # 图片格式转换器 (Image converter)
│   ├── image-editor/       # 图片编辑器 (Image editor)
│   ├── json-formatter/     # JSON 格式化器 (JSON formatter)
│   ├── jwt-parser/         # JWT 解析器 (JWT parser)
│   ├── password-generator/ # 密码生成器 (Password generator)
│   ├── qr-code-tools/      # 二维码工具 (QR code tools)
│   ├── regex-tester/       # 正则表达式测试器 (Regex tester)
│   ├── text-diff/          # 文本差异对比器 (Text diff)
│   ├── text-search-replace/# 文本搜索替换器 (Text search replace)
│   ├── timestamp-converter/# 时间戳转换器 (Timestamp converter)
│   ├── url-encoder/        # URL 编码器 (URL encoder)
│   ├── uuid-generator/     # UUID 生成器 (UUID generator)
│   ├── layout.tsx          # 根布局 (Root layout)
│   ├── page.tsx            # 首页 (Homepage)
│   └── globals.css         # 全局样式 (Global styles)
├── components/             # 可复用组件 (Reusable components)
│   ├── ui/                 # UI 组件库 (UI component library)
│   └── theme-provider.tsx  # 主题提供者 (Theme provider)
├── hooks/                  # 自定义 Hooks (Custom hooks)
├── lib/                    # 工具库与核心逻辑 (Utils & core logic)
├── public/                 # 静态资源 (Static assets)
├── styles/                 # 样式文件 (Style files)
├── package.json            # 项目依赖与脚本 (Dependencies & scripts)
├── tsconfig.json           # TypeScript 配置 (TypeScript config)
├── tailwind.config.ts      # Tailwind CSS 配置 (Tailwind config)
├── next.config.mjs         # Next.js 配置 (Next.js config)
└── README.md               # 项目说明 (Project documentation)
\`\`\`

---

## 特性亮点 (Key Features)

### 🔒 隐私保护 (Privacy Protection)
- **本地处理**: 所有数据处理都在浏览器本地进行 | All data processing happens locally in the browser
- **无服务器上传**: 不会将您的数据上传到任何服务器 | No data is uploaded to any server
- **安全可靠**: 开源代码，透明可审计 | Open source code, transparent and auditable

### 🎨 用户体验 (User Experience)
- **响应式设计**: 完美适配桌面端和移动端 | Perfect adaptation for desktop and mobile
- **暗色模式**: 支持明暗主题切换 | Support for light and dark theme switching
- **直观界面**: 简洁美观的用户界面 | Clean and beautiful user interface
- **快速响应**: 优化的性能，快速的响应速度 | Optimized performance with fast response

### 🛠️ 开发友好 (Developer Friendly)
- **TypeScript**: 完整的类型安全 | Complete type safety
- **模块化**: 清晰的代码结构和组件化设计 | Clear code structure and component-based design
- **可扩展**: 易于添加新的工具和功能 | Easy to add new tools and features
- **现代化**: 使用最新的前端技术栈 | Using the latest frontend technology stack

---

## 贡献指南 (Contributing)

本项目完全由[v0.dev](https://v0.dev)生成, 暂不接受任何贡献

This project is entirely generated by v0.dev and does not currently accept any contributions.

---

## 许可证 (License)

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 致谢 (Acknowledgments)

- 感谢所有开源库的贡献者 | Thanks to all open source library contributors
- 感谢 [Vercel](https://vercel.com) 提供的优秀部署平台 | Thanks to Vercel for the excellent deployment platform
- 感谢 [v0.dev](https://v0.dev) AI 助手的代码生成支持 | Thanks to v0.dev AI assistant for code generation support

---

## 联系方式 (Contact)

如果您有任何问题或建议，请通过以下方式联系我们：

If you have any questions or suggestions, please contact us through:

- 提交 Issue | Submit an Issue
- 发起 Discussion | Start a Discussion
- 发送邮件 | Send Email: [your-email@example.com]

---

> 本项目由 [v0.dev](https://v0.dev/) AI 生成，致力于为用户提供安全、便捷的在线工具体验。
> 
> This project is generated by [v0.dev](https://v0.dev/) AI, dedicated to providing users with safe and convenient online tool experience.
