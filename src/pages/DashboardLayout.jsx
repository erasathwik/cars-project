import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, CheckCircle, Package, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { logoutUser, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Package /> <span>CARS</span>
        </div>
        
        <div className="sidebar-links">
          <NavLink to="/dashboard/items" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Search size={20} /> All Items
          </NavLink>
          <NavLink to="/dashboard/post" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} /> Post Item
          </NavLink>
          <NavLink to="/dashboard/my-posts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Package size={20} /> Your Posts
          </NavLink>
          <NavLink to="/dashboard/claims" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CheckCircle size={20} /> Claims
          </NavLink>
          <NavLink to="/dashboard/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <User size={20} /> Profile
          </NavLink>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {profile?.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{profile?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{profile?.roll_number}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', cursor: 'pointer', background: 'none' }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
