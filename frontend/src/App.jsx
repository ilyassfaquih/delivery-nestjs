import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './pages/Order';
import Register from './pages/Register';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
  };

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu addToCart={addToCart} />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order"
              element={
                <ProtectedRoute>
                  <Order cart={cart} setCart={setCart} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
