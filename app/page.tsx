// @ts-nocheck
"use client";

import { useEffect } from "react";
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  AlertCircle,
  FileCheck, 
  ChevronRight, 
  ArrowRight, 
  Check, 
  TrendingUp, 
  UserCheck2,
  Lock,
  MessageSquare
} from "lucide-react";
import "./page.css"; // Kept to import file, but all styling is now Tailwind

export default function Page() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { 
        if (e.isIntersecting) {
          e.target.classList.add("opacity-100", "translate-y-0");
          e.target.classList.remove("opacity-0", "translate-y-4");
        } 
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal-item").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1a1a18] font-sans selection:bg-sage/20 selection:text-sage">
      
      {/* HEADER NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/55 px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-300">
        <a href="/" className="font-serif text-2xl font-normal text-[#1a1a18] tracking-tight hover:opacity-85 transition">
          TherapyDesk
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-xs font-semibold text-[#1a1a18]">Home</a>
          <a href="/app" className="text-xs font-semibold text-stone-500 hover:text-[#1a1a18] transition">App</a>
          <a href="/contact" className="text-xs font-semibold text-stone-500 hover:text-[#1a1a18] transition">Contact</a>
          <a href="/admin" className="text-[11px] font-bold text-stone-400 hover:text-[#1a1a18] transition flex items-center gap-1 uppercase tracking-wider">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
          </a>
        </div>
        <a 
          href="/app" 
          className="px-4.5 py-2 bg-[#181816] hover:bg-sage text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition duration-200"
        >
          Start free trial →
        </a>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,106,79,0.05),transparent_60%)] pointer-events-none"></div>
        
        {/* Hero Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sage-light text-sage border border-sage-mid/30 rounded-full text-[10px] font-bold uppercase tracking-wider mb-8 animate-fadeUp">
          <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse"></span>
          <span>Built exclusively for solo practitioners</span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-normal text-ink tracking-tight max-w-4xl leading-[1.08] mb-6">
          Stop drowning in <br className="hidden sm:inline" />
          <span className="italic text-sage font-light">admin. See more patients.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-stone-500 text-sm md:text-base max-w-xl leading-relaxed mb-10 font-light">
          TherapyDesk automates your clinical session notes, smart scheduling, and patient invoicing — so you can dedicate your energy to healing.
        </p>

        {/* Hero CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4">
          <a 
            href="/app" 
            className="w-full sm:w-auto px-7 py-3.5 bg-ink hover:bg-sage text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200"
          >
            Try it free for 14 days →
          </a>
          <a 
            href="/contact" 
            className="w-full sm:w-auto px-7 py-3.5 bg-transparent border border-stone-300 text-stone-600 hover:border-ink hover:text-ink text-xs font-semibold rounded-lg transition duration-200"
          >
            Talk to our team
          </a>
        </div>

        {/* Social Proof */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-3.5">
          <div className="flex -space-x-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#8FAF8F] text-white font-semibold text-[10px] flex items-center justify-center shadow-sm">AM</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#6B8F8F] text-white font-semibold text-[10px] flex items-center justify-center shadow-sm">RK</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#9F7F8F] text-white font-semibold text-[10px] flex items-center justify-center shadow-sm">SP</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#7F8FAF] text-white font-semibold text-[10px] flex items-center justify-center shadow-sm">VN</div>
          </div>
          <span className="text-xs text-stone-500 font-light">
            Trusted by <b className="text-ink font-semibold">47+ independent therapists</b> across India
          </span>
        </div>
      </section>

      {/* STRIP FEATURE CAROUSEL */}
      <div className="bg-ink text-stone-400 py-4.5 overflow-hidden border-y border-stone-850">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs font-medium tracking-wide">
          <div className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-sage" /><span>AI SOAP Notes in seconds</span></div>
          <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-sage" /><span>HIPAA-compliant storage</span></div>
          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-sage" /><span>Smart Patient Scheduling</span></div>
          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-sage" /><span>Auto reminders & notifications</span></div>
        </div>
      </div>

      {/* PROBLEM SECTION */}
      <section className="bg-stone-100/60 py-20 px-6 md:px-12 border-b border-stone-200/50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="reveal-item transition-all duration-700 opacity-0 translate-y-4 space-y-4">
            <span className="text-[10px] font-bold text-sage uppercase tracking-wider">The Problem</span>
            <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight text-ink">
              You became a therapist to heal minds. Not to file paperwork.
            </h2>
            <p className="text-stone-500 text-xs md:text-sm font-light leading-relaxed">
              Solo practitioners lose an average of 2–3 hours every day to notes and scheduling tasks. That's time stolen from client therapy sessions — and your personal weekend.
            </p>
            <a 
              href="/app" 
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-sage hover:bg-sage/95 text-white text-xs font-semibold rounded-lg shadow transition duration-200 mt-2"
            >
              <span>See how TherapyDesk helps</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="reveal-item transition-all duration-700 opacity-0 translate-y-4 space-y-4">
            <div className="bg-white border border-stone-200/85 p-5 rounded-xl flex gap-4 hover:shadow-sm transition">
              <div className="font-serif text-xl font-bold text-stone-300">01</div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-ink">Manual session notes taking</h4>
                <p className="text-stone-500 text-xs font-light leading-relaxed">Writing SOAP notes by hand eats up hours. We generate structured summaries in 2 minutes.</p>
              </div>
            </div>

            <div className="bg-white border border-stone-200/85 p-5 rounded-xl flex gap-4 hover:shadow-sm transition">
              <div className="font-serif text-xl font-bold text-stone-300">02</div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-ink">Chasing appointment no-shows</h4>
                <p className="text-stone-500 text-xs font-light leading-relaxed">Missed sessions represent lost practice income. Auto reminders cut cancellations by 70%.</p>
              </div>
            </div>

            <div className="bg-white border border-stone-200/85 p-5 rounded-xl flex gap-4 hover:shadow-sm transition">
              <div className="font-serif text-xl font-bold text-stone-300">03</div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-ink">Tedious invoicing & billing</h4>
                <p className="text-stone-500 text-xs font-light leading-relaxed">Manually sending reminders, tracking payments, and issuing bills drains mental clarity daily.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CORE FEATURES DIRECTORY */}
      <section className="bg-white py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-3 reveal-item transition-all duration-700 opacity-0 translate-y-4">
            <span className="text-[10px] font-bold text-sage uppercase tracking-wider">What We Do</span>
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-ink">Everything your solo practice requires.</h2>
            <p className="text-stone-500 text-xs font-light leading-relaxed">
              Designed specifically for independent solo mental health professionals — not complex hospital system databases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <div className="bg-[#fafaf9] border border-stone-250/70 p-6 rounded-xl space-y-4 hover:border-sage-mid hover:bg-sage-light/25 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-sage-light text-sage flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink">AI-Generated SOAP Notes</h4>
                <p className="text-stone-550 text-xs font-light leading-relaxed">Write or paste raw clinical impressions shorthand. Our smart transformer structures precise SOAP logs inside 2 minutes for you to lock.</p>
              </div>
            </div>

            <div className="bg-[#fafaf9] border border-stone-250/70 p-6 rounded-xl space-y-4 hover:border-sage-mid hover:bg-sage-light/25 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-sage-light text-sage flex items-center justify-center shadow-inner">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink">Smart Practice Scheduling</h4>
                <p className="text-stone-550 text-xs font-light leading-relaxed">A clean, functional clinic calendar showing active appointments. Manage details, book dates, and structure your scheduling days seamlessly.</p>
              </div>
            </div>

            <div className="bg-[#fafaf9] border border-stone-250/70 p-6 rounded-xl space-y-4 hover:border-sage-mid hover:bg-sage-light/25 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-sage-light text-sage flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink">HIPAA-Compliant Storage</h4>
                <p className="text-stone-550 text-xs font-light leading-relaxed">All clinic and SOAP records encrypted at rest. Immutable audit logs trace every update. Your data stays legally protected and secure.</p>
              </div>
            </div>

            <div className="bg-[#fafaf9] border border-stone-250/70 p-6 rounded-xl space-y-4 hover:border-sage-mid hover:bg-sage-light/25 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-sage-light text-sage flex items-center justify-center shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink">Legal Signature Locking</h4>
                <p className="text-stone-550 text-xs font-light leading-relaxed">Digitally sign and seal clinical session files once finished. Prevent database modification to comply with audit guidelines.</p>
              </div>
            </div>

            <div className="bg-[#fafaf9] border border-stone-250/70 p-6 rounded-xl space-y-4 hover:border-sage-mid hover:bg-sage-light/25 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-sage-light text-sage flex items-center justify-center shadow-inner">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink">Income & Metric Audits</h4>
                <p className="text-stone-550 text-xs font-light leading-relaxed">Trace weekly session volume, monthly notes count, and client attendance analytics right on your main dashboard screen.</p>
              </div>
            </div>

            <div className="bg-[#fafaf9] border border-stone-250/70 p-6 rounded-xl space-y-4 hover:border-sage-mid hover:bg-sage-light/25 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-sage-light text-sage flex items-center justify-center shadow-inner">
                <UserCheck2 className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink">Clinical Patient Files</h4>
                <p className="text-stone-550 text-xs font-light leading-relaxed">Separate profiles tracking age, gender, diagnostic notes, referral sources, and historical SOAP session notes timeline feeds.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="bg-stone-100/60 py-20 px-6 md:px-12 border-y border-stone-200/50">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center max-w-md mx-auto space-y-3 reveal-item transition-all duration-700 opacity-0 translate-y-4">
            <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Fair Pricing</span>
            <h2 className="font-serif text-3xl font-normal text-ink">One flat rate. All features.</h2>
            <p className="text-stone-500 text-xs font-light">No tiers, no hidden setup fees, no limits. Simple clinical software.</p>
          </div>

          <div className="flex justify-center reveal-item transition-all duration-700 opacity-0 translate-y-4">
            <div className="w-full max-w-[420px] bg-white border-2 border-sage rounded-2xl p-8 relative shadow-lg">
              <div className="absolute top-0 left-1/2 -translate-y-1/2 -translate-x-1/2 px-3.5 py-1 bg-sage text-white text-[10px] font-semibold rounded-full uppercase tracking-wider whitespace-nowrap">
                Complete Professional Access
              </div>
              
              <div className="text-center pb-6 border-b border-stone-100 space-y-2">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">TherapyDesk Pro</span>
                <div className="flex items-center justify-center gap-1">
                  <span className="font-serif text-5xl font-normal text-ink">$200</span>
                  <span className="text-stone-500 text-xs font-light">/ month</span>
                </div>
                <p className="text-[10px] text-stone-400">Cancel or pause subscription anytime</p>
              </div>

              <ul className="py-6 space-y-3 text-xs text-stone-600">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sage flex-shrink-0" />
                  <span>AI SOAP clinical notes generator</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sage flex-shrink-0" />
                  <span>Interactive schedule practice calendar</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sage flex-shrink-0" />
                  <span>Unlimited client directories</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sage flex-shrink-0" />
                  <span>Legal signature locking audits</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sage flex-shrink-0" />
                  <span>HIPAA-compliant server storage</span>
                </li>
              </ul>

              <div className="space-y-3">
                <a 
                  href="/app" 
                  className="w-full py-3 bg-sage hover:bg-sage/95 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition flex items-center justify-center cursor-pointer"
                >
                  Start 14-day free trial
                </a>
                <p className="text-[10.5px] text-stone-400 text-center font-light">No credit card details required to explore.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-sm mx-auto space-y-2 reveal-item transition-all duration-700 opacity-0 translate-y-4">
            <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Testimonials</span>
            <h2 className="font-serif text-3xl font-normal text-ink">Real therapists, real hours saved</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[#fafaf9] border border-stone-200/80 p-6 rounded-xl space-y-5 flex flex-col justify-between">
              <p className="font-serif text-base text-ink italic leading-relaxed font-light">
                "I used to lose my entire Sunday afternoon typing session records. Now I seal everything by Friday evening. TherapyDesk returned my weekends back."
              </p>
              <div className="flex items-center gap-3.5 pt-4 border-t border-stone-200/50">
                <div className="w-9 h-9 rounded-full bg-sage-light text-sage font-bold text-xs flex items-center justify-center border border-sage/10">SR</div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Dr. Sunita Rao</h4>
                  <p className="text-[10px] text-stone-400">Clinical Psychologist, Pune</p>
                </div>
              </div>
            </div>

            <div className="bg-[#fafaf9] border border-stone-200/80 p-6 rounded-xl space-y-5 flex flex-col justify-between">
              <p className="font-serif text-base text-ink italic leading-relaxed font-light">
                "The structured notes formatting is outstanding. Reviewing and signing drafts takes me 3 minutes instead of writing logs from scratch for 40 minutes."
              </p>
              <div className="flex items-center gap-3.5 pt-4 border-t border-stone-200/50">
                <div className="w-9 h-9 rounded-full bg-sage-light text-sage font-bold text-xs flex items-center justify-center border border-sage/10">AK</div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Arjun Kulkarni</h4>
                  <p className="text-[10px] text-stone-400">Therapist, Mumbai</p>
                </div>
              </div>
            </div>

            <div className="bg-[#fafaf9] border border-stone-200/80 p-6 rounded-xl space-y-5 flex flex-col justify-between">
              <p className="font-serif text-base text-ink italic leading-relaxed font-light">
                "We work in solo spaces and need quick compliance. Having immediate access to HIPAA-grade secure storage and signed audit logs is incredibly reassuring."
              </p>
              <div className="flex items-center gap-3.5 pt-4 border-t border-stone-200/50">
                <div className="w-9 h-9 rounded-full bg-sage-light text-sage font-bold text-xs flex items-center justify-center border border-sage/10">PM</div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Priya Menon</h4>
                  <p className="text-[10px] text-stone-400">Counsellor, Bangalore</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-ink text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,106,79,0.15),transparent_75%)] pointer-events-none"></div>
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight">Ready to reclaim your clinical hours?</h2>
          <p className="text-stone-400 text-xs md:text-sm font-light">14-day free trial. Setup takes 5 minutes. No credit card details required.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a 
              href="/app" 
              className="w-full sm:w-auto px-7 py-3 bg-white hover:bg-sage-light text-ink hover:text-sage text-xs font-bold rounded-lg shadow transition duration-200"
            >
              Start Free Trial
            </a>
            <a 
              href="/contact" 
              className="text-stone-400 hover:text-white text-xs font-medium transition py-2"
            >
              or request a personalized demo first
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-100 py-12 px-6 md:px-12 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-serif text-xl font-normal text-ink">TherapyDesk</h3>
          <p className="text-[11px] text-stone-400">© 2026 TherapyDesk. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6 text-xs text-stone-500 font-semibold">
          <a href="/" className="hover:text-ink transition">Home</a>
          <a href="/app" className="hover:text-ink transition">App</a>
          <a href="/contact" className="hover:text-ink transition">Contact</a>
          <a href="/admin" className="hover:text-ink transition">Admin</a>
        </div>
      </footer>

    </div>
  );
}
