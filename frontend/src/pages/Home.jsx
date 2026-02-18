import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="container">
            <section className="hero">
                <div className="hero-icon">🍔</div>
                <h1 className="fade-up">
                    Delicious Food,<br />
                    <span className="gradient">Delivered Fast</span>
                </h1>
                <p className="fade-up fade-up-delay-1">
                    Browse our curated menu, place your order in seconds, and enjoy
                    premium meals delivered right to your door.
                </p>
                <div className="hero-actions fade-up fade-up-delay-2">
                    <Link to="/menu" className="btn btn-primary">
                        🍽️ Browse Menu
                    </Link>
                    <Link to="/register" className="btn btn-secondary">
                        👤 Register Now
                    </Link>
                </div>
            </section>

            <section className="features">
                <Link to="/menu" className="feature-card fade-up fade-up-delay-1">
                    <div className="card-icon">📋</div>
                    <h3>Browse Menu</h3>
                    <p>Explore our wide selection of delicious dishes, search by name, and add items to your cart.</p>
                </Link>

                <Link to="/order" className="feature-card fade-up fade-up-delay-2">
                    <div className="card-icon">🛒</div>
                    <h3>Place Order</h3>
                    <p>Choose delivery or pickup, set your time, and place your order in just a few clicks.</p>
                </Link>

                <Link to="/register" className="feature-card fade-up fade-up-delay-3">
                    <div className="card-icon">⚡</div>
                    <h3>Quick Register</h3>
                    <p>Create your account in seconds and get your unique customer code for fast ordering.</p>
                </Link>
            </section>
        </div>
    );
}
