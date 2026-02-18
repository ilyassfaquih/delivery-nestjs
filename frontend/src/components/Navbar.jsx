import { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate('/login');
    };

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

                {user ? (
                    <>
                        <li><NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink></li>
                        <li>
                            <button onClick={handleLogout} className="btn-logout" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                                Logout ({user.firstName})
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li><NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink></li>
                        <li><NavLink to="/register" onClick={() => setOpen(false)}>Register</NavLink></li>
                    </>
                )}
            </ul>
        </nav>
    );
}
