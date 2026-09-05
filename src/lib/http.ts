export async function readBoundedJson(request: Request, limit = 100000): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  let size = 0;
  let text = '';
  const decoder = new TextDecoder();
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error('Body too large'); }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally { reader.releaseLock(); }
}
