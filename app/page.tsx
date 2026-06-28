// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  ChevronRight, 
  ArrowRight, 
  Check, 
  TrendingUp, 
  UserCheck2,
  Lock,
  Unlock,
  Menu,
  X,
} from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Page() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

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

    return () => {
      window.removeEventListener("scroll", handleScroll);
      obs.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-mist text-ink font-sans selection:bg-sage/20 selection:text-sage overflow-x-hidden">
      
      {/* HEADER NAVIGATION */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "py-3 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-stone-mid/30 shadow-sm" 
          : "py-5 px-6 md:px-12 bg-transparent"
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="font-serif text-2.5xl font-normal text-ink tracking-tight hover:opacity-85 transition flex items-center gap-2">
            <svg style={{ width: 22, height: 22 }} viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10V2z" fill="#2D6A4F" />
              <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10V2z" fill="#3D8B63" opacity="0.85" />
            </svg>
            <span className="font-bold">TherapyDesk</span>
            <sup className="text-[9px] font-normal text-stone-mid/90 select-none">TM</sup>
          </a>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-stone">
            <a href="/" className="text-ink hover:text-sage transition">Home</a>
            <a href="/app" className="hover:text-ink transition">App Workspace</a>
            <a href="/contact" className="hover:text-ink transition">Contact Support</a>
            <a href="/admin" className="hover:text-ink transition flex items-center gap-1 uppercase tracking-wider text-[10px]">
              <span>Admin Panel</span>
              <ChevronRight className="w-3 h-3" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" className="hidden sm:inline-flex text-xs font-semibold text-stone hover:text-ink transition cursor-pointer">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-ink hover:bg-sage text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition duration-200 cursor-pointer px-4.5 py-2">
                  Buy Now →
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <a 
                href="/app" 
                className="hidden sm:inline-flex text-xs font-semibold text-stone hover:text-ink transition mr-2"
              >
                Go to Workspace
              </a>
              <UserButton />
            </Show>
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 -mr-2 rounded-lg hover:bg-stone-light/80 active:bg-stone-light transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 block h-[1.5px] w-5 bg-ink rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileMenuOpen ? "top-[7px] rotate-45" : "top-[3px]"}`} />
                <span className={`absolute left-0 block h-[1.5px] w-5 bg-ink rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileMenuOpen ? "top-[7px] -rotate-45" : "top-[11px]"}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 w-72 h-full bg-white shadow-2xl border-l border-stone-mid/30 p-6 pt-24 space-y-1 animate-fadeUp">
            <a href="/" className="block py-2.5 px-3 text-sm font-semibold text-ink hover:bg-stone-light rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="/app" className="block py-2.5 px-3 text-sm font-semibold text-stone hover:bg-stone-light hover:text-ink rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>App Workspace</a>
            <a href="/contact" className="block py-2.5 px-3 text-sm font-semibold text-stone hover:bg-stone-light hover:text-ink rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>Contact Support</a>
            <a href="/admin" className="block py-2.5 px-3 text-sm font-semibold text-stone hover:bg-stone-light hover:text-ink rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>Admin Panel</a>
            <div className="border-t border-stone-mid/30 my-4" />
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" className="w-full justify-start text-sm font-semibold text-stone hover:text-ink cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <a href="/app" className="block py-2.5 px-3 text-sm font-semibold text-sage hover:bg-sage-light rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                Go to Workspace →
              </a>
            </Show>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,106,79,0.06),transparent_60%)] pointer-events-none"></div>
        
        {/* Hero Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sage-light text-sage border border-sage-mid/30 rounded-full text-[10px] font-bold uppercase tracking-wider mb-8 animate-fadeUp">
          <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse"></span>
          <span>Built exclusively for solo practitioners</span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7.5xl font-normal text-ink tracking-tight max-w-4xl leading-[1.05] mb-6 animate-fadeUp">
          Stop drowning in <br className="hidden sm:inline" />
          <span className="italic text-sage font-light">clinical admin. See more patients.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-stone text-sm md:text-base max-w-xl leading-relaxed mb-10 font-light animate-fadeUp">
          TherapyDesk automates SOAP clinical notes, smart scheduling calendar events, and client file organization — so you can dedicate your energy to healing.
        </p>

        {/* Hero CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 mb-16 animate-fadeUp">
          <a href="/app" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-ink hover:bg-sage text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition duration-200 px-8 py-4">
              Buy Now →
            </Button>
          </a>
          <a href="/contact" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-stone-mid hover:border-ink hover:text-ink text-stone text-xs font-semibold rounded-xl transition duration-200 px-8 py-4">
              Talk to our team
            </Button>
          </a>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 animate-fadeUp">
          <div className="flex -space-x-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-sage text-white font-semibold text-[10px] flex items-center justify-center shadow-sm">AM</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#6B8F8F] text-white font-semibold text-[10px] flex items-center justify-center shadow-sm">RK</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#9F7F8F] text-white font-semibold text-[10px] flex items-center justify-center shadow-sm">SP</div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-ink text-white font-semibold text-[10px] flex items-center justify-center shadow-sm">VN</div>
          </div>
          <span className="text-xs text-stone font-light">
            Trusted by <b className="text-ink font-semibold">47+ independent therapists</b> across India
          </span>
        </div>

        {/* CSS Mockup Dashboard Preview */}
        <div className="mt-20 w-full max-w-5xl rounded-2xl border border-stone-mid/40 bg-white/70 backdrop-blur shadow-2xl p-3 md:p-4 overflow-hidden relative group animate-fadeUp">
          <div className="absolute inset-0 bg-gradient-to-t from-mist via-transparent to-transparent pointer-events-none z-10 opacity-40"></div>
          <div className="h-6 flex items-center gap-1.5 px-2 mb-3 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] text-stone-mid ml-2 font-semibold select-none">TherapyDesk Dashboard Workspace Preview</span>
          </div>
          
          <div className="bg-mist/80 rounded-xl border border-stone-mid/20 overflow-hidden flex flex-col md:flex-row h-[380px] md:h-[480px]">
            {/* Sidebar Mockup */}
            <div className="w-full md:w-[180px] border-b md:border-b-0 md:border-r border-stone-mid/20 p-3 flex flex-col justify-between bg-white/50 shrink-0 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <span className="w-5 h-5 rounded-full bg-sage flex items-center justify-center text-[9px] text-white font-bold">T</span>
                  <span className="text-xs font-bold text-ink">TherapyDesk</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 p-1.5 bg-stone-light text-ink rounded-lg text-[11px] font-semibold"><TrendingUp className="w-3.5 h-3.5 text-sage" />Overview</div>
                  <div className="flex items-center gap-2 p-1.5 text-stone rounded-lg text-[11px] font-medium"><Sparkles className="w-3.5 h-3.5" />SOAP Notes</div>
                  <div className="flex items-center gap-2 p-1.5 text-stone rounded-lg text-[11px] font-medium"><Calendar className="w-3.5 h-3.5" />Calendar</div>
                  <div className="flex items-center gap-2 p-1.5 text-stone rounded-lg text-[11px] font-medium"><UserCheck2 className="w-3.5 h-3.5" />Patients</div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 p-1 border-t border-stone-mid/10 pt-2.5">
                <span className="w-6 h-6 rounded-full bg-sage-light text-sage flex items-center justify-center text-[9.5px] font-bold">DR</span>
                <span className="text-[10.5px] font-semibold text-ink truncate">Dr. Sunita Rao</span>
              </div>
            </div>
            {/* Content Mockup */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-stone-mid/20">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-stone font-bold uppercase tracking-wider">Welcome Back</span>
                  <h3 className="text-sm font-semibold text-ink">Clinical Practice Summary</h3>
                </div>
                <span className="px-2 py-0.5 bg-sage-light text-sage border border-sage-mid/30 rounded text-[9.5px] font-bold">HIPAA SECURE</span>
              </div>
              
              {/* KPIs mockup */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-stone-mid/20 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-stone uppercase">Today</span>
                  <span className="text-base font-bold text-ink mt-0.5">4 Sessions</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-mid/20 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-stone uppercase">Patients</span>
                  <span className="text-base font-bold text-ink mt-0.5">47 Active</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-mid/20 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-stone uppercase">Sealed Notes</span>
                  <span className="text-base font-bold text-ink mt-0.5">120 Total</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-mid/20 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-stone uppercase">This Week</span>
                  <span className="text-base font-bold text-ink mt-0.5">24.5 Hrs</span>
                </div>
              </div>

              {/* SOAP mockups */}
              <div className="bg-white p-4 rounded-xl border border-stone-mid/20 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-750 flex items-center justify-center text-[9px] font-bold">AM</span>
                    <span className="text-xs font-bold text-ink">Aanya Mehta (SOAP Note Draft)</span>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Unlock className="w-2.5 h-2.5" />Draft</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] text-ink font-semibold"><span className="text-sage font-bold">[S] Subjective:</span> Patient reports increased work pressure and restless sleep...</div>
                  <div className="text-[10px] text-ink font-semibold"><span className="text-sage font-bold">[O] Objective:</span> Patient presented mild anxiety ticks, fast voice tempo, direct eye contact...</div>
                  <div className="text-[10px] text-ink font-semibold"><span className="text-sage font-bold">[A] Assessment:</span> Generalized anxiety features triggered by vocational workload. Coping skills active...</div>
                  <div className="text-[10px] text-ink font-semibold"><span className="text-sage font-bold">[P] Plan:</span> Introduce sleep hygiene guidelines. Follow up CBT check-in next Friday...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRIP FEATURE CAROUSEL */}
      <div className="bg-ink text-stone-mid/80 py-5 overflow-hidden border-y border-stone-mid/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-xs font-medium tracking-wide">
          <div className="flex items-center gap-2.5"><Sparkles className="w-4 h-4 text-sage" /><span>AI SOAP Notes in seconds</span></div>
          <div className="flex items-center gap-2.5"><ShieldCheck className="w-4 h-4 text-sage" /><span>HIPAA-compliant storage</span></div>
          <div className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-sage" /><span>Smart Patient Scheduling</span></div>
          <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-sage" /><span>Auto reminders & notifications</span></div>
        </div>
      </div>

      {/* PROBLEM SECTION */}
      <section className="py-24 px-6 md:px-12 bg-white border-b border-stone-mid/20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div className="reveal-item transition-all duration-700 opacity-0 translate-y-4 space-y-5">
            <span className="text-[10px] font-bold text-sage uppercase tracking-widest bg-sage-light px-2.5 py-1 rounded">The Burden</span>
            <h2 className="font-serif text-3xl md:text-5xl font-normal leading-[1.1] text-ink">
              You became a therapist to heal minds. Not to file paperwork.
            </h2>
            <p className="text-stone text-xs md:text-sm font-light leading-relaxed">
              Solo practitioners lose an average of 2–3 hours every day to notes, booking calendars, and invoice management. That's time stolen from client therapy sessions — and your personal weekends.
            </p>
            <a href="/app" className="inline-block mt-2">
              <Button className="bg-sage hover:bg-sage/95 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition duration-200 px-5 py-3">
                See how TherapyDesk helps →
              </Button>
            </a>
          </div>

          <div className="reveal-item transition-all duration-700 opacity-0 translate-y-4 space-y-4">
            <Card className="border-stone-mid/30 bg-mist/30 hover:shadow-md hover:border-sage-mid transition duration-350">
              <CardContent className="p-5 flex gap-4">
                <div className="font-serif text-2xl font-bold text-stone-mid select-none pt-0.5">01</div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-ink">Manual SOAP Session Notes</h4>
                  <p className="text-stone text-[11px] font-light leading-relaxed">Writing SOAP notes by hand eats up hours. We generate structured clinical records inside 2 minutes.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-mid/30 bg-mist/30 hover:shadow-md hover:border-sage-mid transition duration-350">
              <CardContent className="p-5 flex gap-4">
                <div className="font-serif text-2xl font-bold text-stone-mid select-none pt-0.5">02</div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-ink">No-shows and Cancellations</h4>
                  <p className="text-stone text-[11px] font-light leading-relaxed">Missed sessions represent lost practice income. Automatic reminders cut cancellations by up to 70%.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-mid/30 bg-mist/30 hover:shadow-md hover:border-sage-mid transition duration-350">
              <CardContent className="p-5 flex gap-4">
                <div className="font-serif text-2xl font-bold text-stone-mid select-none pt-0.5">03</div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-ink">Invoicing and Client Records</h4>
                  <p className="text-stone text-[11px] font-light leading-relaxed">Manually chasing fees, generating receipts, and tracking patient histories drains clarity daily.</p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>

      {/* CORE FEATURES DIRECTORY */}
      <section className="bg-mist/30 py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-xl mx-auto space-y-4 reveal-item transition-all duration-700 opacity-0 translate-y-4">
            <span className="text-[10px] font-bold text-sage uppercase tracking-widest bg-sage-light px-2.5 py-1 rounded">Capabilities</span>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-ink tracking-tight">Everything your solo practice requires.</h2>
            <p className="text-stone text-xs font-light leading-relaxed">
              Designed specifically for independent solo mental health professionals — not complex hospital system databases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card className="border-stone-mid/30 bg-white hover:border-sage-mid hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="p-6 pb-2">
                <div className="w-10 h-10 rounded-xl bg-sage-light text-sage flex items-center justify-center shadow-inner mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <CardTitle className="text-sm font-bold text-ink">AI SOAP Note Generator</CardTitle>
                <CardDescription className="text-stone text-[11.5px] leading-relaxed font-light mt-1">
                  Write or paste raw, shorthand clinical impressions. Our smart engine structures precise, readable SOAP logs inside 2 minutes for you to lock.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-stone-mid/30 bg-white hover:border-sage-mid hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="p-6 pb-2">
                <div className="w-10 h-10 rounded-xl bg-sage-light text-sage flex items-center justify-center shadow-inner mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <CardTitle className="text-sm font-bold text-ink">Smart Practice Scheduling</CardTitle>
                <CardDescription className="text-stone text-[11.5px] leading-relaxed font-light mt-1">
                  A clean, functional clinic calendar showing active appointments. Manage details, book dates, and structure your scheduling days seamlessly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-stone-mid/30 bg-white hover:border-sage-mid hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="p-6 pb-2">
                <div className="w-10 h-10 rounded-xl bg-sage-light text-sage flex items-center justify-center shadow-inner mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-sm font-bold text-ink">HIPAA-Compliant Storage</CardTitle>
                <CardDescription className="text-stone text-[11.5px] leading-relaxed font-light mt-1">
                  All clinic and SOAP records encrypted at rest. Immutable audit logs trace every update. Your data stays legally protected and secure.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-stone-mid/30 bg-white hover:border-sage-mid hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="p-6 pb-2">
                <div className="w-10 h-10 rounded-xl bg-sage-light text-sage flex items-center justify-center shadow-inner mb-4">
                  <Lock className="w-5 h-5" />
                </div>
                <CardTitle className="text-sm font-bold text-ink">Legal Signature Locking</CardTitle>
                <CardDescription className="text-stone text-[11.5px] leading-relaxed font-light mt-1">
                  Digitally sign and seal clinical session files once finished. Prevent database modification to comply with audit guidelines.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-stone-mid/30 bg-white hover:border-sage-mid hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="p-6 pb-2">
                <div className="w-10 h-10 rounded-xl bg-sage-light text-sage flex items-center justify-center shadow-inner mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <CardTitle className="text-sm font-bold text-ink">Income & Metric Audits</CardTitle>
                <CardDescription className="text-stone text-[11.5px] leading-relaxed font-light mt-1">
                  Trace weekly session volume, monthly notes count, and client attendance analytics right on your main dashboard screen.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-stone-mid/30 bg-white hover:border-sage-mid hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <CardHeader className="p-6 pb-2">
                <div className="w-10 h-10 rounded-xl bg-sage-light text-sage flex items-center justify-center shadow-inner mb-4">
                  <UserCheck2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-sm font-bold text-ink">Clinical Patient Files</CardTitle>
                <CardDescription className="text-stone text-[11.5px] leading-relaxed font-light mt-1">
                  Separate profiles tracking age, gender, diagnostic notes, referral sources, and historical SOAP session notes timeline feeds.
                </CardDescription>
              </CardHeader>
            </Card>

          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="bg-white py-24 px-6 md:px-12 border-y border-stone-mid/20">
        <div className="max-w-5xl mx-auto space-y-16">
          
          <div className="text-center max-w-md mx-auto space-y-3 reveal-item transition-all duration-700 opacity-0 translate-y-4">
            <span className="text-[10px] font-bold text-sage uppercase tracking-widest bg-sage-light px-2.5 py-1 rounded">Pricing</span>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-ink tracking-tight">One flat rate. All features.</h2>
            <p className="text-stone text-xs font-light">No tiers, no hidden setup fees, no limits. Simple clinical software.</p>
          </div>

          <div className="flex justify-center reveal-item transition-all duration-700 opacity-0 translate-y-4">
            <Card className="w-full max-w-[440px] border-2 border-sage rounded-2xl p-8 relative shadow-xl bg-white hover:scale-[1.01] transition duration-300">
              <div className="absolute top-0 left-1/2 -translate-y-1/2 -translate-x-1/2 px-4 py-1.5 bg-sage text-white text-[10px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">
                Complete Professional Access
              </div>
              
              <div className="text-center pb-6 border-b border-stone-light space-y-3">
                <span className="text-xs font-bold text-stone uppercase tracking-widest">TherapyDesk Pro</span>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="font-serif text-6xl font-normal text-ink">$200</span>
                  <span className="text-stone text-sm font-light">/ month</span>
                </div>
                <p className="text-[10px] text-stone font-semibold">Cancel or pause subscription anytime</p>
              </div>

              <ul className="py-6 space-y-3.5 text-xs text-stone font-medium">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-sage flex-shrink-0" />
                  <span>AI SOAP clinical notes generator</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-sage flex-shrink-0" />
                  <span>Interactive schedule practice calendar</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-sage flex-shrink-0" />
                  <span>Unlimited client directories & timelines</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-sage flex-shrink-0" />
                  <span>Legal signature locking audits</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-sage flex-shrink-0" />
                  <span>HIPAA-compliant server storage</span>
                </li>
              </ul>

              <div className="space-y-4">
                <a href="/app" className="block w-full">
                  <Button className="w-full py-6 bg-sage hover:bg-sage/95 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer">
                    Buy Now
                  </Button>
                </a>
                <p className="text-[10.5px] text-stone text-center font-light">Cancel or pause subscription anytime.</p>
              </div>
            </Card>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-mist/30 py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-sm mx-auto space-y-3 reveal-item transition-all duration-700 opacity-0 translate-y-4">
            <span className="text-[10px] font-bold text-sage uppercase tracking-widest bg-sage-light px-2.5 py-1 rounded">Testimonials</span>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-ink tracking-tight">Real therapists, real hours saved.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card className="border-stone-mid/20 bg-white p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition">
              <CardContent className="p-0 space-y-5">
                <p className="font-serif text-lg text-ink italic leading-relaxed font-light">
                  "I used to lose my entire Sunday afternoon typing session records. Now I seal everything by Friday evening. TherapyDesk returned my weekends."
                </p>
                <div className="flex items-center gap-3.5 pt-4 border-t border-stone-light">
                  <div className="w-9 h-9 rounded-full bg-sage-light text-sage font-bold text-xs flex items-center justify-center border border-sage/10">SR</div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Dr. Sunita Rao</h4>
                    <p className="text-[10px] text-stone">Clinical Psychologist, Pune</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-mid/20 bg-white p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition">
              <CardContent className="p-0 space-y-5">
                <p className="font-serif text-lg text-ink italic leading-relaxed font-light">
                  "The structured notes formatting is outstanding. Reviewing and signing drafts takes me 3 minutes instead of writing logs from scratch for 40 minutes."
                </p>
                <div className="flex items-center gap-3.5 pt-4 border-t border-stone-light">
                  <div className="w-9 h-9 rounded-full bg-sage-light text-sage font-bold text-xs flex items-center justify-center border border-sage/10">AK</div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Arjun Kulkarni</h4>
                    <p className="text-[10px] text-stone">Therapist, Mumbai</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-mid/20 bg-white p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition">
              <CardContent className="p-0 space-y-5">
                <p className="font-serif text-lg text-ink italic leading-relaxed font-light">
                  "We work in solo spaces and need quick compliance. Having immediate access to HIPAA-grade secure storage and signed audit logs is incredibly reassuring."
                </p>
                <div className="flex items-center gap-3.5 pt-4 border-t border-stone-light">
                  <div className="w-9 h-9 rounded-full bg-sage-light text-sage font-bold text-xs flex items-center justify-center border border-sage/10">PM</div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Priya Menon</h4>
                    <p className="text-[10px] text-stone">Counsellor, Bangalore</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-ink text-white py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,106,79,0.18),transparent_75%)] pointer-events-none"></div>
        <div className="max-w-xl mx-auto space-y-8 relative z-10">
          <h2 className="font-serif text-4xl md:text-6xl font-normal tracking-tight leading-tight">Ready to reclaim your clinical hours?</h2>
          <p className="text-stone-mid/80 text-xs md:text-sm font-light leading-relaxed max-w-md mx-auto">Purchase once, use forever. Setup takes 5 minutes.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
            <a href="/app" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 bg-white hover:bg-sage-light text-ink hover:text-sage text-xs font-bold rounded-xl shadow transition duration-200">
                Buy Now
              </Button>
            </a>
            <a href="/contact" className="w-full sm:w-auto">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto text-stone-mid hover:text-white hover:bg-white/5 text-xs font-semibold rounded-xl transition duration-200">
                Request Demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-16 px-6 md:px-12 border-t border-stone-mid/20 flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="font-serif text-2xl font-bold text-ink">TherapyDesk</h3>
          <p className="text-[11px] text-stone">© 2026 TherapyDesk. All rights reserved. Built for healers.</p>
        </div>
        <div className="flex items-center gap-8 text-xs text-stone font-semibold">
          <a href="/" className="hover:text-ink transition">Home</a>
          <a href="/app" className="hover:text-ink transition">App Workspace</a>
          <a href="/contact" className="hover:text-ink transition">Contact</a>
          <a href="/admin" className="hover:text-ink transition">Admin</a>
        </div>
      </footer>

    </div>
  );
}
