import React, { useState } from 'react';


const AdminDashboard = () => {
  const [section, setSection] = useState('users');

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/';
  };

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <h2>Ascend</h2>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="sidebar">
        <h3>🛡️ Admin Panel</h3>
        <ul>
          <li onClick={() => setSection('users')}>👥 Manage Users</li>
          <li onClick={() => setSection('reports')}>📄 Reports</li>
          <li onClick={() => setSection('settings')}>⚙️ Settings</li>
        </ul>
      </div>

      <main className="main-content">
        {section === 'users' && (
          <section>
            <h2>Manage Users</h2>
            <p>👨‍💼 Approve instructors, view students...</p>
          </section>
        )}
        {section === 'reports' && (
          <section>
            <h2>Reports</h2>
            <p>📈 Analytics and stats go here...</p>
          </section>
        )}
        {section === 'settings' && (
          <section>
            <h2>Settings</h2>
            <p>⚙️ Admin preferences...</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
