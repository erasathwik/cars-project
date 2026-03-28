import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const { loginUser, signupUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', roll_number: '', mobile_number: '', branch: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(formData.email, formData.password);
        navigate('/dashboard/items');
      } else {
        await signupUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          roll_number: formData.roll_number,
          mobile_number: formData.mobile_number,
          branch: formData.branch,
        });
        alert('Signup success! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="glass-panel auth-box">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Login to access your CARS dashboard' : 'Join CARS to find and recover items'}
          </p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input required className="form-input" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input required className="form-input" name="roll_number" value={formData.roll_number} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input required className="form-input" name="mobile_number" value={formData.mobile_number} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input required className="form-input" name="branch" value={formData.branch} onChange={handleChange} />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input required type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input required type="password" className="form-input" name="password" value={formData.password} onChange={handleChange} minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Processing...' : isLogin ? <><LogIn size={20} /> Login</> : <><UserPlus size={20} /> Sign Up</>}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} style={{ background: 'none', color: 'var(--primary)', fontWeight: 600 }}>
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
