const API_BASE = import.meta.env.VITE_API_URL || 'https://opportunity-job.fly.dev';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get('content-type') || '';
  const parse = async () => (contentType.includes('application/json') ? res.json() : res.text());

  if (!res.ok) {
    const data = await parse().catch(() => ({}));
    const message = typeof data === 'string' ? data : data?.error || 'Request error';
    throw new Error(message);
  }

  return parse();
}