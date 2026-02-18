const API_BASE = '/api';

async function request(endpoint, options = {}) {
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const message =
            data?.message || data?.error || `Request failed (${res.status})`;
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
    }

    return data;
}

// ── Customer API ──
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
