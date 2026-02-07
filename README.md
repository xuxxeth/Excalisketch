# Excalisketch — Excalidraw-style Whiteboard Recorder

GitHub: [https://github.com/xuxxeth/Excalisketch](https://github.com/xuxxeth/Excalisketch)

## 1. 项目概述
Excalisketch 是一个面向“可视化讲解”的白板录制应用。它将 Excalidraw 风格的白板绘制与摄像头画中画叠加，并输出可下载的视频文件。项目目标是提供类似 Excalicord 的体验：轻量、直观、可快速录制讲解视频。

核心能力：
- Excalidraw 白板绘制
- 摄像头画中画（可拖拽、调大小、圆角）
- 录制输出（合成：背景 + 白板 + 摄像头 + 鼠标高亮）
- 提词器面板（录制不包含文本）
- 录制设置（比例、背景、圆角、边距、光标效果）

---

## 2. 使用方式

### 2.1 开发运行
```bash
cd /Users/xuyanjun/workspace/mp/excalicord-clone
npm run dev
```

访问：
```
http://localhost:3000
```

### 2.2 功能操作
- 白板：直接在画布上绘制、拖拽元素
- 摄像头气泡：点击并拖拽位置
- 录制：点击右上角 `Record` / `Stop`
- 下载录制：录制停止后点击下载按钮
- 提词器：右上角按钮打开/关闭
- 设置：右上角齿轮打开设置面板

---

## 3. 技术选型

### 3.1 前端框架
- **Next.js 16 (App Router)**  
  负责 SPA 页面、构建、开发热更新

### 3.2 UI / 交互
- **Tailwind CSS**  
  快速构建 UI 样式
- **shadcn/ui**  
  用于弹窗、按钮、滑块等基础 UI 组件
- **Radix UI**  
  shadcn/ui 依赖的底层无样式组件库

### 3.3 白板绘制
- **@excalidraw/excalidraw**  
  提供专业白板绘制能力

### 3.4 录制与合成
- **MediaRecorder API**  
  浏览器端录制视频输出  
- **Canvas 组合渲染**  
  将白板、摄像头、光标效果合成到一个离屏 canvas

---

## 4. 架构与实现要点

### 4.1 主要页面结构
- `src/app/page.tsx`  
  负责所有 UI、交互与录制逻辑
- `src/app/layout.tsx`  
  引入全局 CSS 和 Excalidraw 样式

### 4.2 录制流程
1. 获取 Excalidraw 的 canvas 节点
2. 创建离屏录制 canvas（recordCanvas）
3. 每帧绘制：
   - 背景
   - 白板画布
   - 摄像头视频
   - 鼠标高亮
4. 使用 `MediaRecorder` 输出录制文件

---

## 5. 开发过程中遇到的问题与解决方案

### 5.1 npm 权限问题（EACCES）
**现象**：
```
npm error EACCES: permission denied, rename '/Users/xuyanjun/.npm/...'
```

**原因**：本机 npm 缓存目录权限异常。

**解决方案**：
- 避免 sudo，改用项目本地缓存：
```
npm_config_cache=/Users/xuyanjun/workspace/mp/excalicord-clone/.npm-cache
```

---

### 5.2 shadcn/ui 初始化失败
**现象**：
```
A components.json file already exists
```

**原因**：初始化未完成时残留组件配置。

**解决方案**：
- 删除 `components.json`
- 重新运行 `shadcn init`

---

### 5.3 Excalidraw CSS 引入报错
**现象**：
```
"./dist/excalidraw.min.css" is not exported under the condition "style"
```

**原因**：Excalidraw 包只导出了 `index.css`，不能直接 import dist 文件。

**解决方案**：
在 `layout.tsx` 中引入：
```ts
import "@excalidraw/excalidraw/index.css";
```

---

### 5.4 lucide-react 图标不存在
**现象**：
```
Export RecordDot doesn't exist in target module
```

**原因**：图标名称不存在。

**解决方案**：
替换为：
```tsx
<Circle className="fill-red-500 text-red-500" />
```

---

## 6. 后续可扩展方向
- 白板内容保存/加载
- 导出图片 / 工程文件
- 提词器自动滚动
- 输出格式控制（分辨率/帧率/编码）
- 背景素材库（分类/搜索）

---

## 7. 项目命名与 SEO
项目名称：**Excalisketch**  
SEO 已配置：
- title
- description
- OpenGraph / Twitter

文件：
- `src/app/layout.tsx`

---

## 8. 主要文件路径
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
