export function youtubeEmbed(link: string): string | undefined {
  let url: URL;
  try { url = new URL(link); } catch { return; }
  if (!['https:', 'http:'].includes(url.protocol)) return;
  let id: string | undefined;
  if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v') || undefined;
    else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1];
  }
  if (!id || !/^[\w-]{11}$/.test(id)) return;
  const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  const time = url.searchParams.get('start') || url.searchParams.get('t');
  if (time) {
    const parts = time.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    const seconds = /^\d+$/.test(time) ? Number(time) : parts ? Number(parts[1] || 0) * 3600 + Number(parts[2] || 0) * 60 + Number(parts[3] || 0) : 0;
    if (Number.isSafeInteger(seconds) && seconds > 0) embed.searchParams.set('start', String(seconds));
  }
  return embed.href;
}
