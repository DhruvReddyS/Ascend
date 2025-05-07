import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/home';
import Signinup from './pages/signin-up/signin-up';
import About from './pages/about/about';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Signinup />} />
      <Route path="/signup" element={<Signinup />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;
