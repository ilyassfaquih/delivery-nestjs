import { useState } from 'react';
import { registerCustomer } from '../services/api';
import { useToast } from '../components/Toast';

export default function Register() {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
    });

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await registerCustomer(form);
            setResult(data);
            toast('Customer registered successfully! 🎉');
            setForm({ firstName: '', lastName: '', email: '', phone: '' });
        } catch (err) {
            toast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-page">
            <h1 className="fade-up">👤 Register</h1>
            <p className="subtitle fade-up fade-up-delay-1">Create your account to start ordering</p>

            <div className="form-card fade-up fade-up-delay-2">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                            <input
                                type="text"
                                placeholder="Ilyas"
                                value={form.firstName}
                                onChange={(e) => update('firstName', e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                            <input
                                type="text"
                                placeholder="Faquih"
                                value={form.lastName}
                                onChange={(e) => update('lastName', e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="ilyas@example.com"
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                        <input
                            type="tel"
                            placeholder="+212 600 000 000"
                            value={form.phone}
                            onChange={(e) => update('phone', e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            placeholder="••••••"
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex justify-center items-center"
                    >
                        {loading ? <span className="spinner"></span> : '🚀 Register'}
                    </button>
                </form>

                {result && (
                    <div className="success-box">
                        <div className="check-icon">✅</div>
                        <h3>Account Created!</h3>
                        <p>Save your customer code for ordering:</p>
                        <div className="code">{result.code}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
