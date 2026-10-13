import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const blog = defineCollection({
  loader: glob({ pattern: '{zh-cn,zh-tw,en}/**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(), description: z.string(), publishedAt: z.coerce.date(), updatedAt: z.coerce.date().optional(),
    category: z.enum(['proxy-ip', 'network-check', 'browser-fingerprint', 'ecommerce-tools']),
    tags: z.array(z.string().min(1).regex(/^[\p{L}\p{N} _-]+$/u, '标签仅使用文字、数字、空格、下划线或连字符')).default([]), featured: z.boolean().default(false), draft: z.boolean().default(false),
    cover: z.string().optional(), video: z.url({ protocol: /^https?$/ }).optional(),
  }).refine(data => !data.updatedAt || data.updatedAt >= data.publishedAt, { message: '更新时间不能早于发布日期' }),
});
export const collections = { blog };
