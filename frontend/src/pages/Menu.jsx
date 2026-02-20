import { useState, useEffect } from 'react';
import { getMenuItems } from '../services/api';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';

export default function Menu({ cart, setCart }) {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchItems(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    async function fetchItems(q) {
        setLoading(true);
        try {
            const data = await getMenuItems(q);
            setItems(data);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    function addToCart(item) {
        setCart((prev) => [...prev, item]);
        toast(`${item.name} added to cart! 🛒`, 'success');
    }

    return (
        <div className="container">
            <div className="menu-header">
                <h1>🍽️ Our Menu</h1>
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="empty-state">
                    <div className="spinner" style={{ width: 32, height: 32 }}></div>
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🍽️</div>
                    <h3>No items found</h3>
                    <p>{search ? 'Try a different search term' : 'The menu is empty. Add items from the Admin page.'}</p>
                </div>
            ) : (
                <div className="menu-grid">
                    {items.map((item) => (
                        <div key={item.id} className="menu-card fade-up">
                            {item.imageUrl && (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        objectFit: 'cover',
                                        borderRadius: '12px 12px 0 0',
                                        marginBottom: '0.5rem'
                                    }}
                                />
                            )}
                            <span className={`item-status ${item.available ? 'available' : 'unavailable'}`} style={{ marginTop: item.imageUrl ? '0.5rem' : '0' }}>
                                {item.available ? '● Available' : '● Unavailable'}
                            </span>
                            <div className="item-name">{item.name}</div>
                            <div className="item-price">{Number(item.price).toFixed(2)} MAD</div>
                            <div className="card-actions">
                                {item.available && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => addToCart(item)}
                                    >
                                        + Add to Cart
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Order Now Button */}
            {cart.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    zIndex: 50,
                    animation: 'fadeUp 0.3s ease-out forwards'
                }}>
                    <Link to="/order" className="btn btn-primary" style={{
                        padding: '1rem 2rem',
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        boxShadow: '0 8px 32px rgba(249, 115, 22, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <span>🛒</span>
                        <span style={{ fontWeight: 800 }}>Order Now</span>
                        <span style={{ opacity: 0.8, fontSize: '0.95rem', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '0.75rem', marginLeft: '0.25rem' }}>
                            {cart.length} item{cart.length !== 1 ? 's' : ''} • {cart.reduce((sum, item) => sum + Number(item.price), 0).toFixed(2)} MAD
                        </span>
                        <span style={{ marginLeft: '0.25rem' }}>➔</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
