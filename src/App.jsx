import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import WaitlistModal from './components/WaitlistModal';
import Home from './pages/Home';
import Register from './pages/Register';
import Legal from './pages/Legal';
import Contact from './pages/Contact';

export default function App() {
  const [waitlist, setWaitlist] = useState(false);

  return (
    <BrowserRouter>
      <Layout onWaitlist={() => setWaitlist(true)}>
        <Routes>
          <Route path="/" element={<Home onWaitlist={() => setWaitlist(true)} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/privacy" element={<Legal type="privacy" />} />
          <Route path="/terms" element={<Legal type="terms" />} />
          <Route path="/disclaimer" element={<Legal type="disclaimer" />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
      {waitlist && <WaitlistModal close={() => setWaitlist(false)} />}
    </BrowserRouter>
  );
}
