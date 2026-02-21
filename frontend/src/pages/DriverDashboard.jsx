import { useState, useEffect } from 'react';
import { getPendingOrders, getMyDeliveries, getDeliveryHistory, acceptOrder, updateOrderStatus } from '../services/api';
import { useToast } from '../components/Toast';

export default function DriverDashboard() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'mine' | 'history'
    const [pendingOrders, setPendingOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [deliveryHistory, setDeliveryHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [pendingRes, mineRes, historyRes] = await Promise.all([
                getPendingOrders(),
                getMyDeliveries(),
                getDeliveryHistory(),
            ]);
            setPendingOrders(pendingRes);
            setMyDeliveries(mineRes);
            setDeliveryHistory(historyRes);
        } catch (err) {
            if (!silent) toast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Real-time polling: refresh lists so delivered orders disappear and pending updates show
    useEffect(() => {
        const interval = setInterval(() => fetchData(true), 10000); // every 10s, silent
        return () => clearInterval(interval);
    }, []);

    const handleAccept = async (orderId) => {
        try {
            await acceptOrder(orderId);
            toast('Order accepted! Moved to your deliveries.', 'success');
            fetchData();
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            toast(`Order status updated to ${newStatus}`, 'success');
            fetchData();
        } catch (err) {
            toast(err.message, 'error');
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            PENDING: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
            ACCEPTED: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
            IN_TRANSIT: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
            DELIVERED: 'bg-green-500/20 text-green-500 border-green-500/50'
        };
        return (
            <span className={`px-2 py-1 text-xs font-bold rounded-full border ${colors[status] || 'bg-gray-500'}`}>
                {status}
            </span>
        );
    };

    const getGoogleMapsLink = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    // History totals: today, this week, this month — based on deliveredAt
    const getHistoryTotals = () => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const day = now.getDay();
        const mondayOffset = day === 0 ? 6 : day - 1;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - mondayOffset);
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let today = 0, week = 0, month = 0;
        deliveryHistory.forEach(order => {
            const d = order.deliveredAt ? new Date(order.deliveredAt) : (order.createdAt ? new Date(order.createdAt) : null);
            if (!d) return;
            if (d >= startOfToday) today++;
            if (d >= startOfWeek) week++;
            if (d >= startOfMonth) month++;
        });
        return { today, week, month };
    };
    const historyTotals = getHistoryTotals();

    return (
        <div className="container py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">🛵 Driver Dashboard</h1>
                    <p className="text-gray-400 mt-1">Accept and manage your deliveries</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-2 px-4 transition-colors ${activeTab === 'pending' ? 'text-primary border-b-2 border-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    Available Orders
                </button>
                <button
                    onClick={() => setActiveTab('mine')}
                    className={`pb-2 px-4 transition-colors ${activeTab === 'mine' ? 'text-primary border-b-2 border-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    My Deliveries
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-2 px-4 transition-colors ${activeTab === 'history' ? 'text-primary border-b-2 border-primary font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                    📋 History
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="spinner w-8 h-8"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === 'pending' && pendingOrders.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-white/5 rounded-xl border border-white/10">
                            <span className="text-4xl block mb-2">😴</span>
                            No available orders right now. Wait for new customers!
                        </div>
                    )}

                    {activeTab === 'mine' && myDeliveries.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-white/5 rounded-xl border border-white/10">
                            <span className="text-4xl block mb-2">🏍️</span>
                            You have no active deliveries. Accept one from the available orders tab.
                        </div>
                    )}

                    {activeTab === 'history' && deliveryHistory.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400 bg-white/5 rounded-xl border border-white/10">
                            <span className="text-4xl block mb-2">📭</span>
                            No delivery history yet. Completed deliveries will appear here.
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="col-span-full space-y-6">
                            {/* Totals: today, week, month */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                                    <p className="text-gray-400 text-sm mb-1">Today</p>
                                    <p className="text-3xl font-bold text-primary">{historyTotals.today}</p>
                                    <p className="text-xs text-gray-500 mt-1">orders delivered today</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                                    <p className="text-gray-400 text-sm mb-1">This week</p>
                                    <p className="text-3xl font-bold text-primary">{historyTotals.week}</p>
                                    <p className="text-xs text-gray-500 mt-1">this week</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                                    <p className="text-gray-400 text-sm mb-1">This month</p>
                                    <p className="text-3xl font-bold text-primary">{historyTotals.month}</p>
                                    <p className="text-xs text-gray-500 mt-1">this month</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/10 text-gray-400 text-sm">
                                            <th className="p-4 font-semibold">Order</th>
                                            <th className="p-4 font-semibold">Customer</th>
                                            <th className="p-4 font-semibold">Date commande</th>
                                            <th className="p-4 font-semibold">Delivery date</th>
                                            <th className="p-4 font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveryHistory.map(order => (
                                            <tr key={order.id} className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-medium">#{order.id}</td>
                                                <td className="p-4">{order.customer?.firstName} {order.customer?.lastName}</td>
                                                <td className="p-4 text-gray-300">{order.createdAt ? new Date(order.createdAt).toLocaleString('en-US') : '—'}</td>
                                                <td className="p-4 text-primary font-medium">{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString('en-US') : '—'}</td>
                                                <td className="p-4 text-accent font-bold">{Number(order.totalPrice).toFixed(2)} MAD</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'pending' || activeTab === 'mine') && (activeTab === 'pending' ? pendingOrders : myDeliveries).map(order => (
                        <div key={order.id} className="glass-card p-6 flex flex-col justify-between animate-slideDown">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">👤</span>
                                        <div>
                                            <p className="text-sm text-gray-400">Customer</p>
                                            <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
                                            <p className="text-sm text-primary">{order.customer?.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">📍</span>
                                        <div>
                                            <p className="text-sm text-gray-400">Delivery Location</p>
                                            <p className="font-medium line-clamp-2">{order.address || 'Map Pin Location'}</p>
                                            {order.latitude && order.longitude && (
                                                <a href={getGoogleMapsLink(order.latitude, order.longitude)} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 underline mt-1 inline-block">
                                                    Open in Google Maps 🧭
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 flex-wrap">
                                        <span className="font-bold text-accent">{Number(order.totalPrice).toFixed(2)} MAD</span>
                                        <span className="text-xs text-gray-400">({order.paymentMode})</span>
                                    </div>
                                    {(order.menuItems?.length > 0) && (
                                        <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/10 mt-2">
                                            <span className="text-sm text-gray-400">Items:</span>
                                            <p className="text-sm">{order.menuItems.map(m => m.name).join(', ')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10">
                                {activeTab === 'pending' && (
                                    <button
                                        onClick={() => handleAccept(order.id)}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all"
                                    >
                                        Accept Delivery
                                    </button>
                                )}

                                {activeTab === 'mine' && order.status === 'ACCEPTED' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.id, 'IN_TRANSIT')}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all"
                                    >
                                        Mark as In-Transit
                                    </button>
                                )}

                                {activeTab === 'mine' && order.status === 'IN_TRANSIT' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all"
                                    >
                                        Complete Delivery 🎉
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
