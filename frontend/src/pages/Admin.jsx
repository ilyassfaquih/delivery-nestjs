import { useState } from 'react';
import { addMenuItem } from '../services/api';
import { useToast } from '../components/Toast';

export default function Admin() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        price: '',
        available: true,
    });

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await addMenuItem({
                name: form.name,
                price: parseFloat(form.price),
                available: form.available,
            });
            toast('Menu item added successfully! 🍽️');
            setForm({ name: '', price: '', available: true });
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-page">
            <h1 className="fade-up">⚙️ Admin Panel</h1>
            <p className="subtitle fade-up fade-up-delay-1">Add new items to the menu</p>

            <div className="form-card fade-up fade-up-delay-2">
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
                        {loading ? <span className="spinner"></span> : '➕ Add Menu Item'}
                    </button>
                </form>
            </div>
        </div>
    );
}
