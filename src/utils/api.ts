interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

const buildQueryString = (params?: QueryParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

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
  get: <T>(url: string, params?: QueryParams) => 
    apiFetch<T>(`${url}${buildQueryString(params)}`, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => apiFetch<T>(url, { method: 'DELETE' }),
};
