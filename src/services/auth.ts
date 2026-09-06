const API_BASE = 'http://localhost:4000/api';

type AuthPayload = {
  fullName?: string;
  email: string;
  password: string;
};

type User = {
  id: number | string;
  fullName: string;
  email: string;
};

export const authStorage = {
  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  setToken(token: string | null) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  },

  setCurrentUser(user: User | null) {
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    else localStorage.removeItem('currentUser');
  },

  async register({ fullName, email, password }: AuthPayload) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Ошибка регистрации');
    }

    this.setToken(data.token);
    this.setCurrentUser(data.user);
    return data.user as User;
  },

  async login({ email, password }: AuthPayload) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Ошибка входа');
    }

    this.setToken(data.token);
    this.setCurrentUser(data.user);
    return data.user as User;
  },

  logout() {
    this.setToken(null);
    this.setCurrentUser(null);
  }
};