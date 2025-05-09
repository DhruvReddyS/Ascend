import React, { useState } from 'react';

const InstructorDashboard = () => {
  const [section, setSection] = useState('resources');

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/';
  };

  return (
    <div className="instructor-dashboard">
      <nav className="navbar">
        <h2>Ascend</h2>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="sidebar">
        <h3>👨‍🏫 Instructor Panel</h3>
        <ul>
          <li onClick={() => setSection('resources')}>📂 Manage Resources</li>
          <li onClick={() => setSection('progress')}>📈 Learner Progress</li>
          <li onClick={() => setSection('profile')}>👤 Profile</li>
        </ul>
      </div>

      <main className="main-content">
        {section === 'resources' && (
          <section>
            <h2>Upload & Manage Resources</h2>
            <p>📎 Add PDFs, videos, links here...</p>
          </section>
        )}
        {section === 'progress' && (
          <section>
            <h2>Track Learner Progress</h2>
            <p>📊 View charts and data...</p>
          </section>
        )}
        {section === 'profile' && (
          <section>
            <h2>My Profile</h2>
            <p>📝 Edit your details...</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default InstructorDashboard;
