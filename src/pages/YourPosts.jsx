import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, MapPin, Calendar, HelpCircle } from 'lucide-react';

export default function YourPosts() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get('/api/items');
        setItems(data.filter(item => item.posted_by === user.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [user]);

  if (loading) return <div className="animate-fade-in">Loading your posts...</div>;

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Your Posted Items</h1>
      </header>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          You haven't posted any found items yet.
        </div>
      ) : (
        <div className="grid-cards">
          {items.map(item => (
            <div key={item.id} className="item-card glass-panel" style={{ position: 'relative' }}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="item-image" />
              ) : (
                <div className="item-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>
                  <HelpCircle size={48} color="var(--text-muted)" />
                </div>
              )}
              <div className="item-content">
                <div className="item-title">
                  {item.title}
                  <span className={`badge ${item.status}`}>{item.status}</span>
                </div>
                <div className="item-location">
                  <MapPin size={16} /> {item.location_found}
                </div>
                <div className="item-desc">{item.description}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                    <Package size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    {item.category}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
