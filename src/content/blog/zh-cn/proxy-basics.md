---
title: HTTP 与 SOCKS5：选对代理，再验证连接
description: 理解两种常见代理协议，用 curl 检查出口 IP，避免把“已配置”当成“已生效”。
publishedAt: 2026-10-13
category: proxy-ip
tags: [SOCKS5, HTTP, 配置指南]
featured: true
---

这是一篇入门示例教程。完成后，你应该能区分 HTTP 与 SOCKS5，并用一条请求确认代理是否工作。

## 1. 准备条件

- 一台安装了 curl 的电脑。Windows PowerShell 中建议使用 `curl.exe`，避免旧版本的命令别名。
- 一个你有权使用的代理端点，以及它的协议、地址、端口与认证方式。
- 下文以本机 `127.0.0.1:1080` 为例，请替换为你的真实端点。

> 不要把用户名、密码或带认证信息的截图提交到公开仓库。命令示例不包含真实凭据。

## 2. 选择协议

| 协议 | 常见用途 | 需要注意 |
| --- | --- | --- |
| HTTP | 浏览器与支持 HTTP 代理的客户端 | HTTPS 通常通过 CONNECT 隧道转发，取决于代理服务是否支持 |
| SOCKS5 | 支持 SOCKS 的网络客户端 | 本机解析与代理端解析 DNS 的行为可能不同 |

代理配置只影响采用该配置的客户端。命令行请求成功，并不意味着浏览器也自动使用同一个代理。

![请求从客户端经过代理，再到达目标服务的示意图](/images/tutorials/proxy-flow.svg)

## 3. 先记录直连出口

Windows PowerShell：

```powershell
curl.exe --noproxy "*" --connect-timeout 10 --max-time 20 https://api.ipify.org
```

macOS / Linux 可以把 `curl.exe` 换成 `curl`。`--noproxy "*"` 用于绕过 curl 的显式代理设置；系统级隧道仍可能影响出口。

## 4. 使用代理发起请求

### SOCKS5 示例

```powershell
curl.exe --proxy socks5h://127.0.0.1:1080 --connect-timeout 10 --max-time 20 https://api.ipify.org
```

`socks5h` 表示目标域名由代理端解析。若使用 `socks5`，curl 会在本机解析目标域名。

### HTTP 示例

```powershell
curl.exe --proxy http://127.0.0.1:8080 --connect-timeout 10 --max-time 20 https://api.ipify.org
```

这个端口必须提供 HTTP 代理服务，不能只是把 SOCKS5 端口改写成 HTTP。

## 5. 验证结果

请求返回一个 IP 地址，说明这次请求成功获得了出口信息。比较直连和代理请求的结果，并核对代理供应方预期的出口。

两次结果相同不一定表示代理失效：同出口代理、系统级隧道等情况都可能产生相同结果。必要时结合代理客户端日志检查请求是否被接收。

## 常见问题

- **连接被拒绝**：检查服务是否启动，地址和端口是否正确。
- **返回 407**：通常需要代理认证，查阅服务方提供的认证方法。
- **连接超时**：分别检查到代理的连接与代理到目标服务的连接。
- **浏览器出口没变化**：浏览器可能未使用命令行中的代理配置，需单独设置并验证。

接下来可以阅读[网络检测教程](/blog/network-checklist/)，把出口验证扩展到 DNS 与连通性检查。
