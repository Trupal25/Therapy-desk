// @ts-nocheck
"use client";
import "./page.css";

export default function Page() {
  return (
    <>
      <nav>
        <a href="/" className="nav-logo">TherapyDesk</a>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/app" className="nav-link">App</a>
          <a href="/contact" className="nav-link active">Contact</a>
          <a href="/admin" className="nav-link" style={{fontSize: "12px", color: "var(--stone)"}}>Admin ↗</a>
        </div>
        <a href="/app" className="nav-cta">Buy Now →</a>
      </nav>
      
      <div className="page-header">
        <div className="page-eyebrow">Get in touch</div>
        <h1 className="page-h1">We'd love to hear from you</h1>
        <p className="page-sub">Whether you have a question, want a demo, or just want to say hi — we reply to every message personally.</p>
      </div>
      
      <div className="contact-body">
        <div className="contact-info">
          <div className="info-label">Contact</div>
          <h2 className="info-h2">Real humans, real replies</h2>
          <p className="info-desc">We're a small team building something we genuinely care about. You'll always get a response from a person, not a bot.</p>
      
          <div className="contact-ways">
            <div className="contact-way">
              <div className="way-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#2D6A4F" strokeWidth="1.5"><path d="M3 5h14l-7 7-7-7z"/><rect x="2" y="4" width="16" height="13" rx="2"/></svg>
              </div>
              <div>
                <div className="way-title">Email us</div>
                <div className="way-val">hello@therapydesk.in</div>
              </div>
            </div>
            <div className="contact-way">
              <div className="way-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#2D6A4F" strokeWidth="1.5"><path d="M4 4h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M2 8h16"/></svg>
              </div>
              <div>
                <div className="way-title">WhatsApp</div>
                <div className="way-val">+91 98765 43210</div>
              </div>
            </div>
            <div className="contact-way">
              <div className="way-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#2D6A4F" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 3"/></svg>
              </div>
              <div>
                <div className="way-title">Response time</div>
                <div className="way-val">Usually within 4 hours</div>
              </div>
            </div>
          </div>
      
          <div className="response-badge">
            <div className="online-dot"></div>
            We're online now · Mon–Sat 9am–7pm IST
          </div>
        </div>
      
        <div className="contact-form-wrap">
          <div id="form-inner">
          <div className="form-title">Send us a message</div>
            <div className="form-sub">Fill in the form and we'll get back to you within a few hours.</div>
      
            <div className="form-group">
              <label className="form-label">What's this about?</label>
              <div className="reason-grid">
                <button className="reason-btn selected">Book a demo</button>
                <button className="reason-btn">Trial question</button>
                <button className="reason-btn">Pricing</button>
                <button className="reason-btn">Something else</button>
              </div>
            </div>
      
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First name</label>
                <input className="form-input" type="text" placeholder="Riya"/>
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input className="form-input" type="text" placeholder="Shah"/>
              </div>
            </div>
      
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="riya@example.com"/>
            </div>
      
            <div className="form-group">
              <label className="form-label">Practice type</label>
              <select className="form-select">
                <option defaultValue="">Select one...</option>
                <option>Solo practice</option>
                <option>Small group (2–4 therapists)</option>
                <option>Larger group (5+ therapists)</option>
                <option>I'm still in training</option>
              </select>
            </div>
      
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-textarea" placeholder="Tell us a bit about your practice and what you're looking for..."></textarea>
            </div>
      
            <button className="submit-btn">
              Send message
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </button>
          </div>
      
          <div className="success-state" id="success-state">
            <div className="success-icon">✓</div>
            <div className="success-h">Message sent!</div>
            <div className="success-sub">Thanks for reaching out. We'll get back to you within a few hours.<br /><br />In the meantime, feel free to <a href="/app" style={{color: "var(--sage)"}}>explore the app</a>.</div>
          </div>
        </div>
      </div>
      
      <footer>
        <div>
          <div className="footer-logo">TherapyDesk</div>
          <div className="footer-copy">© 2026 TherapyDesk. All rights reserved.</div>
        </div>
        <div className="footer-links">
          <a href="/" className="footer-link">Home</a>
          <a href="/app" className="footer-link">App</a>
          <a href="/contact" className="footer-link">Contact</a>
          <a href="/admin" className="footer-link">Admin</a>
        </div>
      </footer>
    </>
  );
}
