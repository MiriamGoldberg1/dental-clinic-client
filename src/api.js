// כל הקריאות לשרת עוברות כאן: ה-JWT נשלח ב-header, ושגיאות הופכות ל-ApiError עם הסטטוס וההודעה מהשרת
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const AUTH_KEY = 'dental-clinic-auth';

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `שגיאה ${status}`);
    this.status = status;
    this.errors = body?.errors || null;
    this.correlationId = body?.correlationId || null;
  }
}

export function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  else localStorage.removeItem(AUTH_KEY);
}

export async function api(path, { method = 'GET', body } = {}) {
  const auth = loadAuth();
  const headers = { 'Content-Type': 'application/json' };
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;

  let response;
  try {
    response = await fetch(API_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError(0, { message: 'לא ניתן להתחבר לשרת. ודא שה-API רץ בכתובת ' + API_URL });
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}

// מחזיר תאריך בפורמט yyyy-MM-dd לפי השעון המקומי
export function toIsoDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const treatmentLabels = { Examination: 'בדיקה', Treatment: 'טיפול' };
