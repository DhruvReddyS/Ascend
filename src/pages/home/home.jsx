import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./home.css";

// Images
import section1 from "../../assets/images/section1.png";
import course1 from "../../assets/images/course1.png";
import course2 from "../../assets/images/course2.png";
import course3 from "../../assets/images/course3.png";
import course4 from "../../assets/images/course4.png";
import course5 from "../../assets/images/course5.png";
import course6 from "../../assets/images/course6.png";
import course7 from "../../assets/images/course7.png";
import course8 from "../../assets/images/course8.png";
import student1 from "../../assets/images/student1.jpg";
import student2 from "../../assets/images/student2.jpg";
import student3 from "../../assets/images/student3.jpg";
import student4 from "../../assets/images/student4.jpg";
import student5 from "../../assets/images/student5.jpg";
import student6 from "../../assets/images/student6.jpg";
import student7 from "../../assets/images/student7.jpg";
import student8 from "../../assets/images/student8.jpg";

const Home = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const section = document.querySelector(hash);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const courses = [
    { img: course1, title: "Web Development", desc: "Master the art of creating websites and applications using modern technologies." },
    { img: course2, title: "Data Science", desc: "Unlock the secrets of data analysis, machine learning, and AI in real-world applications." },
    { img: course3, title: "Digital Marketing", desc: "Master SEO, content strategy, and paid campaigns to grow businesses online." },
    { img: course4, title: "Machine Learning", desc: "Dive into machine learning algorithms, deep learning, and AI models for real-world applications." },
    { img: course5, title: "Cyber Security", desc: "Learn the best practices for securing systems, networks, and data against cyber threats." },
    { img: course6, title: "DevOps", desc: "Understand the principles of DevOps and how to implement automation in the development process." },
    { img: course7, title: "Cloud Computing", desc: "Master AWS, Azure, and Google Cloud services to become a certified cloud architect or engineer." },
    { img: course8, title: "UI/UX Design", desc: "Design user-friendly interfaces, craft smooth user journeys, and master design tools like Figma & Adobe XD." },
  ];

  const reviews = [
    { img: student1, user: "@SarahL", course: "Data Science", opinion: "🚀 Ascend revolutionized how I learn. Real-time progress kept me motivated! 📈" },
    { img: student2, user: "@JohnD", course: "Web Development", opinion: "💻 Learned Web Development with real projects. Ascend made coding fun! 📊" },
    { img: student3, user: "@EmilyR", course: "Full Stack", opinion: "🎥 Loved learning Full Stack through videos and interactive quizzes. 📱" },
    { img: student4, user: "@MarkT", course: "Cybersecurity", opinion: "🔒 Cybersecurity journey made easy with dashboards and flexible learning! 🏅" },
    { img: student5, user: "@OliviaW", course: "AI & ML", opinion: "🤖 Ascend unlocked AI and ML for me. Brilliant content! 📚" },
    { img: student6, user: "@JamesM", course: "Marketing", opinion: "📈 Marketing paths + case studies made theory practical. 🖥️" },
    { img: student7, user: "@RachelP", course: "UX/UI", opinion: "🎨 UX/UI modules helped me track design skills perfectly. 🖌️" },
    { img: student8, user: "@LiamB", course: "DevOps", opinion: "⚙️ DevOps made simple with structured modules. 🚀" },
  ];

  return (
    <>
      {/* Navbar */}
      <nav>
        <div><h2>Ascend</h2></div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="#courses">Courses</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
          <Link to="/signup" className="btn btn-light">Get Started</Link>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="hero-card text-card">
          <h1>Ascend</h1>
          <h2>Your Next Skill Awaits.</h2>
          <p>Unlock your potential. Build skills that shape your future. Start your journey today.</p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn-primary">Start Learning</Link>
            <Link to="/dashboard" className="btn-outline-primary">Browse Paths</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src={section1} alt="Hero Visual" />
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-section" id="courses">
        <h2>Explore Our Courses</h2>
        <p>Browse through our wide range of courses designed to enhance your skills in various fields.</p>
        <div className="courses-grid">
          {courses.map((course, idx) => (
            <div className="course-item" key={idx}>
              <img src={course.img} alt={course.title} />
              <h4>{course.title}</h4>
              <p>{course.desc}</p>
            </div>
          ))}
        </div>
        <div className="view-more-btn-container">
          <Link to="/courses" className="btn-outline-primary">View More Courses</Link>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="ascend-roadmap" id="roadmap">
        <h2 className="section-title text-center">Your Journey at Ascend 🚀</h2>
        <div className="roadmap-wrapper">
          {[
            "Sign Up and Create Your Profile",
            "Select Your Learning Path",
            "Engage with Real-World Projects",
            "Track Your Progress Live",
            "Get Certified and Showcase Skills"
          ].map((title, i) => (
            <div className={`roadmap-item ${i % 2 === 0 ? "left" : "right"}`} key={i}>
              <div className="roadmap-circle pulse">{i + 1}</div>
              <div className="roadmap-card">
                <h5>{title}</h5>
                <p>{[
                  "Launch your journey by setting up a learner or instructor profile tailored to your goals.",
                  "Choose from tracks like Full Stack, Data Science, ML, or Design!",
                  "Real assignments, challenges, capstone projects, hands-on studies.",
                  "Track mastery, completion, and growth with your dashboard.",
                  "Earn certificates and badges to boost your career and credibility!"
                ][i]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <h2 className="section-title">Why Choose Ascend?</h2>
        <div className="features-list">
          {[
            { icon: "🚀", title: "Personalized Learning", desc: "Tailored pathways that fit your goals and style of learning." },
            { icon: "🛠️", title: "Hands-on Projects", desc: "Learn by doing — real-world projects build real skills." },
            { icon: "📈", title: "Progress Tracking", desc: "Stay motivated and track your growth visually." },
            { icon: "🎯", title: "Expert Mentors", desc: "Get guidance and support from experienced professionals." }
          ].map((f, i) => (
            <div className="feature-item" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="student-opinion-section">
        <h2 className="section-title">What Our Students Say</h2>
        <div className="scroll-wrapper">
          <div className="student-opinion-cards">
            {[...reviews, ...reviews].map((r, i) => (
              <div className="opinion-card" key={i}>
                <img src={r.img} alt={r.user} className="student-photo" />
                <p className="student-opinion">{r.opinion}</p>
                <h5><span className="username">{r.user}</span><br />{r.course} Student</h5>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-us-section" id="contact">
        <div className="contact-container">
          <div className="contact-text">
            <h2>Let's Build Your Next Skill Together</h2>
            <p>Have a question, need support, or just want to say hello? We’re here to support your learning journey every step of the way. 📚</p>
          </div>
          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Tell us how we can help you..." required></textarea>
            <button type="submit">Reach Out</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3>Ascend 🚀</h3>
            <p>Unlock your full potential with real-world learning, one step at a time.</p>
          </div>
          <div className="footer-links">
            <a href="#hero">Home</a>
            <a href="#courses">Courses</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
            <Link to="/signup" className="btn btn-light">Get Started</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Ascend. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Home;
