const API_BASE_URL = '/api/v1';

export const apiClient = async (endpoint, { body, ...customConfig } = {}) => {
  const token = localStorage.getItem('token');
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = {
    Accept: 'application/json',
    ...customConfig.headers,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method: customConfig.method || (body ? 'POST' : 'GET'),
    headers,
    ...customConfig,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, config);

  if (response.status === 204) {
    return null;
  }

  // Handle CSV download
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return response.blob();
  }

  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    data = { message: response.statusText };
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed with status ' + response.status);
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
};

export default apiClient;
