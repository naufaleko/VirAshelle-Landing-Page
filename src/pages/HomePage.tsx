import React from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Services } from '../components/Services';
import { WhyUs } from '../components/WhyUs';
import { Workflow } from '../components/Workflow';
import { Portfolio } from '../components/Portfolio';
import { Milestone } from '../components/Milestone';
import { KeyPeople } from '../components/KeyPeople';
import { Clients } from '../components/Clients';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { useAdmin } from '../lib/AdminContext';

export function HomePage() {
  const { user } = useAdmin();
  
  return (
    <div className="bg-[#0C0C0C] text-white min-h-screen font-sans selection:bg-[#7d39eb] selection:text-white">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <WhyUs />
        <Workflow />
        <Portfolio />
        <Milestone />
        <KeyPeople />
        <Clients />
      </main>
      <Footer />
      
      {/* Floating Login/Admin Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link 
          to="/admin"
          className="bg-[#7d39eb] hover:bg-[#6c2bd9] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transition-colors inline-block"
        >
          {user ? 'Dashboard' : 'Login'}
        </Link>
      </div>
    </div>
  );
}
