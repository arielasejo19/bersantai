const defaultBaseUrl = 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const apiClient = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,

  async request(path, options = {}) {
    const headers = {
      Accept: 'application/json',
      ...options.headers
    };

    const requestOptions = {
      credentials: options.credentials || 'include',
      ...options,
      headers
    };

    if (options.body && typeof options.body !== 'string' && !(typeof FormData !== 'undefined' && options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...requestOptions
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
      throw new ApiError(body?.message || 'Request failed', {
        status: response.status,
        details: body
      });
    }

    return body;
  },

  get(path, options) {
    return this.request(path, { ...options, method: 'GET' });
  },

  post(path, body, options) {
    return this.request(path, { ...options, method: 'POST', body });
  },

  put(path, body, options) {
    return this.request(path, { ...options, method: 'PUT', body });
  }
};
