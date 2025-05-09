import React, { useState } from 'react';
import './signin-up.css';
import { Link } from 'react-router-dom';

const LoginSignup = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  // Signup states
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [signupError, setSignupError] = useState('');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!fullname || !email || !mobile || !password || !role) return setSignupError("All fields are required");
    if (!emailRegex.test(email)) return setSignupError("Invalid email format");
    if (!mobileRegex.test(mobile)) return setSignupError("Mobile must be 10 digits");
    if (!passwordRegex.test(password)) return setSignupError("Password must be 8+ chars, include uppercase, number, and symbol");

    try {
      const res = await fetch("http://localhost:5174/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullname, email, mobile, password, role }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Signup successful! You can now login.");
        setIsSignUp(false);
      } else {
        setSignupError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setSignupError("Server error during signup");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('http://localhost:5174/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        const role = data.user.role;
        if (role === 'student') window.location.href = '/student-dashboard';
        else if (role === 'instructor') window.location.href = '/instructor-dashboard';
        else if (role === 'admin') window.location.href = '/admin-dashboard';
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Server error during login');
    }
  };

  return (
    <div>
      <nav className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center logo-container">
          <h2 className="ms-2">Ascend</h2>
        </div>
        <div className="d-flex align-items-center nav-links">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/login" className="btn btn-light ms-3">Get Started</Link>
        </div>
      </nav>

      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`} id="container">
        {/* Sign Up Form */}
        <div className="form-container sign-up">
          <form onSubmit={handleSignup}>
            <h1>Create Your Ascend Account</h1>
            <span>Or use your email to join Ascend</span>
            {<p className="signup-error">{signupError}</p>}
            <input type="text" placeholder="Full Name" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="text" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
            <input type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <select className="user-role" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="">Select Role</option>
              <option value="student">🎓 Student</option>
              <option value="instructor">👨‍🏫 Instructor</option>
            </select>
            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1 className="signinhead">Sign In to Ascend</h1>
            <span>Or log in with your email</span>
            {loginError && <p className="error-text">{loginError}</p>}
            <input type="email" placeholder="Email Address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            <Link to="#">Forgot Your Password?</Link>
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back to Ascend!</h1>
              <p>Continue your learning journey and unlock new skills with Ascend's personalized platform.</p>
              <button className="hidden" onClick={() => setIsSignUp(false)}>Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Join the Ascend Community!</h1>
              <p>Sign up now and start building skills that will help you unlock your potential.</p>
              <button className="hidden" onClick={() => setIsSignUp(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
