import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import PostSkill from './pages/PostSkill';
import NeedSkill from './pages/NeedSkill';
import SkillsList from './components/SkillsList';
import Features from './pages/Features';
import { Profile } from './pages/Profile';
import TechEvents from './pages/TechEvents';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/post-skill" element={<PostSkill />} />
              <Route path="/need-skill" element={<NeedSkill />} />
              <Route path="/features" element={<Features />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/techevents" element={<TechEvents />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
            <SkillsList />
          </main>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;