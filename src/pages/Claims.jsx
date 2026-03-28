import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, Tag, Info } from 'lucide-react';

export default function Claims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const { data } = await axios.get(`/api/claims/user/${user.id}`);
        setClaims(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [user]);

  if (loading) return <div className="animate-fade-in">Loading claims...</div>;

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Your Claims</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track the status of items you've claimed</p>
        </div>
      </header>

      {claims.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          You haven't made any claims yet.
        </div>
      ) : (
        <div className="grid-cards">
          {claims.map(claim => (
            <div key={claim.id} className="item-card glass-panel" style={{ borderLeft: `4px solid ${claim.status === 'approved' ? 'var(--success)' : claim.status === 'rejected' ? 'var(--danger)' : 'var(--warning)'}` }}>
              <div className="item-content">
                <div className="item-title">
                  {claim.items?.title}
                  <span className={`badge ${claim.status}`}>{claim.status}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <Tag size={14} style={{ display: 'inline', marginRight: 4 }} />
                  {claim.items?.category}
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-muted)', flex: 1 }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={16} /> Answers Provided
                  </div>
                  {claim.proof ? (
                    <ul style={{ paddingLeft: '1.2rem' }}>
                      {Object.entries(JSON.parse(claim.proof)).map(([qId, ans], idx) => (
                        <li key={qId} style={{ marginBottom: '0.25rem' }}>Ans {idx + 1}: {ans}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>No answers provided</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Claimed on {new Date(claim.created_at).toLocaleDateString()}
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
