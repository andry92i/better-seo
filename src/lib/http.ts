export class RequestBodyError extends Error {}
export async function readBoundedJson(request: Request, limit = 100000): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError('Missing body');
  let size = 0;
  let text = '';
  const decoder = new TextDecoder();
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > limit) { await reader.cancel(); throw new RequestBodyError('Body too large'); }
      text += decoder.decode(chunk.value, { stream: true });
    }
    try { return JSON.parse(text + decoder.decode()); }
    catch { throw new RequestBodyError('Invalid JSON'); }
  } finally { reader.releaseLock(); }
}
