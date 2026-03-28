import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="hero animate-fade-in">
      <h1>Campus Asset Recovery System</h1>
      <p>
        Lost something important? Found an item that doesn't belong to you?
        CARS is the centralized hub for campus lost and found, getting assets back to their true owners securely.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/login" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', borderRadius: '12px' }}>
          <Search size={24} />
          Explore Items
        </Link>
        <Link to="/admin/login" className="btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem', borderRadius: '12px' }}>
          Admin Portal
        </Link>
      </div>
    </div>
  );
}
