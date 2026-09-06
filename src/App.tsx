// @ts-nocheck
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './custom.css';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import CreateResume from './pages/CreateResume';
import AllResumes from './pages/AllResumes';
import ResumeDetail from './pages/ResumeDetail';
import Auth from './pages/Auth';

export function App() {
  return (
    <Router>
      <div className="app-container d-flex flex-column min-vh-100">
        <Header />
        <main className="main-content flex-grow-1">
          <div className="container py-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateResume />} />
              <Route path="/resumes" element={<AllResumes />} />
              <Route path="/resume/:id" element={<ResumeDetail />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
