import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { createOrder } from '../services/api';
import { useToast } from '../components/Toast';

export default function Order({ cart, setCart }) {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [form, setForm] = useState({
        address: '',
        deliveryMode: 'DELIVERY',
        paymentMode: 'CASH',
    });

    // Google Maps State
    const [mapCenter, setMapCenter] = useState({ lat: 34.020882, lng: -6.841650 }); // Default view: Rabat
    const [markerPosition, setMarkerPosition] = useState(null); // No pin by default

    // Load Google Maps API only if an API key is provided. If not, show a placeholder to avoid noisy console errors.
    const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleKey,
        // If no key is provided the loader will not attempt to fetch maps resources in modern versions,
        // but we still guard UI rendering below.
    });

    const onMapClick = useCallback((e) => {
        setMarkerPosition({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        });
    }, []);

    const isStoreOpen = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        if ((hours === 0 && minutes > 0) || (hours >= 1 && hours <= 7)) {
            return false;
        }
        return true;
    };
    const storeOpen = isStoreOpen();

    // Check for payment success from Checkout redirect
    const location = useLocation();
    useEffect(() => {
        if (location.state?.paymentSuccess) {
            const orderRes = location.state?.order;
            setSuccess({
                id: orderRes?.id || 'PAID',
                deliveryMode: orderRes?.deliveryMode || 'DELIVERY',
                paymentMode: orderRes?.paymentMode || 'CARD',
                deliveryTime: orderRes?.deliveryTime || 'ASAP',
                totalPrice: orderRes?.totalPrice
            }); // pass from Checkout
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

        if (form.deliveryMode === 'DELIVERY') {
            if (!form.address.trim() && !markerPosition) {
                toast('Please provide a delivery address or select your location on the map.', 'error');
                return;
            }
        }

        const orderDetailsPayload = {
            address: form.address,
            deliveryMode: form.deliveryMode,
            paymentMode: form.paymentMode,
            ...(form.deliveryMode === 'DELIVERY' && markerPosition && {
                latitude: markerPosition.lat,
                longitude: markerPosition.lng,
            })
        };

        if (form.paymentMode === 'CASH') {
            setLoading(true);
            try {
                const backendOrderDetails = await createOrder({
                    ...orderDetailsPayload,
                    menuItemIds: cart.map(item => item.id),
                });
                setSuccess({
                    ...backendOrderDetails,
                });
                setCart([]);
                toast('Order placed successfully! 💵');
            } catch (err) {
                toast(err.message, 'error');
            } finally {
                setLoading(false);
            }
        } else {
            // Navigate to checkout with order details (CARD)
            navigate('/checkout', {
                state: {
                    total,
                    items: cart,
                    orderDetails: orderDetailsPayload
                }
            });
        }
    }

    if (success) {
        // Group items to show quantities on the receipt
        // The backend `success.menuItems` array contains individual items for each quantity.
        const receiptItems = [];
        if (success.menuItems && Array.isArray(success.menuItems)) {
            success.menuItems.forEach((item) => {
                const existing = receiptItems.find(r => r.id === item.id);
                if (existing) {
                    existing.quantity += 1;
                    existing.lineTotal += Number(item.price);
                } else {
                    receiptItems.push({
                        ...item,
                        quantity: 1,
                        lineTotal: Number(item.price)
                    });
                }
            });
        }

        return (
            <div className="container">
                <div className="form-page" style={{ maxWidth: 600 }}>
                    <div className="success-box fade-up receipt-view" style={{ textAlign: 'left', padding: '2rem', background: '#fff', color: '#000', borderRadius: '12px' }}>

                        <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0, color: '#000', fontSize: '2rem' }}>🍕 FastBite</h2>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#555' }}>123 Delivery St, Gourmet City</p>
                            <p style={{ margin: 0, color: '#555' }}>Tel: +212 600-000000</p>
                        </div>

                        <div style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span><strong>Order #:</strong> {success.id}</span>
                                <span><strong>Date:</strong> {new Date().toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span><strong>Type:</strong> {success.deliveryMode}</span>
                                <span><strong>Time:</strong> {success.deliveryTime || 'ASAP'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span><strong>Payment:</strong> {success.paymentMode}</span>
                                <span><strong>Status:</strong> PAID</span>
                            </div>
                        </div>

                        <div style={{ borderBottom: '1px solid #ccc', borderTop: '1px solid #ccc', padding: '1rem 0', marginBottom: '1rem' }}>
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ paddingBottom: '0.5rem' }}>Item</th>
                                        <th style={{ paddingBottom: '0.5rem', textAlign: 'center' }}>Qty</th>
                                        <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receiptItems.length > 0 ? receiptItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '0.25rem 0' }}>{item.name}</td>
                                            <td style={{ padding: '0.25rem 0', textAlign: 'center' }}>x{item.quantity}</td>
                                            <td style={{ padding: '0.25rem 0', textAlign: 'right' }}>{item.lineTotal.toFixed(2)} MAD</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" style={{ fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>Items not listed. Check Email.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                            <span>Total Due:</span>
                            <span>{success.totalPrice !== undefined ? Number(success.totalPrice).toFixed(2) : total.toFixed(2)} MAD</span>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '2px dashed #ccc' }}>
                            <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>Thank you for ordering with FastBite!</p>
                        </div>
                    </div>

                    {/* Actions outside of the printable white receipt area */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => window.print()}
                        >
                            🖨️ Print Receipt
                        </button>
                        <button
                            className="btn btn-primary"
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
                    {!storeOpen && (
                        <div className="alert alert-error" style={{ marginBottom: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px' }}>
                            <strong>Store is closed!</strong> We are open from 08:00 to 00:00 (Midnight). Please check back later.
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        {form.deliveryMode === 'DELIVERY' && (
                            <div className="form-group">
                                <label>Delivery Address</label>
                                <input
                                    type="text"
                                    placeholder="Enter your full address (or use map below)"
                                    value={form.address}
                                    onChange={(e) => update('address', e.target.value)}
                                    style={{ marginBottom: '1rem' }}
                                />
                                <label>OR Pinpoint your exact location</label>
                                {googleKey ? (isLoaded ? (
                                    <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginTop: '0.5rem' }}>
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '100%' }}
                                            center={mapCenter}
                                            zoom={13}
                                            onClick={onMapClick}
                                            options={{ disableDefaultUI: true, zoomControl: true }}
                                        >
                                            {markerPosition && <Marker position={markerPosition} />}
                                        </GoogleMap>
                                    </div>
                                ) : (
                                    <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginTop: '0.5rem', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Map disabled</div>
                                            <div style={{ fontSize: '0.9rem' }}>No Google Maps API key configured. To enable the map, set <strong>VITE_GOOGLE_MAPS_API_KEY</strong> in your frontend .env file.</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                        <span className="spinner"></span> Loading Map...
                                    </div>
                                )}
                            </div>
                        )}



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

                        <div className="form-group">
                            <label>Payment Mode</label>
                            <div className="mode-selector">
                                <div
                                    className={`mode-option ${form.paymentMode === 'CASH' ? 'selected' : ''}`}
                                    onClick={() => update('paymentMode', 'CASH')}
                                >
                                    <span className="mode-icon">💵</span>
                                    Cash
                                </div>
                                <div
                                    className={`mode-option ${form.paymentMode === 'CARD' ? 'selected' : ''}`}
                                    onClick={() => update('paymentMode', 'CARD')}
                                >
                                    <span className="mode-icon">💳</span>
                                    Card
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || cart.length === 0 || !storeOpen}
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
