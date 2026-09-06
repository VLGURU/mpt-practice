const API_BASE = 'http://localhost:4000/api';

const buildQuery = (params: Record<string, string | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.append(key, value);
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');

  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    : {
        'Content-Type': 'application/json'
      };
};

export const api = {
  async health() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('API недоступен');
    return res.json();
  },

  async getStudents(createdBy?: string) {
    const res = await fetch(`${API_BASE}/students${buildQuery({ created_by: createdBy })}`);
    if (!res.ok) throw new Error('Не удалось загрузить студентов');
    return res.json();
  },

  async getStudent(id: string) {
    const res = await fetch(`${API_BASE}/students/${id}`);
    if (!res.ok) throw new Error('Резюме не найдено');
    return res.json();
  },

  async createStudent(payload: any) {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Ошибка сохранения');
    }

    return data;
  },

  async deleteStudent(id: string) {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Не удалось удалить');
    }

    return data;
  },

  async getStats(createdBy?: string) {
    const res = await fetch(`${API_BASE}/stats${buildQuery({ created_by: createdBy })}`);
    if (!res.ok) throw new Error('Не удалось получить статистику');
    return res.json();
  }
};