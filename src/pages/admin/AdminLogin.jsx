import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ShieldCheck, UserPlus } from 'lucide-react';

export default function AdminLogin() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await loginAdmin(formData.email, formData.password);
        navigate('/admin/items');
      } else {
        await axios.post('/api/admin/setup', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        alert('Admin account created! You can now log in.');
        setIsLogin(true);
        setFormData({ ...formData, password: '' });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page admin-theme animate-fade-in" style={{ backgroundColor: 'var(--bg-dark)' }}>
      <div className="glass-panel auth-box" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '50%' }}>
              <ShieldAlert size={48} color="var(--primary)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {isLogin ? 'Admin Portal restricted area' : 'Initialize New Admin'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Authorized personnel only' : 'Create an administration account'}
          </p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Admin Name</label>
              <input required type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div className="form-group">
            <label>Admin Email</label>
            <input required type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input required type="password" className="form-input" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
            {loading ? 'Processing...' : isLogin ? <><ShieldCheck size={20} /> Access Portal</> : <><UserPlus size={20} /> Create Admin</>}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {isLogin ? "Need an admin account? " : "Already initialized? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} style={{ background: 'none', color: 'var(--primary)', fontWeight: 600 }}>
            {isLogin ? 'Create one here' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
