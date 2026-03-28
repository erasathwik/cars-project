import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import Profile from './pages/Profile';
import AllItems from './pages/AllItems';
import PostItem from './pages/PostItem';
import YourPosts from './pages/YourPosts';
import Claims from './pages/Claims';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminItems from './pages/admin/AdminItems';
import AdminClaims from './pages/admin/AdminClaims';

const ProtectedRoute = ({ children }) => {
  const { user, profile } = useAuth();
  if (!user || !profile) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/admin/login" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* User Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard/items" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="items" element={<AllItems />} />
        <Route path="post" element={<PostItem />} />
        <Route path="my-posts" element={<YourPosts />} />
        <Route path="claims" element={<Claims />} />
      </Route>

      {/* Admin Panel */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Navigate to="/admin/items" replace />} />
        <Route path="items" element={<AdminItems />} />
        <Route path="claims" element={<AdminClaims />} />
      </Route>
    </Routes>
  );
}

export default App;
