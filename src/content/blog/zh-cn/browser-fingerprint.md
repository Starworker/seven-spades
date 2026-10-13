---
title: 浏览器指纹入门：先读懂自己的环境信息
description: 从语言、时区、屏幕与设备信息开始，理解浏览器指纹能观察什么，以及检测结果的边界。
publishedAt: 2026-10-11
category: browser-fingerprint
tags: [Chrome, 隐私, 浏览器环境]
featured: true
---

浏览器指纹是由多项环境特征组成的观察结果，不是浏览器里的一个固定编号。这篇示例教程只读取本机信息，不修改配置。

## 1. 准备条件

使用新版 Chrome、Edge 或 Firefox。打开一个你信任的普通网页，并在开发者工具中切换到 Console（控制台）。

> 只运行你理解的代码。不要根据陌生网页的提示粘贴用于解除浏览器保护的命令。

## 2. 查看基础环境

以下代码不访问网络，只将部分浏览器特征打印在控制台：

```javascript
const environment = {
  userAgent: navigator.userAgent,
  languages: navigator.languages,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  screen: `${screen.width} × ${screen.height}`,
  pixelRatio: window.devicePixelRatio,
  logicalProcessors: navigator.hardwareConcurrency,
};
console.table(environment);
```

这些字段可能因为浏览器隐私策略而被简化或固定，不能将它们当成精确硬件检测结果。

## 3. 对照实际设置

记录浏览器语言、系统时区、屏幕缩放比例与窗口所在显示器。检查控制台中的字段是否与环境相符。

- `languages` 是语言偏好列表，不代表用户国籍。
- `timezone` 通常来自系统设置，不代表真实地理位置。
- `screen` 使用 CSS 像素，不一定是显示器的物理分辨率。
- `hardwareConcurrency` 是浏览器报告的逻辑处理器数量，可能经过限制。

## 4. 比较不同浏览模式

在普通窗口与隐私窗口分别记录同样的信息。你可能发现很多特征完全一致，因为隐私窗口通常仍使用同一设备与系统环境。

隐私窗口主要改变会话与本地数据的处理方式，并不能保证指纹不同或无法关联。

## 5. 验证与记录

把两次结果放在自己的本地笔记中，标记浏览器版本和时间。若使用第三方检测网站，先了解它会收集与保留哪些数据。

## 常见问题

“唯一性分数”依赖检测网站的样本集合和算法。不同网站的分数不宜直接比较，也不能据此保证匿名性。浏览器指纹还可能包括图形渲染等更多维度，这里的基础字段只是入门观察。
