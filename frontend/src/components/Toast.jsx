import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
            );
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 300);
        }, 3500);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
        );
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    };

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`toast toast-${t.type} ${t.leaving ? 'leaving' : ''}`}
                        onClick={() => removeToast(t.id)}
                    >
                        {t.type === 'success' ? '✅' : '❌'} {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
