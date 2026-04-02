# Curl 修改工具

一个用于修改和批量发送 curl 请求的现代化 Web 工具。

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **后端**: Express.js
- **包管理**: pnpm + monorepo
- **代码质量**: ESLint + Prettier

## 功能特性

- 解析 curl 命令
- 可视化编辑 JSON body 字段
- 支持多种字段修改器：
  - 固定值
  - 随机整数
  - 随机字符串（中文/英文/数字/混合）
  - 随机日期
  - 随机手机号
  - 随机邮箱
  - 随机网址
  - 列表选择
- 可编辑请求 Headers
- 批量发送请求
- 已保存接口管理
- 深色/浅色主题切换
- 左右面板可折叠

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发环境

在一个终端启动后端服务器：

```bash
pnpm server
```

在另一个终端启动前端开发服务器：

```bash
pnpm dev
```

然后在浏览器中打开: http://localhost:5173

### 构建生产版本

```bash
pnpm build
```

## 项目结构

```
curl-modify-web/
├── client/          # React 前端应用
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── store/
│   └── package.json
├── server/          # Express 后端
│   ├── server.js
│   └── package.json
└── package.json     # 根目录 monorepo 配置
```

## 脚本命令

- `pnpm dev` - 启动前端开发服务器
- `pnpm build` - 构建前端生产版本
- `pnpm server` - 启动后端服务器
- `pnpm lint` - 运行 ESLint 检查
- `pnpm lint:fix` - 自动修复 ESLint 问题
- `pnpm format` - 运行 Prettier 格式化

## 旧版本备份

原始的纯 HTML + JavaScript 版本已备份为 `index.html.old`。
