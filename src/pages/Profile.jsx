import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Book, GraduationCap } from 'lucide-react';

export default function Profile() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 600 }}>
      <header className="page-header">
        <h1 className="page-title">My Profile</h1>
      </header>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
            {profile.name?.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{profile.name}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Student • {profile.branch}</p>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: 8 }}>
              <User size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Roll Number</div>
              <div style={{ fontWeight: 500 }}>{profile.roll_number}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: 8 }}>
              <Mail size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email Address</div>
              <div style={{ fontWeight: 500 }}>{profile.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: 8 }}>
              <Phone size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mobile Number</div>
              <div style={{ fontWeight: 500 }}>{profile.mobile_number}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: 8 }}>
              <Book size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Branch/Department</div>
              <div style={{ fontWeight: 500 }}>{profile.branch}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
