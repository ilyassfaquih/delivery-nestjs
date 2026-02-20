import { useState, useEffect } from 'react';
import { addMenuItem, updateMenuItem, getMenuItems, getCustomers, toggleCustomerBan } from '../services/api';
import { useToast } from '../components/Toast';

export default function Admin() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        price: '',
        imageUrl: '',
        available: true,
    });
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'customers'
    const [customers, setCustomers] = useState([]);
    const [menuItems, setMenuItems] = useState([]); // List of current menu items
    const [editingId, setEditingId] = useState(null); // ID of the item being edited
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingMenu, setLoadingMenu] = useState(false);

    useEffect(() => {
        if (activeTab === 'customers') {
            loadCustomers();
        } else if (activeTab === 'menu') {
            loadMenuItems();
        }
    }, [activeTab]);

    async function loadMenuItems() {
        setLoadingMenu(true);
        try {
            const data = await getMenuItems();
            setMenuItems(data);
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoadingMenu(false);
        }
    }

    async function loadCustomers() {
        setLoadingCustomers(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoadingCustomers(false);
        }
    }

    async function handleToggleBan(id) {
        try {
            const updatedCustomer = await toggleCustomerBan(id);
            setCustomers(prev => prev.map(c => c.id === id ? { ...c, isBanned: updatedCustomer.isBanned } : c));
            toast(`Customer ${updatedCustomer.isBanned ? 'banned' : 'unbanned'} successfully! 🛡️`);
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    function handleEditItem(item) {
        setEditingId(item.id);
        setForm({
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl || '',
            available: item.available,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        setEditingId(null);
        setForm({ name: '', price: '', imageUrl: '', available: true });
    }

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: form.name,
                price: parseFloat(form.price),
                imageUrl: form.imageUrl || undefined,
                available: form.available,
            };

            if (editingId) {
                await updateMenuItem(editingId, payload);
                toast('Menu item updated successfully! ✨');
            } else {
                await addMenuItem(payload);
                toast('Menu item added successfully! 🍽️');
            }

            cancelEdit();
            loadMenuItems(); // Refresh list automatically
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
            <h1 className="fade-up" style={{ textAlign: 'center' }}>⚙️ Admin Panel</h1>
            <p className="subtitle fade-up fade-up-delay-1" style={{ textAlign: 'center' }}>Manage restaurant and customers</p>

            <div className="admin-tabs fade-up fade-up-delay-2" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                <button
                    className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('menu')}
                >
                    🍔 Menu Management
                </button>
                <button
                    className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('customers')}
                >
                    👥 Customer Management
                </button>
            </div>

            {activeTab === 'menu' && (
                <div className="menu-admin-layout fade-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Left: Form */}
                    <div className="form-card" style={{ position: 'sticky', top: '6rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                            {editingId ? '✏️ Edit Menu Item' : '➕ New Menu Item'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input
                                    type="text"
                                    placeholder="Margherita Pizza"
                                    value={form.name}
                                    onChange={(e) => update('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Price (MAD)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="49.99"
                                    value={form.price}
                                    onChange={(e) => update('price', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Image URL (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://example.com/pizza.jpg"
                                    value={form.imageUrl}
                                    onChange={(e) => update('imageUrl', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Availability</label>
                                <div className="toggle-group">
                                    <input
                                        type="checkbox"
                                        className="toggle"
                                        checked={form.available}
                                        onChange={(e) => update('available', e.target.checked)}
                                    />
                                    <span style={{ color: form.available ? 'var(--success)' : 'var(--text-muted)', fontWeight: 500 }}>
                                        {form.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                                {loading ? <span className="spinner"></span> : (editingId ? '💾 Save Changes' : '➕ Add Item')}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-outline" onClick={cancelEdit} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                                    Cancel Edit
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Right: List of existing items */}
                    <div className="existing-items" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>🍽️ Current Menu</h2>
                        {loadingMenu ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" style={{ borderColor: 'var(--primary) transparent transparent transparent' }}></span></div>
                        ) : menuItems.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No items found.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {menuItems.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px',
                                        border: editingId === item.id ? '2px solid var(--primary)' : '1px solid transparent'
                                    }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }} />
                                            ) : (
                                                <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🍔</div>
                                            )}
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                                    {item.name}
                                                    {!item.available && <span style={{ fontSize: '0.75rem', color: '#ff4444', marginLeft: '0.5rem', verticalAlign: 'middle', border: '1px solid #ff4444', padding: '2px 6px', borderRadius: '12px' }}>Unavailable</span>}
                                                </h3>
                                                <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 'bold' }}>{Number(item.price).toFixed(2)} MAD</p>
                                            </div>
                                        </div>
                                        <button className="btn btn-outline" onClick={() => handleEditItem(item)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                            ✏️ Edit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'customers' && (
                <div className="customers-list fade-up" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
                    {loadingCustomers ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" style={{ borderColor: 'var(--primary) transparent transparent transparent' }}></span></div>
                    ) : customers.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {customers.map(customer => (
                                <div key={customer.id} className="customer-card" style={{
                                    background: 'var(--bg-secondary)',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: customer.isBanned ? '1px solid rgba(255, 68, 68, 0.3)' : '1px solid transparent'
                                }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: customer.isBanned ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: customer.isBanned ? 'line-through' : 'none' }}>
                                            {customer.firstName} {customer.lastName}
                                        </h3>
                                        <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>✉️ {customer.email}</p>
                                        <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>📞 {customer.phone}</p>
                                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', fontWeight: 'bold', color: customer.role === 'ADMIN' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                            ROLE: {customer.role}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {customer.role !== 'ADMIN' && (
                                            <button
                                                className="btn"
                                                onClick={() => handleToggleBan(customer.id)}
                                                style={{
                                                    background: customer.isBanned ? 'var(--success)' : 'rgba(255, 68, 68, 0.1)',
                                                    color: customer.isBanned ? '#fff' : '#ff4444',
                                                    padding: '0.5rem 1rem'
                                                }}
                                            >
                                                {customer.isBanned ? '✅ Unban' : '🚫 Ban User'}
                                            </button>
                                        )}
                                        {customer.isBanned && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ff4444', fontWeight: 'bold' }}>BANNED</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
