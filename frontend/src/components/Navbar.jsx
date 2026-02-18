import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <nav className="navbar">
            <NavLink to="/" className="navbar-brand" onClick={() => setOpen(false)}>
                <span className="icon">🍕</span>
                <span>Fast<span className="highlight">Bite</span></span>
            </NavLink>

            <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <ul className={`nav-links ${open ? 'open' : ''}`}>
                <li><NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink></li>
                <li><NavLink to="/menu" onClick={() => setOpen(false)}>Menu</NavLink></li>
                <li><NavLink to="/order" onClick={() => setOpen(false)}>Order</NavLink></li>
                <li><NavLink to="/register" onClick={() => setOpen(false)}>Register</NavLink></li>
                <li><NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink></li>
            </ul>
        </nav>
    );
}
