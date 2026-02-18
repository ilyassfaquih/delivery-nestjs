import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createOrder } from '../services/api';
import { useToast } from '../components/Toast';

export default function Order({ cart, setCart }) {
    const navigate = useNavigate();
    const toast = useToast();
    const [form, setForm] = useState({
        customerCode: '',
        deliveryTime: '',
        deliveryMode: 'DELIVERY',
    });

    // Check for payment success from Checkout redirect
    const location = useLocation();
    useEffect(() => {
        if (location.state?.paymentSuccess) {
            setSuccess({ id: 'PAID', deliveryMode: 'DELIVERY', deliveryTime: 'ASAP' }); // Mock success data or pass from Checkout
            setCart([]);
            toast('Payment Successful! Order Placed.');
            // Clear state to prevent loop if desired, but React Router handles it
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function removeFromCart(index) {
        setCart((prev) => prev.filter((_, i) => i !== index));
    }

    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

    async function handleSubmit(e) {
        e.preventDefault();

        if (cart.length === 0) {
            toast('Add items to your cart first!', 'error');
            return;
        }

        // Navigate to checkout with order details
        navigate('/checkout', {
            state: {
                total,
                items: cart,
                orderDetails: {
                    customerCode: form.customerCode,
                    deliveryTime: form.deliveryTime,
                    deliveryMode: form.deliveryMode,
                }
            }
        });
    }

    if (success) {
        return (
            <div className="container">
                <div className="form-page" style={{ maxWidth: 600 }}>
                    <div className="success-box fade-up">
                        <div className="check-icon">🎉</div>
                        <h3>Order Placed!</h3>
                        <p>Your order #{success.id} has been received</p>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            {success.deliveryMode} at {success.deliveryTime}
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '1rem' }}
                            onClick={() => setSuccess(null)}
                        >
                            Place Another Order
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-title">
                <h1>🛒 Place Order</h1>
                <p>Fill in your details and review your cart</p>
            </div>

            <div className="order-layout">
                {/* Order Form */}
                <div className="form-card fade-up">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Customer Code</label>
                            <input
                                type="text"
                                placeholder="Your unique customer code"
                                value={form.customerCode}
                                onChange={(e) => update('customerCode', e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Delivery Time</label>
                            <input
                                type="time"
                                value={form.deliveryTime}
                                onChange={(e) => update('deliveryTime', e.target.value)}
                                required
                                min="08:00"
                                max="23:59"
                            />
                        </div>

                        <div className="form-group">
                            <label>Delivery Mode</label>
                            <div className="mode-selector">
                                <div
                                    className={`mode-option ${form.deliveryMode === 'DELIVERY' ? 'selected' : ''}`}
                                    onClick={() => update('deliveryMode', 'DELIVERY')}
                                >
                                    <span className="mode-icon">🚗</span>
                                    Delivery
                                </div>
                                <div
                                    className={`mode-option ${form.deliveryMode === 'PICKUP' ? 'selected' : ''}`}
                                    onClick={() => update('deliveryMode', 'PICKUP')}
                                >
                                    <span className="mode-icon">🏃</span>
                                    Pickup
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || cart.length === 0}
                            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                        >
                            {loading ? <span className="spinner"></span> : `🚀 Place Order — ${total.toFixed(2)} MAD`}
                        </button>
                    </form>
                </div>

                {/* Cart Panel */}
                <div className="cart-panel fade-up fade-up-delay-1">
                    <h2>🛍️ Your Cart ({cart.length})</h2>

                    {cart.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem 0' }}>
                            <p style={{ fontSize: '0.9rem' }}>Your cart is empty. Add items from the Menu page.</p>
                        </div>
                    ) : (
                        <>
                            {cart.map((item, i) => (
                                <div key={i} className="cart-item">
                                    <span>{item.name}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>
                                            {Number(item.price).toFixed(2)}
                                        </span>
                                        <button className="remove-btn" onClick={() => removeFromCart(i)}>✕</button>
                                    </span>
                                </div>
                            ))}

                            <div className="cart-total">
                                <span>Total</span>
                                <span className="total-price">{total.toFixed(2)} MAD</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
