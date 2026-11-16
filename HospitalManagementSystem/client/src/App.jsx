import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Doctors from './pages/Doctors.jsx';
import Patients from './pages/Patients.jsx';
import Appointments from './pages/Appointments.jsx';

// if token is saved in localStorage then user is logged in
function isLoggedIn() {
  return !!localStorage.getItem('hms_token');
}

function Protected({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('hms_user') || '{}');

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Hospital Management System</div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/doctors">Doctors</NavLink>
          <NavLink to="/patients">Patients</NavLink>
          <NavLink to="/appointments">Appointments</NavLink>
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user.name || 'Admin'}</div>
          <div className="sidebar-user-email">{user.email || ''}</div>
          <button className="btn btn-light btn-block" onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="content">
        {children}
        <footer className="footer">Developed by Ujjwal Gupta | Chandigarh University</footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Layout><Dashboard /></Layout></Protected>} />
      <Route path="/doctors" element={<Protected><Layout><Doctors /></Layout></Protected>} />
      <Route path="/patients" element={<Protected><Layout><Patients /></Layout></Protected>} />
      <Route path="/appointments" element={<Protected><Layout><Appointments /></Layout></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
