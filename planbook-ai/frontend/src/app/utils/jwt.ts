export function decodeJwtPayload(token: string | null): Record<string, any> {
  if (!token) return {};

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return {};

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function getAccessTokenPayload(): Record<string, any> {
  return decodeJwtPayload(localStorage.getItem('access_token'));
}

export function getFullNameFromToken(fallback = ''): string {
  const payload = getAccessTokenPayload();
  return payload.fullName || fallback;
}
