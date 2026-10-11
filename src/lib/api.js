// Thin client for the Charak backend (Cloud Run) — used by doctor
// registration to sign in and submit through the same backend the app uses,
// instead of writing to Firestore. See Register.jsx.

const BASE = import.meta.env.VITE_API_URL;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function req(path, { method = 'GET', token, body, isFormData = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const parsed = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(parsed.error ?? res.statusText, res.status);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path, token) => req(path, { token }),
  post: (path, body, token) => req(path, { method: 'POST', body, token }),
  patch: (path, body, token) => req(path, { method: 'PATCH', body, token }),
  // `file` is a browser File — multipart, matching the backend's
  // `UploadFile = File(...)` parameter name exactly ("file").
  uploadFile: (path, file, token) => {
    const form = new FormData();
    form.append('file', file);
    return req(path, { method: 'POST', body: form, token, isFormData: true });
  }
};

export { ApiError };
