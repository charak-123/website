import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import WaitlistModal from './components/WaitlistModal';
import Home from './pages/Home';
import Register from './pages/Register';
import Auth from './pages/Auth';
import RegisterSuccess from './pages/RegisterSuccess';
import Legal from './pages/Legal';
import Contact from './pages/Contact';

export default function App() {
  const [waitlist, setWaitlist] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout onWaitlist={() => setWaitlist(true)}>
          <Routes>
            <Route path="/" element={<Home onWaitlist={() => setWaitlist(true)} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/success" element={<RegisterSuccess />} />
            <Route path="/signin" element={<Auth mode="signin" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/privacy" element={<Legal type="privacy" />} />
            <Route path="/terms" element={<Legal type="terms" />} />
            <Route path="/disclaimer" element={<Legal type="disclaimer" />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Layout>
        {waitlist && <WaitlistModal close={() => setWaitlist(false)} />}
      </BrowserRouter>
    </AuthProvider>
  );
}
