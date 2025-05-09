import React, { useState } from 'react';
import './studentdash.css';

const StudentDashboard = () => {
  const [section, setSection] = useState('overview');

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = '/';
  };

  return (
    <div className="student-dashboard">
      <nav className="navbar">
        <h2>Ascend</h2>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="sidebar">
        <h3>🎓 Student Panel</h3>
        <ul>
          <li onClick={() => setSection('overview')}>📊 Overview</li>
          <li onClick={() => setSection('courses')}>📚 My Courses</li>
          <li onClick={() => setSection('progress')}>📈 Progress</li>
          <li onClick={() => setSection('profile')}>👤 Profile</li>
        </ul>
      </div>

      <main className="main-content">
        {section === 'overview' && (
          <section>
            <h1>Welcome to Ascend, Learner!</h1>
            <p>📌 Here's your learning summary</p>
            <ul>
              <li>📘 Enrolled Courses: 4</li>
              <li>⏱ Total Learning Time: 12 hrs</li>
              <li>🏆 Skills Completed: 6</li>
            </ul>
          </section>
        )}
        {section === 'courses' && (
          <section>
            <h2>My Courses</h2>
            <p>🧑‍💻 Display enrolled courses here...</p>
          </section>
        )}
        {section === 'progress' && (
          <section>
            <h2>Progress Tracker</h2>
            <p>📊 Charts or progress bars go here...</p>
          </section>
        )}
        {section === 'profile' && (
          <section>
            <h2>My Profile</h2>
            <p>📝 User info, edit options...</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
