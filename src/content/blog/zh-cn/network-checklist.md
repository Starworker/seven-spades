---
title: 网络出了问题？按这四步检查连通性与 DNS
description: 从 DNS 解析、端口连接到 HTTP 请求与出口 IP，逐层缩小问题范围。
publishedAt: 2026-10-12
updatedAt: 2026-10-13
category: network-check
tags: [DNS, 网络排查, 配置指南]
featured: true
---

“打不开网页”不是一个足够精确的故障描述。这篇示例教程以 Windows PowerShell 为例，帮助你将问题拆解到不同层次。

## 1. 准备与记录

记下出错域名、发生时间、当前网络及代理状态。以下使用 `example.com`，实际排查时请替换成目标网站。

![网络排查的四个层次：DNS、TCP、HTTP、出口 IP](/images/tutorials/network-check.svg)

## 2. 检查 DNS 解析

```powershell
Resolve-DnsName example.com
```

查看是否返回地址记录。解析失败时，先核对域名拼写与网络连接，再检查 DNS 服务器是否可达。

若需要与指定 DNS 服务器比较：

```powershell
Resolve-DnsName example.com -Server 1.1.1.1
```

指定 DNS 服务器可能被当前网络限制。两个服务器返回不同地址也不一定异常，CDN 与地域调度会影响结果。

## 3. 检查目标端口

```powershell
Test-NetConnection example.com -Port 443
```

关注 `TcpTestSucceeded`。`True` 表示 TCP 连接成功，不能据此断言证书、登录或页面内容都正常。此命令不会自动沿用浏览器的 HTTP/SOCKS 代理。

## 4. 检查 HTTP 请求

```powershell
curl.exe -I --connect-timeout 10 --max-time 20 https://example.com
```

检查返回状态码和错误信息。有些站点不支持 HEAD 请求，可以改为 GET：

```powershell
curl.exe -o NUL -sS -w "HTTP %{http_code}; time %{time_total}s" --max-time 20 https://example.com
```

`NUL` 是 Windows 的空设备；macOS / Linux 使用 `/dev/null`。不要为了跳过证书报错就默认添加 `-k`，先确认系统时间和证书链。

## 5. 确认出口 IP

```powershell
curl.exe --connect-timeout 10 --max-time 20 https://api.ipify.org
```

这里检查的是这次 curl 请求的出口，不代表所有软件的出口。代理配置的验证方式见[代理入门教程](/blog/proxy-basics/)。

## 如何判断结果

| 现象 | 下一步 |
| --- | --- |
| DNS 失败 | 检查域名、DNS 配置和 DNS 服务器可达性 |
| DNS 正常、TCP 失败 | 检查防火墙、路由和目标端口状态 |
| TCP 正常、TLS 失败 | 检查系统时间、证书及网络中间设备 |
| HTTP 返回 403 或 429 | 检查站点权限与频率限制，不要反复高频请求 |

## 常见问题

Ping 失败不等于网站不可用。部分服务屏蔽 ICMP，却正常接受 HTTPS 请求。要检查实际要使用的协议和端口。
