# Curl 修改工具 - 浏览器插件

一个强大的 Curl 请求修改和测试工具浏览器插件，支持字段动态修改、批量发送等功能。

## 功能特性

- 🔧 **Curl 解析与修改** - 自动解析 Curl 命令，支持动态修改字段值
- 📦 **字段修改器** - 支持固定值、随机整数、随机字符串、随机日期等多种修改类型
- 🚀 **批量发送** - 支持一次性发送多个请求，实时查看结果
- 💾 **接口保存** - 保存常用接口，快速加载使用
- 🌓 **暗色模式** - 支持明暗主题切换
- 📋 **页面注入** - 在任意页面快速捕获和复制网络请求为 Curl 命令

## 安装方法

### 从源代码构建

```bash
# 进入 client 目录
cd client

# 安装依赖
pnpm install

# 构建扩展
pnpm build:extension
```

### 加载扩展到 Chrome

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 打开右上角的 "开发者模式"
3. 点击 "加载已解压的扩展程序"
4. 选择 `client/dist` 文件夹

### 打包扩展（可选）

```bash
cd client
pnpm package:extension
```

## 使用说明

### Popup 模式（快捷使用）

1. 点击浏览器工具栏中的插件图标
2. 粘贴 Curl 命令或从已保存的接口中选择
3. 点击"保存接口"保存当前命令

### 完整版模式（完整功能）

1. 在 Popup 中点击"完整版"按钮
2. 或访问扩展的 `index.html` 页面

在完整版中，您可以：
- 解析和修改 Curl 命令
- 配置字段修改器
- 批量发送请求
- 查看响应结果

### 页面注入功能

在任意网页中：
1. 点击右下角的浮动按钮
2. 查看捕获的网络请求
3. 点击请求复制为 Curl 命令

## 项目结构

```
client/
├── src/
│   ├── popup/          # Popup 组件（快捷面板）
│   ├── background/     # Background Service Worker
│   ├── content/        # Content Script（页面注入）
│   ├── components/     # React 组件
│   ├── hooks/          # 自定义 Hooks
│   ├── store/          # Zustand 状态管理
│   ├── types/          # TypeScript 类型
│   └── utils/          # 工具函数
├── manifest.json       # 扩展清单文件
├── popup.html          # Popup 页面
├── index.html          # 完整版页面
└── dist/               # 构建输出目录
```

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **图标**: Lucide React
- **扩展 API**: Chrome Extension Manifest V3

## 开发命令

```bash
# 开发模式
pnpm dev

# 构建扩展
pnpm build:extension

# 打包为 zip
pnpm package:extension

# 代码检查
pnpm lint
pnpm format
```

## 许可证

MIT
