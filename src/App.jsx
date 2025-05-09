import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/home';
import Signinup from './pages/signin-up/signin-up';
import StudentDashboard from './pages/studentdash/studentdash';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Signinup />} />
      <Route path="/signup" element={<Signinup />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
    </Routes>
  );
}

export default App;
