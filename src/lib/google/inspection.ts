/** Match Google's property semantics; never infer access from a similar hostname. */
export function belongsToProperty(value: string, property: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    if (property.startsWith('sc-domain:')) {
      const domain = property.slice(10).toLowerCase();
      return Boolean(domain && (url.hostname === domain || url.hostname.endsWith('.' + domain)));
    }
    const prefix = new URL(property);
    return prefix.origin === url.origin && url.href.startsWith(prefix.href);
  } catch { return false; }
}
