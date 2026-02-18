const API_BASE = '/api';

export async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Optimization: `Bearer ${token}` } : {}), // Typo protection? Authorization
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, config);
    // ... rest is same
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const message =
            data?.message || data?.error || `Request failed (${res.status})`;
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }

    return data;
}

// ── Auth API ──
export const login = (credentials) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });

export const registerCustomer = (dto) =>
    request('/customers', { method: 'POST', body: JSON.stringify(dto) });

// ── Menu API ──
export const getMenuItems = (query = '') =>
    request(`/menu${query ? `?q=${encodeURIComponent(query)}` : ''}`);

export const addMenuItem = (dto) =>
    request('/menu', { method: 'POST', body: JSON.stringify(dto) });

// ── Order API ──
export const createOrder = (dto) =>
    request('/orders', { method: 'POST', body: JSON.stringify(dto) });
