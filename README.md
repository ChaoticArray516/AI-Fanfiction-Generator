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
│   │   └── SignupForm.tsx      # 注册表单
│   ├── contexts/               # React 上下文
│   │   └── SessionContext.tsx  # 会话状态管理
│   ├── db/                     # 数据库配置
│   │   ├── schema.ts           # Drizzle 数据模型
│   │   ├── index.ts            # 数据库连接
│   │   └── queries.ts          # 查询封装 (含积分更新语法修复)
│   ├── layouts/                # Astro 布局
│   │   └── BaseLayout.astro    # 基础布局
│   ├── lib/                    # 工具库
│   │   ├── ai.ts              # AI SDK 配置
│   │   ├── apiService.ts      # API 服务封装
│   │   ├── dataService.ts     # 数据访问服务
│   │   ├── stores.ts          # Nanostores 状态
│   │   └── guestDataManager.ts # 游客数据管理 (localStorage)
│   ├── pages/                  # 页面路由
│   │   ├── index.astro        # 首页
│   │   ├── signin.astro       # 登录页
│   │   ├── signup.astro       # 注册页
│   │   ├── auth.astro         # 认证页 (备用)
│   │   ├── guest.astro        # 游客入口页 (客户端执行)
│   │   ├── dashboard.astro    # 用户仪表盘
│   │   ├── workbench/
│   │   │   └── [...all].astro # 工作台通配路由 (含游客认证检测)
│   │   ├── lorebook.astro     # 知识库管理 (动态 CRUD 已激活)
│   │   ├── settings.astro     # 设置页面 (含用户信息加载与登出)
│   │   ├── features.astro     # 功能特性页
│   │   ├── pricing.astro      # 定价页
│   │   └── community.astro    # 社区页
│   └── api/                   # API 路由
│       ├── generate.ts        # AI 生成 (含认证与积分控制)
│       ├── auth/[...all].ts   # 认证 API
│       ├── user/
│       │   └── subscription.ts # 用户订阅信息
│       ├── migrate/           # 数据迁移
│       │   └── index.ts       # 游客数据迁移
│       ├── stories/           # 故事 CRUD
│       ├── chapters/          # 章节 CRUD
│       └── lore/              # 知识库 CRUD
│           ├── [storyId]/index.ts  # 知识库列表
│           └── [id].ts        # 单个条目操作 (含 PUT 更新)
├── docs/
│   └── GUEST_MODE.md          # 游客模式文档
├── migrations/
│   └── 001_create_tables.sql  # 数据库迁移
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

### 2. 用户认证 (`/signin`, `/signup`)
- 基于 better-auth 的完整认证系统
- 玻璃态卡片设计
- 表单验证与交互反馈
- 社交登录支持 (可扩展)

### 3. 功能特性页 (`/features`)
- 产品功能详细展示
- 图文并茂的介绍
- 响应式布局

### 4. 定价页 (`/pricing`)
- 价格方案展示
- 功能对比
- 订阅按钮

### 5. 社区页 (`/community`)
- 社区介绍
- 用户作品展示
- 讨论区入口

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
- **已激活动态 CRUD 功能**
- 角色与世界观管理
- 分类条目（角色/地点/物品）自动分组显示
- 属性键值对编辑
- 富文本描述
- 创建/编辑/删除条目功能
- 类型感知的图标和颜色
- 保存状态指示器
- 折叠/展开分类

### 9. 设置页面 (`/settings`)
- **已激活用户功能**
- 订阅与账单信息显示（动态加载）
- 积分余额与重置日期
- 积分使用进度条
- 登出功能
- 个人资料管理
- 账户安全设置
- AI 偏好设置
- 外观主题切换
- 标签式导航

### 10. 游客模式 (`/guest`)
- **已修复并完全可用**
- 客户端 localStorage 数据存储
- 自动生成游客故事 ID (`guest_story_{timestamp}_{random}`)
- 无需注册即可体验完整功能
- 登录后可迁移数据到云端
- 与认证用户相同的工作台体验

### 11. API 路由

| 路由 | 方法 | 描述 | 状态 |
|:---|:---|:---|:---|
| `/api/generate` | POST | AI 文本生成 (含认证与积分控制) | ✅ 完成 |
| `/api/auth/[...all]` | * | better-auth 处理器 | ✅ 完成 |
| `/api/user/subscription` | GET | 用户订阅与积分信息 | ✅ 完成 |
| `/api/stories` | GET/POST | 故事列表/创建 | ✅ 完成 |
| `/api/stories/[id]` | GET/PUT/DELETE | 单个故事操作 | ✅ 完成 |
| `/api/stories/[storyId]/chapters` | GET/POST | 章节列表/创建 | ✅ 完成 |
| `/api/chapters/[id]` | GET/PUT/DELETE | 单个章节操作 | ✅ 完成 |
| `/api/stories/[storyId]/lore` | GET/POST | 知识库列表/创建 | ✅ 完成 |
| `/api/lore/[id]` | GET/PUT/DELETE | 知识库条目操作 (含 PUT) | ✅ 完成 |
| `/api/migrate` | POST | 游客数据迁移 | ✅ 完成 |

## 数据存储策略

### 游客模式 (未登录)
- 使用 **localStorage** 存储数据（浏览器端）
- 通过 `guestDataManager.ts` 管理
- 游客故事 ID 格式：`guest_story_{timestamp}_{random}`
- 登录后可迁移到云端
- 无需注册即可体验完整功能

### 认证用户
- 使用 **PostgreSQL** 存储数据
- 通过 Drizzle ORM 操作
- 支持跨设备同步
- AI 生成消耗积分系统（每次 100 积分）
- 积分不足时显示升级弹窗

### 游客入口流程

游客用户可以通过以下路径进入应用：

1. **访问 `/guest` 页面**
   - 自动生成游客故事 ID（格式：`guest_story_{timestamp}_{random}`）
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

## 开发状态与完成记录

### 已完成的核心功能 (✅ 全部完成)

| 步骤 | 功能描述 | 状态 | 完成时间 |
|:---|:---|:---|:---|
| **步骤一** | AI 生成 API 认证控制 | ✅ 完成 | 上一会话 |
| **步骤二** | AI 生成器积分控制与升级弹窗 | ✅ 完成 | 上一会话 |
| **步骤三** | 数据库查询语法修复 & Lore PUT 端点 | ✅ 完成 | 上一会话 |
| **步骤四** | 知识库页面动态 CRUD 激活 | ✅ 完成 | 已完成 |
| **步骤五** | 设置页面用户功能激活 | ✅ 完成 | 已完成 |

### 关键 Bug 修复 (✅ 全部修复)

| Bug | 描述 | 修复方案 | 状态 |
|:---|:---|:---|:---|
| **游客入口报错** | `guestDataManager is not defined` | 将 guest.astro 转换为纯客户端执行 | ✅ 已修复 |
| **游客入口死循环** | `/guest → /workbench → /signin` 循环 | workbench 认证守卫增加游客故事检测 | ✅ 已修复 |

### 最近更新详情

#### 步骤四：知识库页面激活 (已完成)
- ✅ 为交互元素添加 ID 属性
- ✅ 实现客户端数据获取 (`/api/lore?storyId={id}`)
- ✅ 动态渲染侧边栏条目（按类型分组）
- ✅ 实现 CRUD 操作（创建、读取、更新、删除）
- ✅ 类型感知的图标和颜色（角色/地点/物品）
- ✅ 保存状态指示器

#### 步骤五：设置页面激活 (已完成)
- ✅ 添加登出按钮
- ✅ 实现用户数据加载 (`/api/user/subscription`)
- ✅ 显示订阅类型与积分余额
- ✅ 计算并显示积分重置日期
- ✅ 积分使用进度条
- ✅ 登出功能 (`/api/auth/sign-out`)

#### 游客模式修复 (已完成)
- ✅ 修复 `guestDataManager is not defined` 错误
- ✅ 将 guest.astro 改为纯客户端 JavaScript 执行
- ✅ localStorage 直接访问，避免服务端依赖
- ✅ 修复游客入口死循环问题
- ✅ workbench 认证守卫增加 `isGuestStory` 检测
- ✅ 游客故事 ID 格式：`guest_story_{timestamp}_{random}`

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
- `BETTER_AUTH_SECRET`: 认证密钥
- `BETTER_AUTH_URL`: 部署后的完整 URL

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
- [ ] 积分/订阅制付费系统 (基础已完成)
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

**基于 Astro 5.17 + React 19 + Better Auth + Drizzle 构建**
