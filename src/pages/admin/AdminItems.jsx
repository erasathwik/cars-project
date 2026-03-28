import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, ShieldCheck } from 'lucide-react';

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get('/api/admin/items');
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) return <div className="animate-fade-in">Loading platform items...</div>;

  return (
    <div className="animate-fade-in admin-theme" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package color="var(--primary)" /> Moderation: All Items
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Overview of all assets posted by users on the platform</p>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Image & Details</th>
                <th>Status</th>
                <th>Posted By</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{item.id.substring(0, 8)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={20} color="var(--text-muted)" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category} • {item.location_found}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.status}`}>{item.status}</span>
                  </td>
                  <td>
                    <div>{item.users?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.users?.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>({item.users?.roll_number})</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No items reported on the platform yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
