# AI 同人小说生成器

> 基于 Astro + React + DeepSeek API 的全栈 AI 辅助同人小说创作平台

## 项目概述

AI 同人小说生成器是一个功能完善的 Web 应用，为同人小说创作者提供集**灵感激发、大纲规划、正文写作、角色管理、世界观设定**于一体的综合性创作工具。

### 核心特性

- **AI 辅助写作** - 实时流式生成，引导情节走向，自定义文风
- **角色与世界观管理** - 知识库 (Lorebook) 功能，确保长篇故事的一致性
- **多章节故事管理** - 组织和管理多章节、多条故事线
- **专注沉浸的写作体验** - Ethereal Dark Mode 设计，最小化干扰
- **本地 + 云端存储** - 游客模式使用 localStorage，登录用户使用 PostgreSQL
- **完整用户系统** - 基于 better-auth 的认证系统
- **积分制消费** - 游客 10 积分体验，登录用户每月 10,000 积分

## 技术栈

| 组件 | 技术选型 | 版本 | 说明 |
|:---|:---|:---|:---|
| **Web 框架** | [Astro](https://astro.build) | 5.17.x | 岛屿架构，SSR + SSG 混合 |
| **前端框架** | React | 19.2.x | 岛屿组件，复杂交互 |
| **样式系统** | [Tailwind CSS](https://tailwindcss.com) | 4.2.x | 原子化 CSS，Vite 集成 |
| **AI 集成** | [Vercel AI SDK](https://ai-sdk.dev) | 6.x | 流式生成，React Hooks |
| **认证系统** | [better-auth](https://www.better-auth.com) | 1.4.x | 完整的用户认证管理 |
| **数据库** | PostgreSQL + Drizzle ORM | 0.45.x | 云端数据持久化 |
| **本地存储** | localStorage (浏览器端) | - | 游客模式数据存储 |
| **状态管理** | [Nanostores](https://nanostores.dev) | 1.1.x | 轻量级响应式状态 |
| **ID 生成** | CUID2 | 3.3.x | 安全的唯一标识符 |

## 项目结构

```
ai-fanfiction-v2/
├── public/                      # 静态资源
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── components/              # React 组件 (岛屿)
│   │   ├── Dashboard.tsx       # 仪表盘组件
│   │   ├── Workbench.tsx       # 工作台组件
│   │   ├── AIGenerator.tsx     # AI 生成器 (含积分控制与升级弹窗)
│   │   ├── StoryCard.tsx       # 故事卡片
│   │   ├── SigninForm.tsx      # 登录表单
│   │   ├── SignupForm.tsx      # 注册表单
│   │   └── GlobalNav.astro     # 全局导航栏
│   ├── contexts/               # React 上下文
│   │   └── SessionContext.tsx  # 会话状态管理
│   ├── db/                     # 数据库配置
│   │   ├── schema.ts           # Drizzle 数据模型
│   │   ├── index.ts            # 数据库连接
│   │   └── queries.ts          # 查询封装
│   ├── layouts/                # Astro 布局
│   │   └── BaseLayout.astro    # 基础布局
│   ├── lib/                    # 工具库
│   │   ├── ai.ts              # AI SDK 配置
│   │   ├── apiService.ts      # API 服务封装
│   │   ├── dataService.ts     # 数据访问服务
│   │   ├── stores.ts          # Nanostores 状态
│   │   └── guestDataManager.ts # 游客数据管理 (localStorage)
│   ├── pages/                  # 页面路由
│   │   ├── index.astro        # 首页 (营销页)
│   │   ├── signin.astro       # 登录页
│   │   ├── signup.astro       # 注册页
│   │   ├── auth.astro         # 认证页
│   │   ├── guest.astro        # 游客入口页 (客户端执行)
│   │   ├── dashboard.astro    # 用户仪表盘
│   │   ├── workbench/
│   │   │   └── [...all].astro # 工作台通配路由
│   │   ├── lorebook.astro     # 知识库管理
│   │   ├── settings.astro     # 设置页面
│   │   ├── features.astro     # 功能特性页
│   │   ├── pricing.astro      # 定价页
│   │   └── community.astro    # 社区页
│   ├── middleware.ts          # 路由中间件 (认证守卫)
│   ├── auth.ts               # 服务端认证配置
│   ├── auth-client.ts        # 客户端认证配置
│   └── types.d.ts            # TypeScript 类型定义
│   └── api/                   # API 路由
│       ├── generate.ts        # AI 生成
│       ├── auth/[...all].ts   # 认证 API
│       ├── user/
│       │   ├── subscription.ts # 用户订阅信息
│       │   └── profile.ts      # 用户资料
│       ├── migrate/           # 数据迁移
│       │   └── index.ts       # 游客数据迁移
│       ├── stories/           # 故事 CRUD
│       ├── chapters/          # 章节 CRUD
│       └── lore/              # 知识库 CRUD
├── docs/
│   └── GUEST_MODE.md          # 游客模式文档
├── migrations/
│   └── 001_create_tables.sql  # 数据库迁移
├── package.json
├── astro.config.mjs
├── tailwind.config.cjs
├── tsconfig.json
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
# DeepSeek API 配置
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Better Auth 配置
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:4321

# 数据库配置 (可选，本地开发可不配置)
# DATABASE_URL=postgresql://user:password@localhost:5432/ai_fanfiction

# 应用配置
PUBLIC_APP_URL=http://localhost:4321
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
- Glassmorphism 设计
- 导航至功能、定价、社区页面

### 2. 功能特性页 (`/features`)
展示六大核心功能：
- **AI Co-Writer** - 智能写作助手
- **Lorebook Manager** - 角色与世界观管理
- **Distraction-Free Editor** - 专注写作模式
- **Cloud Sync** - 云端同步
- **Guest Mode** - 游客体验模式
- **Multi-Chapter** - 多章节管理

### 3. 定价页 (`/pricing`)
三种订阅方案：
- **Free** - $0/月，10,000 积分/月，最多 3 个故事
- **Pro** - $9/月，100,000 积分/月，无限故事 (推荐)
- **Premium** - $29/月，无限积分，专属支持

### 4. 社区页 (`/community`)
- Discord 社区入口
- GitHub 开源贡献
- 社区权益说明

### 5. 用户认证 (`/signin`, `/signup`)
- 基于 better-auth 的完整认证系统
- 玻璃态卡片设计
- 表单验证与交互反馈
- 社交登录支持 (可扩展)

### 6. 用户仪表盘 (`/dashboard`)
- 故事项目网格展示
- 搜索与筛选功能
- 快速操作入口
- 空状态引导
- 响应式布局

### 7. 创作工作台 (`/workbench`)
- **通配符路由**：`/workbench/[...all]`
- 三栏布局：
  - 左侧：章节导航
  - 中间：富文本编辑器
  - 右侧：AI 控制面板
- AI 实时流式生成
- 场景指令输入
- 风格与基调控制
- 生成历史记录
- 自动保存

### 8. 知识库管理 (`/lorebook`)
- 角色与世界观管理
- 分类条目（角色/地点/物品）自动分组显示
- 属性键值对编辑
- 富文本描述
- 创建/编辑/删除条目功能
- 类型感知的图标和颜色
- 保存状态指示器
- 折叠/展开分类

### 9. 设置页面 (`/settings`)
- 订阅与账单信息显示
- 积分余额与重置日期
- 积分使用进度条
- 登出功能
- 个人资料管理
- 账户安全设置
- 标签式导航

### 10. 游客模式 (`/guest`)
- 客户端 localStorage 数据存储
- 自动生成游客故事 ID
- 无需注册即可体验完整功能
- 登录后可迁移数据到云端
- 初始 10 积分用于体验

## API 路由

| 路由 | 方法 | 描述 | 状态 |
|:---|:---|:---|:---|
| `/api/generate` | POST | AI 文本生成 | ✅ |
| `/api/auth/[...all]` | * | better-auth 处理器 | ✅ |
| `/api/user/subscription` | GET | 用户订阅与积分信息 | ✅ |
| `/api/user/profile` | GET | 用户资料 | ✅ |
| `/api/stories` | GET/POST | 故事列表/创建 | ✅ |
| `/api/stories/[id]` | GET/PUT/DELETE | 单个故事操作 | ✅ |
| `/api/stories/[storyId]/chapters` | GET/POST | 章节列表/创建 | ✅ |
| `/api/chapters/[id]` | GET/PUT/DELETE | 单个章节操作 | ✅ |
| `/api/stories/[storyId]/lore` | GET/POST | 知识库列表/创建 | ✅ |
| `/api/lore/[id]` | GET/PUT/DELETE | 知识库条目操作 | ✅ |
| `/api/migrate` | POST | 游客数据迁移 | ✅ |

## 数据库模型

### Stories (故事表)
```typescript
{
  id: string (主键)
  userId: string (用户ID)
  title: string (标题)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Chapters (章节表)
```typescript
{
  id: string (主键)
  storyId: string (外键 -> stories)
  title: string (标题)
  content: text (内容)
  order: number (排序)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Lore Entries (知识库条目表)
```typescript
{
  id: string (主键)
  storyId: string (外键 -> stories)
  name: string (名称)
  type: string (类型: character/location/item)
  description: text (描述)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### User Profiles (用户资料表)
```typescript
{
  id: string (主键，同 user.id)
  subscription: string (订阅类型: free/pro/premium)
  credits: integer (积分余额)
  creditsResetAt: timestamp (积分重置时间)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## 数据存储策略

### 游客模式 (未登录)
- 使用 **localStorage** 存储数据（浏览器端）
- 通过 `guestDataManager.ts` 管理
- 游客故事 ID 格式：`guest_story_{timestamp}`
- 初始 10 积分用于体验
- 登录后可迁移到云端

### 认证用户
- 使用 **PostgreSQL** 存储数据
- 通过 Drizzle ORM 操作
- 支持跨设备同步
- 每月 10,000 积分（Free 用户）

### 游客入口流程

1. **访问 `/guest` 页面**
   - 自动生成游客故事 ID
   - 数据存储在浏览器 localStorage 中
   - 自动重定向到 `/workbench/{guest_story_id}`

2. **工作台访问**
   - workbench 认证守卫检测游客故事 ID 前缀
   - 允许未认证用户访问其游客故事
   - 提供与认证用户相同的功能体验

3. **数据迁移**
   - 登录后可将游客数据迁移到云端
   - 调用 `/api/migrate` 端点完成迁移
   - 迁移后数据存储在 PostgreSQL 中

## 积分系统

### 游客用户
- 初始积分：10
- 每次生成消耗：1 积分
- 不支持充值

### Free 订阅
- 每月积分：10,000
- 每次生成消耗：1 积分
- 最多创建 3 个故事

### Pro 订阅 ($9/月)
- 每月积分：100,000
- 无限故事数量

### Premium 订阅 ($29/月)
- 无限积分
- 无限故事数量
- 专属支持

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
- `client:load` 指令控制水合时机

### 认证流程
- better-auth 处理会话管理
- 中间件 (`middleware.ts`) 路由保护
- SessionContext 提供全局会话状态
- 服务端和客户端分离配置

### AI 集成
- Vercel AI SDK 统一流式接口
- `@ai-sdk/react` 提供 React Hooks
- 支持 DeepSeek / OpenAI 兼容 API
- 可扩展至其他 AI 提供商

### 路由策略
- 静态页面: `index.astro`, `features.astro`, `pricing.astro`, `community.astro`
- 需认证页面: `dashboard.astro` (中间件保护)
- 动态路由: `workbench/[...all].astro` (通配符路由)
- API 路由: `/api/*` (后端逻辑)

## 部署方案

### Vercel (推荐)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel deploy
```

**环境变量配置**：
- `DATABASE_URL`: PostgreSQL 连接字符串 (建议使用 Vercel Postgres)
- `DEEPSEEK_API_KEY`: DeepSeek API 密钥
- `DEEPSEEK_BASE_URL`: `https://api.deepseek.com`
- `BETTER_AUTH_SECRET`: 认证密钥
- `BETTER_AUTH_URL`: 部署后的完整 URL
- `PUBLIC_APP_URL`: 部署后的完整 URL

**vercel.json** 配置示例：
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### 自托管 (VPS)

```bash
# 构建
npm run build

# 使用 PM2 启动
pm2 start dist/server/entry.mjs --name ai-fanfiction

# 配置 Nginx 反向代理
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://localhost:4321;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### Docker (可选)

**Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "4321:4321"
    environment:
      - DATABASE_URL=postgresql://...
      - DEEPSEEK_API_KEY=...
      - BETTER_AUTH_SECRET=...
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ai_fanfiction
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

## 开发状态

### 已完成的核心功能 (✅ 全部完成)

| 步骤 | 功能描述 | 状态 |
|:---|:---|:---|
| **步骤一** | AI 生成 API 认证控制 | ✅ 完成 |
| **步骤二** | AI 生成器积分控制与升级弹窗 | ✅ 完成 |
| **步骤三** | 数据库查询语法修复 & Lore PUT 端点 | ✅ 完成 |
| **步骤四** | 知识库页面动态 CRUD 激活 | ✅ 完成 |
| **步骤五** | 设置页面用户功能激活 | ✅ 完成 |
| **步骤六** | 营销页面 (首页/功能/定价/社区) | ✅ 完成 |

### 关键 Bug 修复 (✅ 全部修复)

| Bug | 描述 | 修复方案 | 状态 |
|:---|:---|:---|:---|
| **游客入口报错** | `guestDataManager is not defined` | 将 guest.astro 转换为纯客户端执行 | ✅ 已修复 |
| **游客入口死循环** | `/guest → /workbench → /signin` 循环 | workbench 认证守卫增加游客故事检测 | ✅ 已修复 |

## 后续开发计划

### 近期计划 (1-2 周)
- [ ] 完善单元测试 (Vitest)
- [ ] 添加 E2E 测试 (Playwright)
- [ ] 优化 AI Prompt 模板
- [ ] 添加更多导出格式 (PDF, EPUB)
- [ ] 添加用户头像上传功能
- [ ] 改进移动端响应式布局

### 中期计划 (1-2 月)
- [ ] 图片生成集成 (封面/插图)
- [ ] 协作编辑功能
- [ ] 社区分享平台
- [ ] 高级搜索与筛选
- [ ] 移动端优化 (PWA)
- [ ] AI 角色对话功能
- [ ] 故事模板库

### 长期计划 (3-6 月)
- [ ] 积分/订阅制付费系统完整实现
- [ ] 移动端应用 (React Native)
- [ ] 多语言支持 (i18n)
- [ ] 插件系统
- [ ] AI 模型选择 (OpenAI/Claude/本地模型)
- [ ] 故事分析与统计功能

## 参考资料

- [Astro 文档](https://docs.astro.build)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [better-auth 文档](https://www.better-auth.com/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team)
- [React 19 文档](https://react.dev)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**基于 Astro 5.17 + React 19 + Better Auth + Drizzle + Tailwind CSS 4 构建**
