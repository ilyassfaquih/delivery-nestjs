const API_BASE = '/api';

export async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
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

    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
    }

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

export const updateMenuItem = (id, dto) =>
    request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(dto) });

// ── Order API ──
export const createOrder = (dto) =>
    request('/orders', { method: 'POST', body: JSON.stringify(dto) });

// ── Admin Customer API ──
export const getCustomers = () =>
    request('/customers', { method: 'GET' });

export const toggleCustomerBan = (id) =>
    request(`/customers/${id}/ban`, { method: 'PUT' });
