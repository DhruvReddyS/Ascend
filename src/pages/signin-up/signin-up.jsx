import React, { useState } from 'react';
import './signin-up.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGooglePlusG,
  faFacebookF,
  faGithub,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons';

const LoginSignup = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div>
      {/* Navbar */}
      <nav className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center logo-container">
          <h2 className="ms-2">Ascend</h2>
        </div>
        <div className="d-flex align-items-center nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/login" className="btn btn-light ms-3">Get Started</Link>
        </div>
      </nav>

      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`} id="container">
        {/* Sign Up Form */}
        <div className="form-container sign-up">
          <form>
            <h4>Create Your Ascend Account</h4>
            <div className="social-icons">
              <Link to="#" className="icon"><FontAwesomeIcon icon={faGooglePlusG} /></Link>
              <Link to="#" className="icon"><FontAwesomeIcon icon={faFacebookF} /></Link>
              <Link to="#" className="icon"><FontAwesomeIcon icon={faGithub} /></Link>
              <Link to="#" className="icon"><FontAwesomeIcon icon={faLinkedinIn} /></Link>
            </div>
            <span>Or use your email to join Ascend</span>
            <input type="text" placeholder="Full Name" />
            <input type="email" placeholder="Email Address" />
            <input type="text" placeholder="Mobile Number" />
            <input type="password" placeholder="Create Password" />
            <select className="user-role" required>
              <option value="">Select Role</option>
              <option value="student">🎓 Student</option>
              <option value="instructor">👨‍🏫 Instructor</option>
            </select>
            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in">
          <form>
            <h1 className="signinhead">Sign In to Ascend</h1>
            <div className="social-icons">
              <Link to="#" className="icon"><FontAwesomeIcon icon={faGooglePlusG} /></Link>
              <Link to="#" className="icon"><FontAwesomeIcon icon={faFacebookF} /></Link>
              <Link to="#" className="icon"><FontAwesomeIcon icon={faGithub} /></Link>
              <Link to="#" className="icon"><FontAwesomeIcon icon={faLinkedinIn} /></Link>
            </div>
            <span>Or log in with your email</span>
            <input type="email" placeholder="Email Address" />
            <input type="password" placeholder="Password" />
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
