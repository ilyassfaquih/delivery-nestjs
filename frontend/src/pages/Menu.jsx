import { useState, useEffect } from 'react';
import { getMenuItems } from '../services/api';

export default function Menu({ cart, setCart }) {
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
    }

    function isInCart(id) {
        return cart.some((c) => c.id === id);
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
                            <span className={`item-status ${item.available ? 'available' : 'unavailable'}`}>
                                {item.available ? '● Available' : '● Unavailable'}
                            </span>
                            <div className="item-name">{item.name}</div>
                            <div className="item-price">{Number(item.price).toFixed(2)} MAD</div>
                            <div className="card-actions">
                                {item.available && (
                                    <button
                                        className={`btn btn-sm ${isInCart(item.id) ? 'btn-secondary' : 'btn-primary'}`}
                                        onClick={() => addToCart(item)}
                                    >
                                        {isInCart(item.id) ? '✓ Added' : '+ Add to Cart'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
