# AI 同人小说生成器

> 一个基于 Astro 和 DeepSeek API 的全栈 AI 辅助同人小说创作平台

## 项目概述

AI 同人小说生成器是一个功能完善、用户体验优秀的 Web 应用，旨在为同人小说创作者提供集**灵感激发、大纲规划、正文写作、角色管理、世界观设定**于一体的综合性创作伴侣。

### 核心特性

- **AI 辅助写作** - 实时流式生成，引导情节走向，自定义文风
- **角色与世界观管理** - 知识库(Lorebook)功能，确保长篇故事中角色性格和背景设定的一致性
- **多章节故事管理** - 组织和管理多章节、多条故事线的内容
- **专注沉浸的写作体验** - 现代化的暗色系 UI 设计，最小化干扰
- **本地数据存储** - 使用 IndexedDB 进行客户端数据持久化

## 技术栈

| 组件 | 技术选型 | 说明 |
|:---|:---|:---|
| **Web 框架** | [Astro](https://astro.build) | 采用岛屿架构，兼顾性能与开发效率 |
| **前端交互** | React + Tailwind CSS | 构建复杂交互界面，原子化 CSS 开发 |
| **AI 集成** | [Vercel AI SDK](https://ai-sdk.dev) | 流式文本生成，支持 OpenAI 兼容 API |
| **状态管理** | Nanostores | 轻量级状态管理方案 |
| **数据存储** | IndexedDB (idb) | 客户端数据持久化 |
| **样式系统** | Tailwind CSS v4 | Ethereal Dark Mode 设计系统 |

## 项目结构

```
ai-fanfiction-v2/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React 组件
│   ├── layouts/           # Astro 布局组件
│   │   └── BaseLayout.astro
│   ├── pages/             # 页面路由
│   │   ├── index.astro    # 首页
│   │   ├── auth.astro     # 登录/注册页
│   │   ├── dashboard.astro # 用户仪表盘
│   │   ├── workbench.astro # 创作工作台
│   │   ├── lorebook.astro  # 知识库管理
│   │   └── settings.astro  # 设置页面
│   └── styles/            # 全局样式
│       └── global.css
├── package.json
└── README.md
```

## 开发指南

### 环境要求

- Node.js >= 18.17.0
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
DEEPSEEK_API_BASE=https://api.deepseek.com

# 可选：应用配置
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

### 1. 营销首页 (Landing Page)
- 动画星云背景
- 产品特性展示
- 用户证言轮播
- 注册引导 CTA

### 2. 用户认证 (Auth)
- 登录/注册页面
- Glassmorphism 卡片设计
- 表单验证与交互反馈

### 3. 用户仪表盘 (Dashboard)
- 故事项目网格展示
- 搜索与筛选功能
- 快速操作入口
- 空状态引导

### 4. 创作工作台 (Workbench)
- 三栏布局：章节导航 | 主编辑器 | AI 控制面板
- 富文本编辑器
- AI 实时流式生成
- 场景指令输入
- 风格与基调控制
- 生成历史记录

### 5. 知识库 (Lorebook)
- 角色与世界观管理
- 分类条目（角色/地点/物品/势力/设定）
- 属性键值对编辑
- 关联上下文注入

### 6. 设置页面 (Settings)
- 个人资料管理
- 账户安全设置
- AI 偏好设置
- 外观主题切换

## 设计系统

本项目采用统一的 "Ethereal Dark Mode" 设计系统：

- **主背景**: `#12101D` - 深邃的近黑色紫调
- **卡片背景**: `rgba(28, 25, 41, 0.75)` - 毛玻璃效果
- **主文本**: `#EAE6F8` - 柔和的薰衣草白
- **次要文本**: `#A09CB8`
- **强调渐变**: `linear-gradient(135deg, #8A2BE2, #4A00E0)`
- **字体**: Manrope (Google Fonts)

## 后续开发计划

- [ ] 实现完整的用户认证系统
- [ ] 集成 Astro DB 后端数据库
- [ ] 添加故事导出功能 (ePub/Mobi)
- [ ] 社区分享与协作功能
- [ ] 图片生成集成 (封面/插图)
- [ ] 高级 Prompt 模板系统
- [ ] 积分/订阅制付费系统

## 部署方案

### Vercel / Netlify (推荐)
```bash
# 关联 GitHub 仓库后自动部署
# 或使用 CLI
vercel deploy
```

### 自托管 (VPS)
```bash
# 构建
npm run build

# 使用 PM2 启动
pm2 start dist/server/entry.mjs

# 配置 Nginx 反向代理
```

## 参考资料

- [Astro 文档](https://docs.astro.build)
- [Vercel AI SDK 文档](https://ai-sdk.dev/docs)
- [Tailwind CSS v4 文档](https://tailwindcss.com/docs)

## 许可证

MIT

---

**项目基于 Manus AI 的《AI 同人小说生成器开发大纲》与《前端 UI 设计提示词全集》构建**
