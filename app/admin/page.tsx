// @ts-nocheck
"use client";
import "./page.css";

export default function Page() {
  return (
    <>
      {/* LOGIN */}
      <div id="login-screen">
        <div className="lbox">
          <div className="llogo">TherapyDesk <span style={{fontSize: "13px", color: "var(--stone)", fontFamily: "'DM Sans',sans-serif"}}>Admin</span></div>
          <div className="lsub">Restricted access · Owner only</div>
          <label className="llbl">Password</label>
          <input className="linp" type="password" id="pw" placeholder="••••••••"/>
          <button className="lbtn">Enter admin panel</button>
          <div className="lerr" id="lerr"></div>
          <div className="lhint">Default password: <b>admin123</b> — change in .env when deploying</div>
        </div>
      </div>
      
      {/* APP */}
      <div id="app">
        <aside className="sidebar">
          <div className="logo-wrap">
            <div className="logo-name"><a href="/" style={{color: "inherit", textDecoration: "none"}}>TherapyDesk</a> <span className="logo-badge">ADMIN</span></div>
            <div className="logo-sub">Owner dashboard</div>
          </div>
          <nav className="nav">
            <button className="ni on">
              <svg className="nic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
              Overview
            </button>
            <button className="ni">
              <svg className="nic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="5" r="3"/><path d="M1 14c0-3 2.2-5 5-5s5 2 5 5"/><path d="M11 7a2 2 0 1 0 0-4M15 14c0-2-1-3.5-3-4"/></svg>
              Therapists
            </button>
            <button className="ni">
              <svg className="nic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12L5 8l3 2 3-5 3 2"/><rect x="1" y="1" width="14" height="14" rx="2"/></svg>
              Revenue
            </button>
            <button className="ni">
              <svg className="nic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="10" rx="2"/><path d="M5 8h6M8 6v4"/></svg>
              Plans
            </button>
            <button className="ni">
              <svg className="nic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h12v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3z"/><path d="M2 3l6 5 6-5"/></svg>
              Inbox
            </button>
            <button className="ni">
              <svg className="nic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="8" cy="4" rx="6" ry="2"/><path d="M2 4v4c0 1.1 2.7 2 6 2s6-.9 6-2V4"/><path d="M2 8v4c0 1.1 2.7 2 6 2s6-.9 6-2V8"/></svg>
              Database
            </button>
          </nav>
          <div className="sfoot">
            <div style={{fontSize: "13px", fontWeight: "500", color: "var(--ink)"}}>Owner</div>
            <button className="sfoot-lnk">Sign out</button>
          </div>
        </aside>
      
        <main className="main">
      
          {/* OVERVIEW */}
          <div id="voverview" className="view on">
            <div className="topbar">
              <div className="page-title">Overview</div>
              <div className="topbar-meta" id="ov-meta">—</div>
            </div>
            <div className="content">
              <div className="kpi-grid">
                <div className="kpi"><div className="kpi-lbl">Monthly recurring revenue</div><div className="kpi-val" id="ov-mrr">$0</div><div className="kpi-sub neutral" id="ov-mrr-sub">from 0 paying users</div></div>
                <div className="kpi"><div className="kpi-lbl">Active therapists</div><div className="kpi-val" id="ov-active">0</div><div className="kpi-sub neutral" id="ov-active-sub">on paid plans</div></div>
                <div className="kpi"><div className="kpi-lbl">Total signups</div><div className="kpi-val" id="ov-total">0</div><div className="kpi-sub neutral" id="ov-total-sub">all time</div></div>
                <div className="kpi"><div className="kpi-lbl">ARR run rate</div><div className="kpi-val" id="ov-arr">$0</div><div className="kpi-sub neutral">MRR × 12</div></div>
              </div>
              <div className="two-col">
                <div className="card"><div className="card-head"><div className="card-head-title">MRR by plan</div></div><div className="chart-wrap"><canvas id="mrr-chart"></canvas></div></div>
                <div className="card"><div className="card-head"><div className="card-head-title">Signups over time</div></div><div className="chart-wrap"><canvas id="signup-chart"></canvas></div></div>
              </div>
              <div className="three-col">
                <div className="kpi"><div className="kpi-lbl">Trial accounts</div><div className="kpi-val" id="ov-trial" style={{fontSize: "22px"}}>0</div><div className="kpi-sub neutral">not yet paying</div></div>
                <div className="kpi"><div className="kpi-lbl">Total notes generated</div><div className="kpi-val" id="ov-notes" style={{fontSize: "22px"}}>0</div><div className="kpi-sub neutral">across all therapists</div></div>
                <div className="kpi"><div className="kpi-lbl">Total appointments</div><div className="kpi-val" id="ov-appts" style={{fontSize: "22px"}}>0</div><div className="kpi-sub neutral">booked by therapists</div></div>
              </div>
            </div>
          </div>
      
          {/* THERAPISTS */}
          <div id="vtherapists" className="view">
            <div className="topbar">
              <div className="page-title">Therapists</div>
              <div className="topbar-meta" id="th-meta">—</div>
            </div>
            <div className="content">
              <div className="search-bar">
                <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
                  <input className="si" type="text" placeholder="Search name or email…"/>
                  <select className="sel">
                    <option defaultValue="all">All users</option>
                    <option defaultValue="active">Active ($200/mo)</option>
                    <option defaultValue="trial">Trial (free)</option>
                  </select>
                </div>
                <button className="btn btn-p btn-sm">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 2v10M2 7h10"/></svg>
                  Add therapist
                </button>
              </div>
              <div className="card">
                <table>
                  <thead><tr>
                    <th>Therapist</th><th>Plan</th><th>Joined</th>
                    <th>Notes</th><th>Appointments</th><th>Last seen</th><th>MRR</th><th>Actions</th>
                  </tr></thead>
                  <tbody id="th-tbody"></tbody>
                </table>
              </div>
            </div>
          </div>
      
          {/* REVENUE */}
          <div id="vrevenue" className="view">
            <div className="topbar">
              <div className="page-title">Revenue</div>
              <div className="topbar-meta">All figures in USD · based on current subscriptions</div>
            </div>
            <div className="content">
              <div className="kpi-grid">
                <div className="kpi"><div className="kpi-lbl">MRR</div><div className="kpi-val" id="rev-mrr">$0</div><div className="kpi-sub neutral" id="rev-mrr-sub">0 paying users</div></div>
                <div className="kpi"><div className="kpi-lbl">ARR</div><div className="kpi-val" id="rev-arr">$0</div><div className="kpi-sub neutral">MRR × 12</div></div>
                <div className="kpi"><div className="kpi-lbl">Avg revenue / user</div><div className="kpi-val" id="rev-arpu" style={{fontSize: "22px"}}>$0</div><div className="kpi-sub neutral">per month</div></div>
                <div className="kpi"><div className="kpi-lbl">Potential MRR</div><div className="kpi-val" id="rev-potential" style={{fontSize: "22px"}}>$0</div><div className="kpi-sub neutral" id="rev-potential-sub">if all trials convert</div></div>
              </div>
              <div className="card" style={{marginBottom: "20px"}}>
                <div className="card-head"><div className="card-head-title">Revenue by plan</div></div>
                <div id="rev-byplan" className="pbar-wrap"></div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-head-title">All paying subscribers</div></div>
                <table><thead><tr><th>Therapist</th><th>Plan</th><th>MRR</th><th>Joined</th><th>Last seen</th></tr></thead>
                <tbody id="rev-tbody"></tbody></table>
              </div>
            </div>
          </div>
      
          {/* PLANS */}
          <div id="vplans" className="view">
            <div className="topbar">
              <div className="page-title">Subscribers</div>
              <div className="topbar-meta" id="pl-meta">—</div>
            </div>
            <div className="content">
              <div className="three-col" id="pl-kpis"></div>
              <div className="two-col">
                <div className="card">
                  <div className="card-head"><div className="card-head-title">Distribution</div></div>
                  <div className="pbar-wrap" id="pl-dist"></div>
                </div>
                <div className="card">
                  <div className="card-head"><div className="card-head-title">Plan breakdown</div></div>
                  <table><thead><tr><th>Plan</th><th>Users</th><th>MRR</th></tr></thead>
                  <tbody id="pl-tbody"></tbody></table>
                </div>
              </div>
            </div>
          </div>
      
          {/* CONTACT INBOX */}
          <div id="vcontacts" className="view">
            <div className="topbar">
              <div className="page-title">Inbox</div>
              <div className="topbar-meta" id="inbox-meta">Contact form submissions</div>
            </div>
            <div className="content">
              <div className="card" id="inbox-card">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Reason</th><th>Practice</th><th>Message</th><th>Date</th></tr></thead>
                  <tbody id="inbox-tbody"><tr><td colspan="6"><div className="empty">Loading...</div></td></tr></tbody>
                </table>
              </div>
            </div>
          </div>
      
          {/* DATABASE VIEWER (replaces pgAdmin for quick checks) */}
          <div id="vdatabase" className="view">
            <div className="topbar">
              <div className="page-title">Database</div>
              <div className="topbar-meta" id="db-meta">Live view of your PostgreSQL data</div>
            </div>
            <div className="content">
              <div className="alert alert-warn" id="db-offline-msg" style={{display: "none", background: "var(--amber-light)", border: "1px solid #F6D860", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "var(--amber)"}}>
                Backend not connected. Start your server to view live database data.
              </div>
      
              {/* Table selector */}
              <div style={{display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap"}}>
                <button className="db-tab on">Users</button>
                <button className="db-tab">Clients</button>
                <button className="db-tab">Appointments</button>
                <button className="db-tab">Session Notes</button>
                <button className="db-tab">Contact</button>
              </div>
      
              <div className="card" style={{overflowX: "auto"}}>
                <div id="db-table-wrap" style={{minWidth: "600px"}}>
                  <div className="empty" style={{padding: "40px"}}>Select a table above to view data.</div>
                </div>
              </div>
            </div>
          </div>
      
        </main>
      </div>
      
      {/* ADD / EDIT THERAPIST MODAL */}
      <div className="moverlay" id="th-modal">
        <div className="modal">
          <div className="modal-title" id="modal-title">Add therapist</div>
          <div className="modal-sub" id="modal-sub">Creates a login for the therapist so they can access the app immediately.</div>
      
          <div className="frow">
            <div className="fg"><label className="fl">Full name *</label><input className="fi" type="text" id="m-name" placeholder="Dr. Riya Shah"/></div>
            <div className="fg"><label className="fl">Email *</label><input className="fi" type="email" id="m-email" placeholder="riya@example.com"/></div>
          </div>
          <div className="frow">
            <div className="fg">
              <label className="fl">Password *</label>
              <div style={{position: "relative"}}>
                <input className="fi" type="password" id="m-pw" placeholder="Min 6 characters" style={{paddingRight: "46px"}}/>
                <button id="pw-vis" style={{position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "var(--stone)", fontFamily: "'DM Sans',sans-serif"}}>Show</button>
              </div>
            </div>
            <div className="fg"><label className="fl">Confirm password *</label><input className="fi" type="password" id="m-pw2" placeholder="Re-enter"/></div>
          </div>
          <div className="frow">
            <div className="fg"><label className="fl">Plan</label>
              <select className="fs" id="m-plan">
                <option defaultValue="trial">Trial (free)</option>
                <option defaultValue="active">Active — $200/mo</option>
              </select>
            </div>
            <div className="fg"><label className="fl">Specialisation</label>
              <select className="fs" id="m-spec">
                <option>General</option><option>CBT</option><option>Trauma</option>
                <option>Anxiety</option><option>Depression</option>
                <option>Child &amp; Adolescent</option><option>Couples</option>
              </select>
            </div>
          </div>
      
          {/* credentials preview (shown after save) */}
          <div className="cred-card" id="cred-card" style={{display: "none"}}>
            <div className="cred-lbl">Login credentials — share these with the therapist</div>
            <div className="cred-grid">
              <span className="cred-k">App URL</span><span className="cred-v" id="cc-url"></span>
              <span className="cred-k">Email</span><span className="cred-v" id="cc-email"></span>
              <span className="cred-k">Password</span><span className="cred-v" id="cc-pw"></span>
              <span className="cred-k">Plan</span><span className="cred-v" id="cc-plan"></span>
            </div>
            <button id="copy-btn" className="btn btn-p btn-sm">Copy credentials</button>
          </div>
      
          <div className="merr" id="merr"></div>
          <div className="macts">
            <button className="btn btn-g">Cancel</button>
            <button className="btn btn-p" id="m-save">Create account</button>
          </div>
        </div>
      </div>
      
      <div className="toast" id="toast"></div>
      
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
    </>
  );
}
