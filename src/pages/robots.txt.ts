import type { APIRoute } from 'astro';
import { url } from '../config';
export const GET: APIRoute = ({ site }) => new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(url('sitemap.xml'), site || 'https://example.com').href}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
