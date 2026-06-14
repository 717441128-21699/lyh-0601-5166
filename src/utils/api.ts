interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const res = await fetch(url, { ...defaultOptions, ...options });
  const json: ApiResponse<T> = await res.json();
  
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  
  return json.data as T;
}

export const api = {
  get: <T>(url: string) => apiFetch<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => apiFetch<T>(url, { method: 'DELETE' }),
};
