# AI 同人小说生成器

> 基于 Astro + React + DeepSeek API 的全栈 AI 辅助同人小说创作平台

## 项目概述

AI 同人小说生成器是一个功能完善的 Web 应用，为同人小说创作者提供集**灵感激发、大纲规划、正文写作、角色管理、世界观设定**于一体的综合性创作工具。

### 核心特性

- **AI 辅助写作** - 实时流式生成，引导情节走向，自定义文风
- **角色与世界观管理** - 知识库 (Lorebook) 功能，确保长篇故事的一致性
- **多章节故事管理** - 组织和管理多章节、多条故事线
- **专注沉浸的写作体验** - Ethereal Dark Mode 设计，最小化干扰
- **本地 + 云端存储** - 游客模式使用 IndexedDB，登录用户使用 PostgreSQL
- **完整用户系统** - 基于 better-auth 的认证系统

## 技术栈

| 组件 | 技术选型 | 版本 | 说明 |
|:---|:---|:---|:---|
| **Web 框架** | [Astro](https://astro.build) | 5.x | 岛屿架构，SSR + SSG 混合 |
| **前端框架** | React | 19.x | 岛屿组件，复杂交互 |
| **样式系统** | [Tailwind CSS](https://tailwindcss.com) | 4.x | 原子化 CSS，Vite 集成 |
| **AI 集成** | [Vercel AI SDK](https://ai-sdk.dev) | 6.x | 流式生成，OpenAI 兼容 API |
| **认证系统** | [better-auth](https://www.better-auth.com) | 1.x | 完整的用户认证管理 |
| **数据库** | PostgreSQL + Drizzle ORM | - | 云端数据持久化 |
| **本地存储** | IndexedDB (idb) | 8.x | 游客模式数据存储 |
| **状态管理** | [Nanostores](https://nanostores.dev) | 1.x | 轻量级响应式状态 |

## 项目结构

```
ai-fanfiction-v2/
├── public/                      # 静态资源
├── src/
│   ├── components/              # React 组件 (岛屿)
│   │   ├── Dashboard.tsx       # 仪表盘组件
│   │   ├── Workbench.tsx       # 工作台组件
│   │   ├── AIGenerator.tsx     # AI 生成器
│   │   ├── StoryCard.tsx       # 故事卡片
│   │   ├── SigninForm.tsx      # 登录表单
│   │   ├── SignupForm.tsx      # 注册表单
│   │   └── SessionContext.tsx  # 会话上下文
│   ├── contexts/               # React 上下文
│   │   └── SessionContext.tsx
│   ├── db/                     # 数据库配置
│   │   ├── schema.ts           # Drizzle 数据模型
│   │   ├── index.ts            # 数据库连接
│   │   └── queries.ts          # 查询封装
│   ├── layouts/                # Astro 布局
│   │   └── BaseLayout.astro
│   ├── lib/                    # 工具库
│   │   ├── ai.ts              # AI SDK 配置
│   │   ├── apiService.ts      # API 服务封装
│   │   ├── stores.ts          # Nanostores 状态
│   │   ├── guestDataManager.ts # 游客数据管理
│   │   └── db.ts              # IndexedDB 封装
│   ├── pages/                  # 页面路由
│   │   ├── index.astro        # 首页
│   │   ├── signin.astro       # 登录页
│   │   ├── signup.astro       # 注册页
│   │   ├── auth.astro         # 认证页 (备用)
│   │   ├── dashboard.astro    # 用户仪表盘
│   │   ├── workbench.astro    # 工作台入口
│   │   ├── workbench/
│   │   │   ├── [story]/
│   │   │   │   ├── [chapter].astro  # 章节编辑
│   │   │   │   └── new.astro         # 新建章节
│   │   ├── lorebook.astro     # 知识库管理
│   │   ├── settings.astro     # 设置页面
│   │   └── api/               # API 路由
│   │       ├── generate.ts    # AI 生成
│   │       ├── auth/[...all].ts # 认证 API
│   │       ├── stories/       # 故事 CRUD
│   │       ├── chapters/      # 章节 CRUD
│   │       ├── lore/          # 知识库 CRUD
│   │       └── migrate/       # 数据迁移
│   ├── styles/                # 全局样式
│   │   └── global.css
│   ├── auth.ts                # 服务端认证配置
│   ├── auth-client.ts         # 客户端认证配置
│   ├── middleware.ts          # Astro 中间件
│   └── types.d.ts             # TypeScript 类型
├── package.json
├── astro.config.mjs
└── README.md
```

## 开发指南

### 环境要求

- Node.js >= 18.17.0
- PostgreSQL 数据库
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/ai_fanfiction

# DeepSeek API 配置
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com

# Better Auth 配置
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:4321

# 应用配置
PUBLIC_APP_URL=http://localhost:4321
```

### 数据库迁移

```bash
# 生成迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate

# 推送 schema (开发环境)
npm run db:push
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:4321

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 核心功能模块

### 1. 营销首页 (`/`)
- 动画星云背景
- 产品特性展示
- 动态 CTA (根据登录状态)
- 用户证言轮播

### 2. 用户认证 (`/signin`, `/signup`)
- 基于 better-auth 的完整认证系统
- Glassmorphism 卡片设计
- 表单验证与交互反馈
- 社交登录支持 (可扩展)

### 3. 用户仪表盘 (`/dashboard`)
- 故事项目网格展示
- 搜索与筛选功能
- 快速操作入口
- 空状态引导
- 响应式布局

### 4. 创作工作台 (`/workbench`)
- **动态路由**：`/workbench/[story]/[chapter]`
- 三栏布局：
  - 左侧：章节导航
  - 中间：富文本编辑器
  - 右侧：AI 控制面板
- AI 实时流式生成
- 场景指令输入
- 风格与基调控制
- 生成历史记录
- 自动保存

### 5. 知识库管理 (`/lorebook`)
- 角色与世界观管理
- 分类条目（角色/地点/物品）
- 属性键值对编辑
- 富文本描述
- 图片上传支持
- 折叠/展开分类

### 6. 设置页面 (`/settings`)
- 个人资料管理
- 账户安全设置
- AI 偏好设置
- 外观主题切换
- 标签式导航

### 7. API 路由

| 路由 | 方法 | 描述 |
|:---|:---|:---|
| `/api/generate` | POST | AI 文本生成 |
| `/api/auth/[...all]` | * | better-auth 处理器 |
| `/api/stories` | GET/POST | 故事列表/创建 |
| `/api/stories/[id]` | GET/PUT/DELETE | 单个故事操作 |
| `/api/stories/[storyId]/chapters` | GET/POST | 章节列表/创建 |
| `/api/chapters/[id]` | GET/PUT/DELETE | 单个章节操作 |
| `/api/stories/[storyId]/lore` | GET/POST | 知识库列表/创建 |
| `/api/lore/[id]` | GET/PUT/DELETE | 知识库条目操作 |
| `/api/migrate` | POST | 游客数据迁移 |

## 数据存储策略

### 游客模式 (未登录)
- 使用 **IndexedDB** 存储数据
- 通过 `guestDataManager.ts` 管理
- 登录后可迁移到云端

### 认证用户
- 使用 **PostgreSQL** 存储数据
- 通过 Drizzle ORM 操作
- 支持跨设备同步

## 设计系统

本项目采用统一的 "Ethereal Dark Mode" 设计系统：

| 颜色用途 | 色值 | 描述 |
|:---|:---|:---|
| 主背景 | `#12101D` | 深邃的近黑色紫调 |
| 卡片背景 | `rgba(28, 25, 41, 0.75)` | 毛玻璃效果 |
| 主文本 | `#EAE6F8` | 柔和的薰衣草白 |
| 次要文本 | `#A09CB8` | 中性灰紫 |
| 边框 | `#3A3651` | 深紫灰 |
| 强调渐变 | `linear-gradient(135deg, #8A2BE2, #4A00E0)` | 紫蓝渐变 |
| 危险色 | `#E05A5A` | 柔和红 |
| 成功色 | `#5AE08A` | 清新绿 |

### 字体
- **主字体**: Manrope (Google Fonts)
- **图标**: Lucide Icons

### 组件样式
- **毛玻璃卡片**: `backdrop-filter: blur(12px)`
- **主按钮**: 渐变背景 + 内阴影
- **次要按钮**: 透明背景 + 边框
- **输入框**: 焦点时紫色发光效果

## 架构特点

### Astro 岛屿架构
- 静态页面生成 (SEO 友好)
- 选择性水合 (仅交互组件使用 React)
- 零 JS 默认传输

### 认证流程
- better-auth 处理会话管理
- 中间件 (`middleware.ts`) 路由保护
- SessionContext 提供全局会话状态

### AI 集成
- Vercel AI SDK 统一流式接口
- 支持 DeepSeek / OpenAI 兼容 API
- 可扩展至其他 AI 提供商

## 部署方案

### Vercel (推荐)
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel deploy
```

环境变量配置：
- `DATABASE_URL`: PostgreSQL 连接字符串 (建议使用 Vercel Postgres)
- `DEEPSEEK_API_KEY`: DeepSeek API 密钥
- `BETTER_AUTH_SECRET`: 认证密钥

### 自托管 (VPS)
```bash
# 构建
npm run build

# 使用 PM2 启动
pm2 start dist/server/entry.mjs --name ai-fanfiction

# 配置 Nginx 反向代理
```

### Docker (可选)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4321
CMD ["npm", "run", "preview"]
```

## 后续开发计划

### 短期
- [ ] 完善单元测试
- [ ] 添加 E2E 测试 (Playwright)
- [ ] 优化 AI Prompt 模板
- [ ] 添加更多导出格式

### 中期
- [ ] 图片生成集成 (封面/插图)
- [ ] 协作编辑功能
- [ ] 社区分享平台
- [ ] 高级搜索与筛选

### 长期
- [ ] 积分/订阅制付费系统
- [ ] 移动端应用
- [ ] AI 角色对话
- [ ] 多语言支持

## 参考资料

- [Astro 文档](https://docs.astro.build)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [better-auth 文档](https://www.better-auth.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team)

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

---

**基于 Astro + React + Better Auth + Drizzle 构建**
