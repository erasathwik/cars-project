import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, CheckSquare, CheckCircle, XCircle, Search } from 'lucide-react';

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchClaims = async () => {
    try {
      const { data } = await axios.get('/api/admin/claims');
      setClaims(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleVerify = async (claimId, itemId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this claim?`)) return;
    setProcessingId(claimId);
    try {
      await axios.post('/api/admin/verify-claim', { claim_id: claimId, item_id: itemId, status });
      // Update local state temporarily
      setClaims(claims.map(c => c.id === claimId ? { ...c, status } : c));
      alert(`Claim successfully ${status}.`);
      fetchClaims();
    } catch (err) {
      alert('Verification failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="animate-fade-in">Loading claims data...</div>;

  return (
    <div className="animate-fade-in admin-theme" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckSquare color="var(--primary)" /> Claim Verification
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Review and verify submitted claims against security questions</p>
        </div>
      </header>

      {claims.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={48} style={{ opacity: 0.5, marginBottom: '1rem', display: 'inline-block' }} />
          <div>No outstanding claims to verify.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {claims.map(claim => (
            <div key={claim.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    Item: {claim.items?.title}
                    <span className={`badge ${claim.status}`}>{claim.status}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Claimed by: {claim.users?.name} ({claim.users?.roll_number}) • {claim.users?.email}</div>
                </div>
                {claim.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <button 
                      onClick={() => handleVerify(claim.id, claim.item_id, 'approved')} 
                      className="btn-success" 
                      disabled={processingId === claim.id}
                      style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <CheckCircle size={18} /> Approve
                    </button>
                    <button 
                      onClick={() => handleVerify(claim.id, claim.item_id, 'rejected')} 
                      className="btn-danger" 
                      disabled={processingId === claim.id}
                      style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={18} /> Verification Answers Q&A
                  </h3>
                  
                  {claim.security_questions && claim.security_questions.length > 0 ? (
                    claim.security_questions.map((q, idx) => {
                      const proofData = claim.proof ? JSON.parse(claim.proof) : {};
                      const userAnswer = proofData[q.id] || "No answer provided";
                      
                      return (
                        <div key={q.id} style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                          <div style={{ fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Q{idx+1}: {q.question}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: '0.25rem' }}>Expected Answer</div>
                              <div style={{ color: 'var(--success)' }}>{q.answer}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: '0.25rem' }}>User Answer</div>
                              <div>{userAnswer}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No security questions were set for this item. Evaluator must decide based on external proofs.
                    </div>
                  )}
                  
                  {(!claim.security_questions || claim.security_questions.length === 0) && claim.proof && (
                     <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: '0.25rem' }}>Custom Proof Provided (Raw)</div>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.875rem' }}>
                          {claim.proof}
                        </pre>
                     </div>
                  )}
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Item Snapshot Snapshot</h3>
                  {claim.items?.image_url && (
                    <img src={claim.items.image_url} alt="Item" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--glass-border)', marginBottom: '1rem' }} />
                  )}
                  <div style={{ fontSize: '0.875rem' }}>
                    <p><strong>Description:</strong> {claim.items?.description}</p>
                    <p><strong>Location Found:</strong> {claim.items?.location_found}</p>
                    <p><strong>Category:</strong> {claim.items?.category}</p>
                    <p><strong>Posted At:</strong> {claim.items ? new Date(claim.items.created_at).toLocaleString() : ''}</p>
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
