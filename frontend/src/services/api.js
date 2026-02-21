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
    const data = await res.json().catch(() => null);

    if (res.status === 401) {
        if (endpoint === '/auth/login') {
            throw new Error(data?.message || 'Invalid email or password.');
        } else {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Session expired. Please log in again.');
        }
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
export const deleteMenuItem = (id) =>
    request(`/menu/${id}`, { method: 'DELETE' });

// ── Order API ──
export const createOrder = (dto) =>
    request('/orders', { method: 'POST', body: JSON.stringify(dto) });

// ── Driver Order API ──
export const getPendingOrders = () =>
    request('/orders/pending', { method: 'GET' });
export const getMyDeliveries = () =>
    request('/orders/my-deliveries', { method: 'GET' });
export const getDeliveryHistory = () =>
    request('/orders/delivery-history', { method: 'GET' });
export const acceptOrder = (orderId) =>
    request(`/orders/${orderId}/accept`, { method: 'PUT' });
export const updateOrderStatus = (orderId, status) =>
    request(`/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

// ── Admin Customer API ──
export const getCustomers = () =>
    request('/customers', { method: 'GET' });

export const toggleCustomerBan = (id) =>
    request(`/customers/${id}/ban`, { method: 'PUT' });

// ── Admin: orders by customer, deliveries by driver ──
export const getOrdersByCustomer = (customerId) =>
    request(`/orders/admin/customer/${customerId}`, { method: 'GET' });
export const getDriversWithDeliveries = () =>
    request('/orders/admin/drivers-deliveries', { method: 'GET' });