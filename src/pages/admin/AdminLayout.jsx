import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, CheckSquare, ShieldCheck, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { logoutAdmin, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="dashboard-layout admin-theme animate-fade-in">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <ShieldCheck /> <span>AppControl</span>
        </div>
        
        <div className="sidebar-links">
          <NavLink to="/admin/items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Package size={20} /> Content Moderation
          </NavLink>
          <NavLink to="/admin/claims" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CheckSquare size={20} /> Claim Verification
          </NavLink>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #be123c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              A
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{admin?.name || 'Administrator'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>System Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', cursor: 'pointer', background: 'none', color: 'var(--danger)' }}>
            <LogOut size={20} /> Secure Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
