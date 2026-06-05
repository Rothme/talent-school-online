/* eslint-disable */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="lp">

      <nav className="lp-nav">
        <div className="lp-logo"><span className="lp-dot" />Talent School Online</div>
        <div className="lp-nav-links">
          <span className="lp-nav-link" onClick={() => navigate('/subject/chess')}>Chess</span>
          <span className="lp-nav-link" onClick={() => navigate('/subject/coding')}>Coding</span>
          <span className="lp-nav-link" onClick={() => navigate('/subject/typing')}>Typing</span>
          <span className="lp-nav-link" onClick={() => navigate('/login')}>Parent login</span>
          <button className="lp-nav-cta" onClick={() => navigate('/register')}>Enrol free today</button>
        </div>
      </nav>

      <section className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="lp-hero-overlay" />
        <div className="lp-hero-content">
          <div className="lp-eyebrow">Built for African children &mdash; Designed for a global future</div>
          <h1 className="lp-h1">
            A child exposed to coding will <span className="lp-blue">build.</span><br />
            <span style={{whiteSpace:'nowrap'}}>A child exposed to a computer will <span className="lp-green">explore.</span></span><br />
            A child exposed to chess will <span className="lp-red">think.</span>
          </h1>
          <div className="lp-age-badge">
            Structured for children aged <strong>6&ndash;13 years old</strong>
          </div>
          <div className="lp-btns">
            <button className="lp-btn-p" onClick={() => navigate('/register')}>Start free &mdash; first week on us</button>
            <button className="lp-btn-s" onClick={() => navigate('/subject/chess')}>See how it works</button>
          </div>
          <div className="lp-trust">
            <span className="lp-trust-item"><span className="lp-check">&#10003;</span> Chess</span>
            <span className="lp-trust-item"><span className="lp-check">&#10003;</span> Coding</span>
            <span className="lp-trust-item"><span className="lp-check">&#10003;</span> Typing</span>
            <span className="lp-trust-item"><span className="lp-check">&#10003;</span> No interference with school</span>
            <span className="lp-trust-item"><span className="lp-check">&#10003;</span> &#8358;3,500/month</span>
          </div>
        </div>
      </section>

      <section className="lp-browse">
        <p className="lp-eyebrow-sm">What your child learns</p>
        <h2 className="lp-section-title">Three skills. Three dedicated tutors.</h2>
        <p className="lp-section-sub">Every skill your child builds today is an advantage they carry for life. Each subject has its own dedicated tutor and its own day on the timetable. Every child progresses at their own pace.</p>
        <div className="lp-skills-row">
          {[
            { id:'chess',  emoji:'♟️', name:'Chess',  tutor:'Ms. Momo',   color:'#1d9e75', pale:'#e1f5ee', desc:'Strategic thinking, patience and pattern recognition that transfers to every area of life' },
            { id:'coding', emoji:'💻', name:'Coding', tutor:'Mr. Patrick', color:'#6c63ff', pale:'#eeedfe', desc:'Build real games, tools and websites from scratch using Python, HTML and JavaScript' },
            { id:'typing', emoji:'⌨️', name:'Typing', tutor:'Ms. Lola',   color:'#ba7517', pale:'#faeeda', desc:'Speed and accuracy for a world that runs on keyboards — target 65 WPM with a certificate' },
          ].map(s => (
            <div key={s.id} className="lp-skill-card" style={{'--sc':s.color,'--sp':s.pale}}>
              <div className="lp-skill-icon">{s.emoji}</div>
              <div className="lp-skill-name">{s.name}</div>
              <div className="lp-skill-tutor" style={{color:s.color}}>Taught by {s.tutor}</div>
              <div className="lp-skill-desc">{s.desc}</div>
              <button className="lp-skill-explore" style={{color:s.color}}
                onClick={() => navigate('/subject/' + s.id)}>
                Explore {s.name} &#8594;
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-benefits">
        <p className="lp-eyebrow-sm">Benefits of enrolment include</p>
        <h2 className="lp-section-title">Everything a parent needs.<br />Everything a child deserves.</h2>
        <p className="lp-section-sub" style={{marginBottom:52}}>Designed specifically for Nigerian children aged 6&ndash;13 &mdash; with Nigerian stories, Nigerian names, and tutors who speak in voices that feel familiar.</p>
        <div className="lp-benefits-grid">
          {[
            { icon:'person', bg:'#eeedfe', stroke:'#6c63ff', title:'Dedicated Tutor for Every Subject', desc:'A warm, encouraging tutor present in every single lesson with voice instructions and live feedback.' },
            { icon:'calendar', bg:'#e1f5ee', stroke:'#1d9e75', title:'Structured Timetable', desc:'Chess on Monday and Wednesday. Coding on Tuesday and Thursday. Typing on Friday. Saturday challenge. Just like school.' },
            { icon:'lock', bg:'#faeeda', stroke:'#ba7517', title:'Academics Always First', desc:'1 hour per weekday, 2 hours on Saturday. The platform locks automatically when time is up. No battles at home.' },
            { icon:'message', bg:'#e1f5ee', stroke:'#1d9e75', title:'Weekly WhatsApp Reports', desc:'Every Sunday a detailed progress report arrives on WhatsApp — lessons completed, personal bests, and next steps.' },
            { icon:'share', bg:'#eeedfe', stroke:'#6c63ff', title:'Shareable Projects', desc:'Every major project earns a live shareable link. A game your child built. A typing record. Share to family WhatsApp in one tap.' },
            { icon:'world', bg:'#fcebeb', stroke:'#e24b4a', title:'Globally Competitive', desc:'The same skills children in China, the UK and India are building right now. Your child starts today and will not be left behind.' },
          ].map((b,i) => (
            <div key={i} className="lp-benefit">
              <div className="lp-benefit-icon" style={{background:b.bg}}>
                {b.icon === 'person' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={b.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                {b.icon === 'calendar' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={b.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>}
                {b.icon === 'lock' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={b.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>}
                {b.icon === 'message' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={b.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                {b.icon === 'share' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={b.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>}
                {b.icon === 'world' && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={b.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
              </div>
              <div className="lp-benefit-title">{b.title}</div>
              <div className="lp-benefit-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-age-section">
        <h2 className="lp-age-title">Designed for every child<br /><span className="lp-age-highlight">aged 6 to 13 years old.</span></h2>
        <p className="lp-age-sub">The curriculum is carefully curated for every child between 6 and 13 years old. Every child starts from the beginning and advances at their own pace. A determined 6-year-old can outpace a distracted 13-year-old &mdash; progress belongs to effort, not age. If your child misses a day, they simply continue from exactly where they left off.</p>
        <div className="lp-age-subjects">
          {[
            { emoji:'♟️', name:'Chess', lessons:'30 lessons', detail:'From pieces to tournament strategy' },
            { emoji:'💻', name:'Coding', lessons:'40 lessons', detail:'From Python basics to live websites' },
            { emoji:'⌨️', name:'Typing', lessons:'40 lessons', detail:'From home row to 65 WPM certificate' },
          ].map((s,i) => (
            <div key={i} className="lp-age-card">
              <div className="lp-age-emoji">{s.emoji}</div>
              <div className="lp-age-name">{s.name}</div>
              <div className="lp-age-lessons">{s.lessons}</div>
              <div className="lp-age-detail">{s.detail}</div>
            </div>
          ))}
        </div>
        <button className="lp-btn-p" onClick={() => navigate('/register')}>Enrol your child today &rarr;</button>
      </section>

      <section className="lp-quote">
        <div className="lp-quote-bar" />
        <p className="lp-quote-text">&ldquo;The school that teaches<br />what school doesn&rsquo;t.&rdquo;</p>
        <p className="lp-quote-sub">TALENT SCHOOL ONLINE &middot; BUILT FOR AFRICAN CHILDREN &middot; AGES 6&ndash;13</p>
        <button className="lp-quote-cta" onClick={() => navigate('/register')}>Enrol your child today &rarr;</button>
      </section>

      <section className="lp-sched">
        <p className="lp-eyebrow-sm">Academics first. Always.</p>
        <h2 className="lp-section-title">Designed so school always comes first.</h2>
        <p className="lp-section-sub" style={{marginBottom:36}}>Strict daily time limits are built directly into the platform. The session locks when time is up &mdash; no screen time battles, no arguments, no guilt.</p>
        <div className="lp-sched-cards">
          <div className="lp-sched-card">
            <div className="lp-sched-day">Monday &ndash; Friday</div>
            <div className="lp-sched-time">1 hr</div>
            <div className="lp-sched-label">per day, automatically locked</div>
          </div>
          <div className="lp-sched-card">
            <div className="lp-sched-day">Saturday</div>
            <div className="lp-sched-time">2 hrs</div>
            <div className="lp-sched-label">weekly challenge day</div>
          </div>
        </div>
        <p className="lp-sched-note"><strong>Sunday is always off.</strong> No learning. No screen time. Rest is built into the structure by design. School stays first &mdash; always.</p>
      </section>

      <section className="lp-testi">
        <p className="lp-eyebrow-sm">What parents are saying</p>
        <h2 className="lp-section-title">Real Nigerian families. Real results.</h2>
        <p className="lp-section-sub">From Lagos to Abuja to Kano &mdash; parents across Nigeria watching their children grow in confidence, skill and joy.</p>
        <div className="lp-testi-grid">
          {[
            { initials:'FO', bg:'#eeedfe', tc:'#534ab7', text:'My daughter was reluctant at first but after two weeks she asks to log in herself before I even remind her. The structured lessons have made such a difference.', name:'Mrs Funmi O.', role:'Parent · Lagos' },
            { initials:'EO', bg:'#e1f5ee', tc:'#0f6e56', text:'My son completed his first coding project — a working game — and sent the link to his grandfather in the village. The pride on his face was worth every kobo.', name:'Mr Emeka O.', role:'Parent · Enugu' },
            { initials:'AB', bg:'#faeeda', tc:'#633806', text:'I always felt guilty about screen time. Now I know every minute my child spends on a screen is building a real skill. That peace of mind is priceless.', name:'Mrs Aisha B.', role:'Parent · Abuja' },
            { initials:'KA', bg:'#eeedfe', tc:'#534ab7', text:'The weekly WhatsApp report is what sold me. I can see exactly what Tunde learned and what is recommended next. It genuinely feels like a real school.', name:'Mr Kunle A.', role:'Parent · Ibadan' },
          ].map((t,i) => (
            <div key={i} className="lp-tcard">
              <div className="lp-tstars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p className="lp-ttext">&ldquo;{t.text}&rdquo;</p>
              <div className="lp-tauthor">
                <div className="lp-tavatar" style={{background:t.bg,color:t.tc}}>{t.initials}</div>
                <div><div className="lp-tname">{t.name}</div><div className="lp-trole">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-fcta">
        <h2 className="lp-fcta-title">Start your child&rsquo;s journey today.</h2>
        <p className="lp-fcta-sub">First week completely free. Join Nigerian children already building tomorrow&rsquo;s skills right now.</p>
        <button className="lp-fcta-btn" onClick={() => navigate('/register')}>Enrol free &mdash; first week on us &rarr;</button>
        <p className="lp-fcta-small">No commitment. Cancel anytime. &#8358;3,500/month after free week.</p>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-logo"><span className="lp-dot" />Talent School Online</div>
        <div className="lp-footer-links">
          <span onClick={() => navigate('/subject/chess')}>Chess</span>
          <span onClick={() => navigate('/subject/coding')}>Coding</span>
          <span onClick={() => navigate('/subject/typing')}>Typing</span>
          <span onClick={() => navigate('/login')}>Parent login</span>
          <span onClick={() => navigate('/child/login')}>Student login</span>
        </div>
        <div className="lp-footer-tag">Where African children learn tomorrow&rsquo;s skills today.</div>
      </footer>

    </div>
  );
}
