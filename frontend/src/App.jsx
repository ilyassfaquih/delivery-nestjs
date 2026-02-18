import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/Toast';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './pages/Order';
import Register from './pages/Register';
import Admin from './pages/Admin';

export default function App() {
  const [cart, setCart] = useState([]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu cart={cart} setCart={setCart} />} />
          <Route path="/order" element={<Order cart={cart} setCart={setCart} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
