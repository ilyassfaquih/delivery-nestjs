import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { request, createOrder } from '../services/api'; // Import createOrder

// Do not eagerly load Stripe at module import time (ad-blockers may cause noisy console errors).
// We'll load it at runtime and handle failures gracefully.
const DEFAULT_PUBLISHABLE_KEY = 'pk_test_placeholder';

const CheckoutForm = ({ amount, currency, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (!stripe || !elements) return;

        // 1. Create PaymentIntent on backend
        try {
            const { client_secret } = await request('/payment/create-intent', {
                method: 'POST',
                body: JSON.stringify({ amount, currency }),
            });

            // 2. Confirm Card Payment
            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (result.error) {
                setError(result.error.message);
                setProcessing(false);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    onSuccess(result.paymentIntent);
                }
            }
        } catch (err) {
            setError(err.message);
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#ffffff',
                                '::placeholder': { color: '#aab7c4' },
                            },
                            invalid: { color: '#9e2146' },
                        },
                    }}
                />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all"
            >
                {processing ? 'Processing...' : `Pay $${amount}`}
            </button>
        </form>
    );
};

export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { total, items, orderDetails } = location.state || { total: 0, items: [], orderDetails: {} };
    const [stripePromise, setStripePromise] = useState(null);
    const [stripeLoadError, setStripeLoadError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY;
        // Load Stripe asynchronously and catch failures (e.g., adblockers or network issues)
        loadStripe(key)
            .then((p) => {
                if (!mounted) return;
                setStripePromise(p);
            })
            .catch((err) => {
                console.warn('Stripe failed to load:', err?.message || err);
                if (mounted) setStripeLoadError('Payment service unavailable. Try again later or use Cash.');
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (total === 0) {
        return <div className="text-center mt-20 text-white">No items to checkout</div>;
    }

    const handleSuccess = async (paymentIntent) => {
        try {
            const backendOrderDetails = await createOrder({
                ...orderDetails,
                menuItemIds: items.map(item => item.id),
                // paymentIntentId: paymentIntent.id // Optional: save transaction ID
            });

            navigate('/order', { state: { paymentSuccess: true, order: backendOrderDetails } });
        } catch (err) {
            alert('Payment successful but order creation failed: ' + err.message);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 max-w-lg mx-auto">
            <div className="glass-card p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Checkout</h2>
                <p className="text-gray-300 mb-8">Total to pay: <span className="text-xl font-bold text-primary">${total}</span></p>

                {stripeLoadError && (
                    <div className="text-yellow-300">{stripeLoadError}</div>
                )}
                {stripePromise ? (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm amount={total} currency="usd" onSuccess={handleSuccess} />
                    </Elements>
                ) : (
                    <div className="text-center text-gray-300">Card payments are temporarily unavailable. Please choose Cash or try again later.</div>
                )}
            </div>
        </div>
    );
}
