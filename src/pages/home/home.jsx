import "./home.css";
import heroImage from "../../assets/images/section1.png";
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
  const courseImages = [
    course1,
    course2,
    course3,
    course4,
    course5,
    course6,
    course7,
    course8,
  ];

  const studentImages = [
    student1,
    student2,
    student3,
    student4,
    student5,
    student6,
    student7,
    student8
  ];

  return (
    <>
      {/* Navbar */}
      <nav className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center logo-container">
          <h2 className="ms-2">Ascend</h2>
        </div>
        <div className="d-flex align-items-center nav-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/courses">Courses</a>
          <a href="/login" className="btn btn-light ms-3">Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-card text-card">
          <h1>Ascend</h1>
          <h2>Your Next Skill Awaits.</h2>
          <p>Unlock your potential. Build skills that shape your future. Start your journey today.</p>
          <div className="hero-buttons">
            <a href="/signup" className="btn-primary">Start Learning</a>
            <a href="/dashboard" className="btn-outline-primary">Browse Paths</a>
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="Learning Image" />
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-section container text-center py-5">
        <h2>Explore Our Courses</h2>
        <p>Browse through our wide range of courses designed to enhance your skills in various fields.</p>

        <div className="courses-grid">
          {courseImages.map((img, i) => (
            <div className="course-item m-3" key={i}>
              <img src={img} alt={`Course ${i + 1}`} className="course-img" />
              <h4>{[
                "Web Development",
                "Data Science",
                "Digital Marketing",
                "Machine Learning",
                "Cyber Security",
                "DevOps",
                "Cloud Computing",
                "UI/UX Design"
              ][i]}</h4>
              <p>{[
                "Master the art of creating websites and applications using modern technologies.",
                "Unlock the secrets of data analysis, machine learning, and AI in real-world applications.",
                "Master SEO, content strategy, and paid campaigns to grow businesses online.",
                "Dive into machine learning algorithms, deep learning, and AI models for real-world applications.",
                "Learn the best practices for securing systems, networks, and data against cyber threats.",
                "Understand the principles of DevOps and how to implement automation in the development process.",
                "Master AWS, Azure, and Google Cloud services to become a certified cloud architect or engineer.",
                "Design user-friendly interfaces, craft smooth user journeys, and master design tools like Figma & Adobe XD."
              ][i]}</p>
            </div>
          ))}
        </div>

        <div className="view-more-btn-container text-center mt-4">
          <a href="/courses" className="btn-outline-primary">View More Courses</a>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="ascend-roadmap container py-5">
        <h2 className="section-title text-center">Your Journey at Ascend 🚀</h2>
        <div className="roadmap-wrapper">
          {[...Array(5)].map((_, i) => (
            <div className={`roadmap-item ${i % 2 === 0 ? 'left' : 'right'}`} key={i}>
              <div className="roadmap-circle pulse">{i + 1}</div>
              <div className="roadmap-card">
                <h5>{[
                  "Sign Up and Create Your Profile",
                  "Select Your Learning Path",
                  "Engage with Real-World Projects",
                  "Track Your Progress Live",
                  "Get Certified and Showcase Skills"
                ][i]}</h5>
                <p>{[
                  "Launch your journey by setting up a learner or instructor profile tailored to your goals.",
                  "Choose from career tracks like Full Stack Dev, Data Science, Machine Learning, or Design!",
                  "Learn by doing: real assignments, challenges, capstone projects, and hands-on case studies.",
                  "Use personalized dashboards and analytics to track mastery, completion, and growth rates.",
                  "Earn industry-recognized certificates and badges to boost your career and credibility!"
                ][i]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Ascend?</h2>
        <div className="features-list">
          {["🚀", "🛠️", "📈", "🎯"].map((icon, i) => (
            <div className="feature-item" key={i}>
              <div className="feature-icon">{icon}</div>
              <h4>{[
                "Personalized Learning",
                "Hands-on Projects",
                "Progress Tracking",
                "Expert Mentors"
              ][i]}</h4>
              <p>{[
                "Tailored pathways designed to fit your goals, pace, and style of learning.",
                "Learn by doing — work on real-world projects to build practical skills.",
                "See your improvements in real-time, and stay motivated on your journey.",
                "Guidance and feedback from industry professionals to sharpen your skills."
              ][i]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Student Opinion Section */}
      <section className="student-opinion-section container py-5">
        <h2 className="section-title">What Our Students Say</h2>
        <div className="scroll-wrapper">
          <div className="student-opinion-cards">
            {[...Array(8)].map((_, i) => (
              <div className="opinion-card" key={i}>
                <img src={studentImages[i]} alt={`@student${i + 1}`} className="student-photo" />
                <p className="student-opinion">{[
                  "🚀 Ascend revolutionized how I learn. Real-time progress kept me motivated! 📈",
                  "💻 Learned Web Development with real projects. Ascend made coding fun! 📊",
                  "🎥 Loved learning Full Stack through videos and interactive quizzes. 📱",
                  "🔒 Cybersecurity journey made easy with dashboards and flexible learning! 🏅",
                  "🤖 Ascend unlocked AI and ML for me. Brilliant content! 📚",
                  "📈 Digital Marketing paths plus case studies made theory practical. 🖥️",
                  "🎨 UX/UI modules helped me track design skills perfectly. 🖌️",
                  "⚙️ DevOps made simple with structured modules. 🚀"
                ][i]}</p>
                <h5><span className="username">{[
                  "@SarahL",
                  "@JohnD",
                  "@EmilyR",
                  "@MarkT",
                  "@OliviaW",
                  "@JamesM",
                  "@RachelP",
                  "@LiamB"
                ][i]}</span><br />{[
                  "Data Science Student",
                  "Web Development Student",
                  "Full Stack Development Student",
                  "Cybersecurity Student",
                  "AI & ML Student",
                  "Digital Marketing Student",
                  "UX/UI Design Student",
                  "DevOps Student"
                ][i]}</h5>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-us-section">
        <div className="contact-container">
          <div className="contact-text">
            <h2>Let's Build Your Next Skill Together</h2>
            <p>Have a question, need support, or just want to say hello?  We're here to support your learning journey every step of the way. 📚</p>
          </div>

          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Tell us how we can help you..." required></textarea>
            <button type="submit">Reach Out</button>
          </form>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3>Ascend 🚀</h3>
            <p>Unlock your full potential with real-world learning, one step at a time.</p>
          </div>
          <div className="footer-links">
            <a href="#">Home</a>
            <a href="#">Programs</a>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
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