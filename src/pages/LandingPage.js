import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="lp">

      <nav className="lp-nav">
        <div className="lp-nav-logo">
          <span className="lp-nav-dot" />
          Talent School Online
        </div>
        <div className="lp-nav-links">
          <a href="#skills" className="lp-nav-link">Skills</a>
          <a href="#schedule" className="lp-nav-link">How it works</a>
          <button className="lp-nav-login" onClick={() => navigate('/login')}>Log in</button>
          <button className="lp-nav-cta" onClick={() => navigate('/register')}>Start free today</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          Built for African children. Designed for a global future.
        </div>
        <h1 className="hero-h1">
          A child exposed to video games will <span className="accent-red">play.</span><br />
          A child exposed to chess will <span className="accent-teal">think.</span><br />
          A child exposed to learning will <span className="accent-amber">lead.</span>
        </h1>
        <p className="hero-sub">
          Every skill your child builds today is an advantage they carry for life.
          Talent School Online gives children aged 6–13 the skills the world will reward —
          guided by Ms. Momo, their personal AI tutor.
        </p>
        <div className="hero-ctas">
          <button className="cta-primary" onClick={() => navigate('/register')}>
            Start your child's journey →
          </button>
          <button className="cta-secondary" onClick={() => navigate('/child/dashboard')}>
            See how it works
          </button>
        </div>
        <div className="hero-trust">
          {['Ages 6–13', '6 life skills in one platform', 'Ms. Momo AI Tutor', 'No interference with school'].map(t => (
            <span key={t} className="trust-item"><span className="trust-check">✓</span> {t}</span>
          ))}
        </div>
      </section>

      <section className="vs-section">
        <p className="section-label">The difference that matters</p>
        <div className="vs-cards">
          <div className="vs-card vs-consumer">
            <div className="vs-tag">
              <span className="vs-tag-icon">📱</span>
              Unguided screen time
            </div>
            <h3 className="vs-headline">Consuming what others have built</h3>
            <p className="vs-body">Entertained today. No skill gained. No future advantage. The screen time happens either way.</p>
          </div>
          <div className="vs-card vs-creator">
            <div className="vs-tag">
              <span className="vs-tag-icon">🚀</span>
              Guided skill-building
            </div>
            <h3 className="vs-headline">Thinking, creating and growing every session</h3>
            <p className="vs-body">Every hour on Talent School Online sharpens a skill that stays with your child forever.</p>
          </div>
        </div>
        <p className="vs-statement">
          Both children spent one hour on a screen.<br />
          Only one of them <em>grew from it.</em>
        </p>
      </section>

      <section className="fear-section">
        <p className="section-label">The world your child will enter</p>
        <h2 className="fear-headline">
          Your child will compete for opportunities with children growing up in these countries — right now.
        </h2>
        <p className="fear-sub">
          By the time your child is 20, the job market is global. The child in London, Shanghai, or Madrid
          building skills today is your child's competition tomorrow. The gap opens early.
        </p>
        <div className="competitors-row">
          {[
            { flag: '🇨🇳', name: 'China' },
            { flag: '🇬🇧', name: 'United Kingdom' },
            { flag: '🇮🇳', name: 'India' },
            { flag: '🇪🇸', name: 'Spain' },
            { flag: '🇩🇪', name: 'Germany' },
            { flag: '🇧🇷', name: 'Brazil' },
            { flag: '🇺🇸', name: 'United States' },
          ].map(c => (
            <div key={c.name} className="competitor-pill">
              <span className="flag">{c.flag}</span> {c.name}
            </div>
          ))}
        </div>
        <div className="fear-callout">
          <p className="fear-callout-text">
            No African parent wants their child to be <span className="highlight">left behind.</span><br />
            The question is not whether to act — it is <span className="highlight">when.</span>
          </p>
          <p className="fear-callout-sub">Every month you wait is a month another child gets ahead.</p>
        </div>
      </section>

      <section className="schedule-section" id="schedule">
        <p className="section-label">Academics first. Always.</p>
        <h2 className="schedule-headline">We protect your child's school performance — by design.</h2>
        <p className="schedule-sub">
          Talent School Online is not another screen addiction. We built strict daily limits
          directly into the platform so your child develops powerful skills without sacrificing the classroom.
        </p>
        <div className="schedule-grid">
          <div className="schedule-card">
            <div className="sched-days">Monday – Friday</div>
            <div className="sched-time">1 hr</div>
            <div className="sched-label">per day, automatically locked</div>
          </div>
          <div className="schedule-card">
            <div className="sched-days">Saturday</div>
            <div className="sched-time">2 hrs</div>
            <div className="sched-label">extended learning day</div>
          </div>
        </div>
        <p className="schedule-promise">
          <strong>Sunday is always off.</strong> The platform locks automatically — no screen time battles,
          no guilt. Your child learns the discipline of structured time alongside the skills themselves.
          School stays first.
        </p>
      </section>

      <section className="skills-section" id="skills">
        <p className="section-label">What your child learns</p>
        <h2 className="skills-headline">Six skills. One platform. One tutor who knows your child.</h2>
        <p className="skills-sub">
          Ms. Momo guides your child through every subject with voice instructions, live feedback,
          and warm encouragement — in a voice that feels familiar, not foreign.
        </p>
        <div className="skills-grid">
          {[
            { icon: '♟️', name: 'Chess', desc: 'Strategic thinking and patience that transfers to every area of life' },
            { icon: '💻', name: 'Coding', desc: 'Build real things — games, tools, websites — from scratch' },
            { icon: '⌨️', name: 'Typing', desc: 'Speed and accuracy for a world that runs on keyboards' },
            { icon: '📖', name: 'Vocabulary', desc: 'A rich mind expressed through confident, precise language' },
            { icon: '🎤', name: 'Public speaking', desc: 'The courage and clarity to command any room' },
            { icon: '🌍', name: 'Languages', desc: 'Yoruba, Igbo, Hausa, French, Mandarin, Spanish and English' },
          ].map(s => (
            <div key={s.name} className="skill-card">
              <div className="skill-icon">{s.icon}</div>
              <div className="skill-name">{s.name}</div>
              <div className="skill-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="momo-section">
        <div className="momo-card">
          <div className="momo-avatar">🎓</div>
          <div className="momo-content">
            <h2 className="momo-headline">Meet Ms. Momo — your child's AI tutor</h2>
            <p className="momo-body">
              Ms. Momo is present in every lesson. She gives voice instructions, celebrates every
              breakthrough, encourages through every struggle, and adapts to how your child learns.
              She is the patient, consistent teacher every child deserves.
            </p>
            <div className="momo-features">
              {[
                'Speaks in warm, Nigerian-accented English',
                'Adjusts pace to each child automatically',
                'Sends weekly reports to parents on WhatsApp',
                'Suggests rewards when your child hits a milestone',
              ].map(f => (
                <div key={f} className="momo-feature">
                  <span className="momo-check">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="projects-section">
        <p className="section-label">Real outcomes</p>
        <h2 className="projects-headline">Your child builds real things — and shares them with the world.</h2>
        <p className="projects-sub">
          Every major project your child completes gets a live shareable link. A game they coded.
          A chess tournament result. A typing speed record. Share it to your family WhatsApp group
          with one tap — because pride should be shared.
        </p>
        <div className="project-example">
          <div className="proj-ex-header">
            <span className="proj-ex-dot" />
            <span className="proj-ex-title">Chidera's Number Guessing Game · Python · Age 10</span>
            <span className="proj-ex-badge">Live project</span>
          </div>
          <div className="proj-ex-body">
            <div className="proj-ex-code">
              <div className="code-line"><span className="ln">1</span><span className="cm"># Chidera built this entirely herself</span></div>
              <div className="code-line"><span className="ln">2</span><span className="kw">import </span><span className="vr">random</span></div>
              <div className="code-line"><span className="ln">3</span></div>
              <div className="code-line"><span className="ln">4</span><span className="vr">secret</span> = <span className="fn">random.randint</span>(<span className="nm">1</span>, <span className="nm">10</span>)</div>
              <div className="code-line"><span className="ln">5</span><span className="vr">guess</span> = <span className="fn">int</span>(<span className="fn">input</span>(<span className="st">"Guess a number: "</span>))</div>
              <div className="code-line"><span className="ln">6</span><span className="kw">if </span><span className="vr">guess</span> == <span className="vr">secret</span>:</div>
              <div className="code-line"><span className="ln">7</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="fn">print</span>(<span className="st">"Amazing! You got it!"</span>)</div>
            </div>
            <div className="proj-ex-share">
              <div className="proj-ex-child">👧 Chidera, Age 10</div>
              <div className="proj-ex-desc">4 weeks of consistent learning produced this fully working Python game. Chidera built every line herself.</div>
              <button className="proj-share-btn">📱 Share this achievement</button>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <h2 className="final-h2">The school that teaches what school doesn't.</h2>
        <p className="final-sub">
          While every other child is cramming for the next test, yours will be learning to think,
          speak, lead and create. The first week is completely free.
        </p>
        <button className="final-cta-btn" onClick={() => navigate('/register')}>
          Start your child's journey today →
        </button>
        <p className="final-small">No commitment. Cancel anytime. First 7 days free.</p>
      </section>

      <footer className="lp-footer">
        <div className="footer-logo">
          <span className="lp-nav-dot" />
          Talent School Online
        </div>
        <div className="footer-links">
          <span onClick={() => navigate('/login')} className="footer-link">Parent login</span>
          <span onClick={() => navigate('/register')} className="footer-link">Register</span>
          <span onClick={() => navigate('/child/login')} className="footer-link">Child login</span>
        </div>
        <div className="footer-tagline">Where African children learn tomorrow's skills today.</div>
      </footer>

    </div>
  );
}
