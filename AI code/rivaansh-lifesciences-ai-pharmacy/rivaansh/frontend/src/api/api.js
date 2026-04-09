/**
 * api.js — Axios-style API helper using fetch
 * Auto-attaches JWT, handles 401 → auth:expired event
 */

const BASE = '/api';

function getToken() {
  return localStorage.getItem('userToken');
}

async function request(method, endpoint, body = null, isFormData = false) {
  const headers = {};
  const token = getToken();

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const config = { method, headers };
  if (body) config.body = isFormData ? body : JSON.stringify(body);

  try {
    const res = await fetch(BASE + endpoint, config);

    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return { ok: false, status: 401, data: { message: 'Session expired.' } };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error(`API ${method} ${endpoint}:`, err);
    return { ok: false, status: 0, data: { message: 'Network error. Check your connection.' } };
  }
}

const api = {
  get:      (ep)       => request('GET',    ep),
  post:     (ep, body) => request('POST',   ep, body),
  put:      (ep, body) => request('PUT',    ep, body),
  delete:   (ep)       => request('DELETE', ep),
  postForm: (ep, fd)   => request('POST',   ep, fd, true),
};

export default api;
