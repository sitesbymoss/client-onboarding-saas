import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight, LogIn, CheckCircle2 } from 'lucide-react';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import Templates from './pages/Templates';
import TemplateBuilder from './pages/TemplateBuilder';
import ProjectDetail from './pages/ProjectDetail';
import ClientPortal from './pages/ClientPortal';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
import NewProject from './pages/NewProject';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AuthProvider } from './lib/AuthProvider';

const Hero = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', stagger: 0.08 } });
      tl.from('.hero-elem', {
        y: 40,
        opacity: 0,
        duration: 1.2,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden pt-32 pb-24">
      {/* Light Mode Bright Ambient Ethereal Background */}
      <div className="absolute top-0 right-0 -mr-[20%] -mt-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-400/10 blur-[130px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-[20%] -mb-[10%] w-[60vw] h-[60vw] rounded-full bg-teal-400/10 blur-[120px] opacity-70 pointer-events-none" />

      <div className="relative z-10 w-full flex flex-col px-6 md:px-16 pt-10">
        <h1 className="hero-elem text-6xl md:text-8xl font-bold tracking-tighter text-textMain leading-[0.9]">
          Onboarding without limits <br />
          <span className="text-textMuted text-5xl md:text-7xl block mt-4 font-light tracking-tight">Frictionless.</span>
        </h1>
        <p className="hero-elem mt-8 text-lg max-w-full md:max-w-md text-textMuted font-medium leading-relaxed">
          Client onboarding for high-velocity teams. Zero manual data entry, seamless transitions, pure momentum.
        </p>
        <div className="hero-elem mt-10">
          <Link to="/signup" className="inline-flex bg-accent text-textMain px-8 py-4 rounded-full text-lg font-semibold items-center gap-2 hover:opacity-80 transition-colors shadow-lg shadow-accent/30 btn-magnetic">
            Get Started <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let ctx = gsap.context(() => {
      gsap.from('.pricing-elem', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.15
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="min-h-screen pt-48 pb-32 relative z-10 flex flex-col justify-center overflow-hidden w-full">
      {/* Subtle Background Glow for Pricing */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-opacity-80 blur-[120px] pointer-events-none" />

      <div className="w-full px-6 md:px-16 relative z-10">
        <div className="pricing-elem text-center md:text-left mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-textMain mb-4 leading-none">Accelerate your team</h2>
          <p className="text-lg md:text-xl text-textMuted font-light">Simple, transparent pricing for teams of all sizes.</p>
        </div>

        <div className="pricing-elem flex w-full">
          <div className="w-full bg-accent p-10 md:p-16 rounded-[2.5rem] md:rounded-[3rem] border border-accent/20 flex flex-col md:flex-row shadow-2xl relative overflow-hidden items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-16 text-center md:text-left">
              <h4 className="text-3xl md:text-4xl font-semibold mb-4 md:mb-6 text-textMain leading-tight">SwiftBoard</h4>
              <p className="text-textMain/70 mb-8 md:mb-10 text-sm md:text-base max-w-sm mx-auto md:mx-0 leading-relaxed">Get full access to all client onboarding tools with zero artificial limits.</p>
              <div className="text-5xl md:text-7xl font-bold text-textMain mb-2 leading-none">$49<span className="text-lg md:text-xl text-textMain/60 font-normal ml-2">/mo</span></div>
            </div>

            <div className="md:w-1/2 w-full flex flex-col pt-10 md:pt-0 md:pl-16 md:border-l border-primary/10 relative">
              <ul className="space-y-6 mb-10 flex-1">
                {['Unlimited active onboardings', 'Custom workflows & branding', '24/7 support'].map((item, i) => (
                  <li key={i} className="flex gap-4 md:gap-4 text-sm md:text-lg text-textMain items-center">
                    <CheckCircle2 size={24} className="text-textMain opacity-60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="w-full py-4 md:py-5 rounded-full bg-primary text-accent md:text-lg font-bold hover:opacity-80 transition-opacity btn-magnetic shadow-lg shadow-black/10 flex justify-center items-center">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Hero />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="templates" element={<Templates />} />
            <Route path="templates/new" element={<TemplateBuilder />} />
            <Route path="templates/:id" element={<TemplateBuilder />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/new" element={<NewProject />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/portal/:magic_token" element={<ClientPortal />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
