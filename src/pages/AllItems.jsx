import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Calendar, HelpCircle, Check, X } from 'lucide-react';

export default function AllItems() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingItem, setClaimingItem] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [claimLoading, setClaimLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await axios.get('/api/items');
      setItems(data.filter(item => item.status === 'found'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startClaim = async (item) => {
    setClaimingItem(item);
    setAnswers({});
    try {
      const { data } = await axios.get(`/api/items/${item.id}/questions`);
      setQuestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitClaim = async () => {
    setClaimLoading(true);
    try {
      await axios.post('/api/claim', {
        item_id: claimingItem.id,
        claimed_by: user.id,
        answers
      });
      alert('Claim submitted successfully! Wait for admin approval.');
      setClaimingItem(null);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit claim');
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) return <div className="animate-fade-in">Loading items...</div>;

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Items Found on Campus</h1>
      </header>
      
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No found items currently listed.
        </div>
      ) : (
        <div className="grid-cards">
          {items.map(item => (
            <div key={item.id} className="item-card glass-panel">
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
                  <span className="badge found">{item.status}</span>
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
                  {item.posted_by !== user.id && (
                    <button onClick={() => startClaim(item)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
                      Claim Item
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {claimingItem && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ position: 'relative', background: 'var(--bg-dark)' }}>
            <button className="modal-close" onClick={() => setClaimingItem(null)}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '0.5rem' }}>Claim {claimingItem.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              To verify you are the actual owner, please answer the security questions provided by the finder.
            </p>
            
            {questions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {questions.map((q, idx) => (
                  <div key={q.id} className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label>{idx + 1}. {q.question}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Your answer"
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: 8 }}>
                No security questions provided. You can still submit a claim. Give any proof you have.
              </p>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setClaimingItem(null)}>Cancel</button>
              <button className="btn-primary" onClick={submitClaim} disabled={claimLoading}>
                {claimLoading ? 'Submitting...' : 'Submit Claim'} <Check size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
