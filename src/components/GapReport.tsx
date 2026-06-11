import { useState, useEffect, useRef } from 'react';

const CALENDLY_URL = 'https://calendly.com/hello-pixova/30min';

type State = 'GATE' | 'QUALIFY' | 'RUNNING' | 'RESULTS';

interface GateData {
  firstName: string;
  email: string;
}

interface QualifyData {
  businessName: string;
  website: string;
  keyword: string;
  location: string;
  painPoint: string;
  workSource: string;
}

interface AuditResult {
  userScore: number;
  competitorScores: number[];
  comparisonRows: { metric: string; sub?: string; you: string; them: string; youGood: boolean }[];
  verdict: string;
  lockedTeaser: string;
  topStrength: string;
  emailSubject: string;
  serpTop10: { position: number; title: string; domain: string }[];
  userDomainPosition: number | null;
  userDomain: string;
  competitorDomains: (string | null)[];
  error?: string;
}

const PAIN_POINTS = [
  'Phone isn\'t ringing enough',
  'Competitors keep beating me on Google',
  'My website looks dated',
  'Getting visits but no enquiries',
  'Don\'t know where to start',
];

const WORK_SOURCES = ['Word of mouth', 'Google', 'Social media', 'Paid ads'];

const STEPS = [
  'Found who\'s ranking in your area',
  'Checking your website speed',
  'Reading your top competitors\' pages',
  'Writing your verdict',
];

const STEP_DURATIONS = [3000, 4000, 8000, 6000];

function scoreColor(score: number): string {
  if (score >= 7) return '#2ECC9A';
  if (score >= 5) return '#E8A33D';
  return '#E05A4E';
}

function scoreBg(score: number): string {
  if (score >= 7) return '#E8F5F1';
  if (score >= 5) return '#FEF3E2';
  return '#FDECEA';
}

function CountUp({ target, color }: { target: number; color: string }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 20);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setCurrent(target); clearInterval(interval); }
      else setCurrent(start);
    }, 40);
    return () => clearInterval(interval);
  }, [target]);
  return <span style={{ color, fontFamily: 'DM Sans, sans-serif', fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>{current}</span>;
}

function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (prefersReduced.current) { setDisplayed(text); onDone?.(); return; }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); onDone?.(); }
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
}

function ScoreCard({ rank, domain, score }: { rank: string; domain?: string; score: number }) {
  const color = scoreColor(score);
  const bg = scoreBg(score);
  return (
    <div style={{
      background: bg,
      border: `2px solid ${color}`,
      borderRadius: 12,
      padding: '1.25rem 1rem',
      textAlign: 'center',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: '#1A2E3D', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem', opacity: 0.6 }}>
        {rank}
      </div>
      {domain && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, color: '#1A2E3D', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', opacity: 0.75 }}>
          {domain}
        </div>
      )}
      <CountUp target={score} color={color} />
      <div style={{ color: '#1A2E3D', fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.5 }}>/10</div>
    </div>
  );
}

export function GapReport() {
  const [state, setState] = useState<State>('GATE');
  const [gateData, setGateData] = useState<GateData>({ firstName: '', email: '' });
  const [qualifyData, setQualifyData] = useState<QualifyData>({
    businessName: '', website: '', keyword: '', location: '', painPoint: '', workSource: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false]);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function normaliseUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return 'https://' + trimmed;
  }

  async function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!gateData.firstName.trim()) errs.firstName = 'Enter your name.';
    if (!validateEmail(gateData.email)) errs.email = 'Enter a valid email address.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await fetch('/api/lead/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: gateData.firstName, email: gateData.email }),
      });
    } catch (_) { /* non-blocking */ }
    setSubmitting(false);
    setState('QUALIFY');
  }

  async function handleQualifySubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!qualifyData.businessName.trim()) errs.businessName = 'Enter your business name.';
    const normUrl = normaliseUrl(qualifyData.website);
    if (!normUrl) errs.website = 'Enter your website address.';
    if (qualifyData.keyword.trim().length === 0) errs.keyword = 'Enter what you want to rank for.';
    if (qualifyData.keyword.trim().length > 60) errs.keyword = 'Keep this under 60 characters.';
    if (qualifyData.location.trim().length === 0) errs.location = 'Enter your town or area.';
    if (qualifyData.location.trim().length > 40) errs.location = 'Keep this under 40 characters.';
    if (!qualifyData.painPoint) errs.painPoint = 'Pick the option that fits best.';
    if (!qualifyData.workSource) errs.workSource = 'Pick one.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const finalData = { ...qualifyData, website: normUrl };
    setQualifyData(finalData);

    setState('RUNNING');

    // Send enriched lead data to Brevo (non-blocking)
    fetch('/api/lead/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: gateData.email,
        businessName: finalData.businessName,
        website: finalData.website,
        keyword: finalData.keyword,
        location: finalData.location,
        painPoint: finalData.painPoint,
        workSource: finalData.workSource,
      }),
    }).catch(() => {});

    // Start audit API call
    const auditPromise = fetch('/api/audit/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        website: finalData.website,
        keyword: finalData.keyword,
        location: finalData.location,
        email: gateData.email,
      }),
    }).then(r => r.json());

    // Animate progress steps against real response
    runProgressSteps(auditPromise);
  }

  function runProgressSteps(auditPromise: Promise<AuditResult>) {
    let resolved = false;
    let result: AuditResult | null = null;

    auditPromise.then(data => {
      resolved = true;
      result = data;
    }).catch(() => {
      resolved = true;
      result = { error: 'fetch_failed' } as any;
    });

    const ticks = [0, ...STEP_DURATIONS.slice(0, 3).reduce<number[]>((acc, d, i) => {
      acc.push((acc[i - 1] ?? 0) + d);
      return acc;
    }, [])];

    ticks.forEach((delay, i) => {
      setTimeout(() => {
        setCompletedSteps(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay);
    });

    // Step 4 (Writing verdict) only completes when response arrives
    const step3End = ticks[3] ?? STEP_DURATIONS.reduce((a, b) => a + b, 0);
    const pollStart = Date.now();
    function waitForResult() {
      if (resolved) {
        setCompletedSteps([true, true, true, true]);
        setTimeout(() => {
          if (result?.error) {
            setApiError('We couldn\'t finish your report. Nothing\'s been used up — try again, or email us and we\'ll run it by hand.');
            setState('GATE');
          } else {
            setAuditResult(result);
            setState('RESULTS');
          }
        }, 600);
      } else {
        setTimeout(waitForResult, 300);
      }
    }
    const elapsed = Date.now() - pollStart;
    const waitUntil = step3End - elapsed;
    setTimeout(waitForResult, Math.max(waitUntil, 0));
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    border: '1.5px solid #D1DBE5',
    fontFamily: 'Inter, sans-serif',
    fontSize: '1rem',
    color: '#1A2E3D',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1A2E3D',
    marginBottom: '0.375rem',
  };

  const errorStyle: React.CSSProperties = {
    color: '#E05A4E',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
  };

  const btnStyle: React.CSSProperties = {
    background: '#2ECC9A',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '0.875rem 2rem',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    width: '100%',
  };

  // ── GATE ────────────────────────────────────────────────────────
  if (state === 'GATE') {
    return (
      <div style={{ background: '#F7FAFA', minHeight: '100vh', padding: '3rem 1rem' }}>
        {apiError && (
          <div style={{ maxWidth: 520, margin: '0 auto 1.5rem', background: '#FDECEA', border: '1px solid #E05A4E', borderRadius: 8, padding: '1rem 1.25rem', color: '#E05A4E', fontSize: '0.9rem' }}>
            {apiError}
          </div>
        )}
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#2ECC9A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Free Tool
            </p>
            <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 700, color: '#1C3557', lineHeight: 1.15, marginBottom: '1rem' }}>
              See who's beating you on Google. And exactly why.
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.05rem', color: '#1A2E3D', lineHeight: 1.6 }}>
              We check your website against the businesses actually ranking for your keyword in your area. Real numbers, plain English, about a minute.
            </p>
          </div>

          <form onSubmit={handleGateSubmit} noValidate style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 16px rgba(28,53,87,0.08)' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle} htmlFor="firstName">Your name</label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                style={{ ...inputStyle, borderColor: errors.firstName ? '#E05A4E' : '#D1DBE5' }}
                value={gateData.firstName}
                onChange={e => setGateData(d => ({ ...d, firstName: e.target.value }))}
              />
              {errors.firstName && <p style={errorStyle}>{errors.firstName}</p>}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle} htmlFor="email">Your email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                style={{ ...inputStyle, borderColor: errors.email ? '#E05A4E' : '#D1DBE5' }}
                value={gateData.email}
                onChange={e => setGateData(d => ({ ...d, email: e.target.value }))}
              />
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
            </div>
            <button type="submit" style={btnStyle} disabled={submitting}>
              {submitting ? 'One moment…' : 'Start my Gap Report →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#6B7F8E', marginTop: '0.875rem' }}>
              Have a look for yourself. No card, no catch.
            </p>
          </form>

          <div style={{ marginTop: '2.5rem' }}>
            <p style={{ textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#1C3557', marginBottom: '1.25rem' }}>How it works</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {['Tell us your site and the keyword you want to rank for', 'We check who\'s ranking and why they\'re above you', 'You see the gap — live, on screen'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  <div style={{ background: '#E8F5F1', color: '#2ECC9A', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#1A2E3D', lineHeight: 1.5, paddingTop: 2 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUALIFY ──────────────────────────────────────────────────────
  if (state === 'QUALIFY') {
    return (
      <div style={{ background: '#F7FAFA', minHeight: '100vh', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(1.4rem, 4vw, 1.875rem)', fontWeight: 700, color: '#1C3557', marginBottom: '0.5rem' }}>
            Nearly there, {gateData.firstName}. Tell us what to check.
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#6B7F8E', marginBottom: '2rem', fontSize: '0.9rem' }}>All fields are used in your report — none are optional.</p>

          <form onSubmit={handleQualifySubmit} noValidate style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 16px rgba(28,53,87,0.08)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle} htmlFor="businessName">Business name</label>
              <input id="businessName" type="text" style={{ ...inputStyle, borderColor: errors.businessName ? '#E05A4E' : '#D1DBE5' }}
                value={qualifyData.businessName} onChange={e => setQualifyData(d => ({ ...d, businessName: e.target.value }))} />
              {errors.businessName && <p style={errorStyle}>{errors.businessName}</p>}
            </div>

            <div>
              <label style={labelStyle} htmlFor="website">Your website</label>
              <input id="website" type="url" placeholder="https://yoursite.co.uk" style={{ ...inputStyle, borderColor: errors.website ? '#E05A4E' : '#D1DBE5' }}
                value={qualifyData.website} onChange={e => setQualifyData(d => ({ ...d, website: e.target.value }))} />
              {errors.website && <p style={errorStyle}>{errors.website}</p>}
            </div>

            <div>
              <label style={labelStyle} htmlFor="keyword">What do you want to rank for?</label>
              <input id="keyword" type="text" placeholder="e.g. emergency plumber" maxLength={60}
                style={{ ...inputStyle, borderColor: errors.keyword ? '#E05A4E' : '#D1DBE5' }}
                value={qualifyData.keyword} onChange={e => setQualifyData(d => ({ ...d, keyword: e.target.value }))} />
              {errors.keyword && <p style={errorStyle}>{errors.keyword}</p>}
            </div>

            <div>
              <label style={labelStyle} htmlFor="location">Your town or area</label>
              <input id="location" type="text" placeholder="e.g. Solihull" maxLength={40}
                style={{ ...inputStyle, borderColor: errors.location ? '#E05A4E' : '#D1DBE5' }}
                value={qualifyData.location} onChange={e => setQualifyData(d => ({ ...d, location: e.target.value }))} />
              {errors.location && <p style={errorStyle}>{errors.location}</p>}
            </div>

            <div>
              <label style={labelStyle} htmlFor="painPoint">What's the biggest problem right now?</label>
              <select id="painPoint" style={{ ...inputStyle, borderColor: errors.painPoint ? '#E05A4E' : '#D1DBE5', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%231A2E3D\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                value={qualifyData.painPoint} onChange={e => setQualifyData(d => ({ ...d, painPoint: e.target.value }))}>
                <option value="">Select one…</option>
                {PAIN_POINTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.painPoint && <p style={errorStyle}>{errors.painPoint}</p>}
            </div>

            <div>
              <label style={labelStyle} htmlFor="workSource">Where does most of your work come from?</label>
              <select id="workSource" style={{ ...inputStyle, borderColor: errors.workSource ? '#E05A4E' : '#D1DBE5', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%231A2E3D\' stroke-width=\'1.5\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                value={qualifyData.workSource} onChange={e => setQualifyData(d => ({ ...d, workSource: e.target.value }))}>
                <option value="">Select one…</option>
                {WORK_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.workSource && <p style={errorStyle}>{errors.workSource}</p>}
            </div>

            <button type="submit" style={{ ...btnStyle, marginTop: '0.5rem' }}>
              Run the check →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── RUNNING ──────────────────────────────────────────────────────
  if (state === 'RUNNING') {
    const nodes = [
      {
        label: 'Your site',
        sub: qualifyData.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        ),
      },
      {
        label: 'Google results',
        sub: `"${qualifyData.keyword} ${qualifyData.location}"`,
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        ),
      },
      {
        label: 'Top competitors',
        sub: 'Reading their pages',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        ),
      },
      {
        label: 'AI analysis',
        sub: 'Writing your verdict',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        ),
      },
    ];

    const activeStep = completedSteps.findIndex(s => !s);
    const allDone = completedSteps.every(Boolean);

    return (
      <div style={{ background: '#0A1929', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,-40px) scale(1.1)} }
          @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,50px) scale(0.9)} }
          @keyframes nodePulse { 0%,100%{box-shadow:0 0 0 0 rgba(46,204,154,0.4)} 50%{box-shadow:0 0 0 12px rgba(46,204,154,0)} }
          @keyframes boltTravel { 0%{top:0%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }
          @keyframes boltTravelH { 0%{left:0%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{left:100%;opacity:0} }
          @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          @keyframes scanLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(600%)} }
          @keyframes gridFade { 0%,100%{opacity:0.03} 50%{opacity:0.07} }
        `}</style>

        {/* Ambient orbs */}
        <div style={{ position:'absolute', top:'10%', right:'5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(46,204,154,0.08) 0%, transparent 70%)', animation:'orb1 8s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'10%', left:'5%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(28,53,87,0.4) 0%, transparent 70%)', animation:'orb2 10s ease-in-out infinite', pointerEvents:'none' }} />

        {/* Grid overlay */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(46,204,154,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(46,204,154,0.04) 1px, transparent 1px)', backgroundSize:'40px 40px', animation:'gridFade 4s ease-in-out infinite', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:560 }}>
          {/* Title */}
          <div style={{ textAlign:'center', marginBottom:'2.5rem', animation:'fadeSlideUp 0.5s ease both' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'rgba(46,204,154,0.1)', border:'1px solid rgba(46,204,154,0.2)', borderRadius:20, padding:'0.35rem 1rem', marginBottom:'1rem' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#2ECC9A', animation:'nodePulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.75rem', color:'#2ECC9A', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase' }}>Analysing now</span>
            </div>
            <h2 style={{ fontFamily:'DM Sans, sans-serif', fontWeight:700, color:'#fff', fontSize:'clamp(1.2rem,3.5vw,1.5rem)', lineHeight:1.3, margin:0 }}>
              "{qualifyData.keyword} {qualifyData.location}"
            </h2>
          </div>

          {/* Pipeline */}
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {nodes.map((node, i) => {
              const done = completedSteps[i];
              const active = !done && (i === 0 || completedSteps[i - 1]);
              const pending = !done && !active;
              const isLast = i === nodes.length - 1;

              return (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', animation: done ? 'fadeSlideUp 0.4s ease both' : 'none' }}>
                  {/* Node row */}
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem', width:'100%' }}>
                    {/* Icon circle */}
                    <div style={{
                      width:56, height:56, borderRadius:'50%', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background: done ? '#2ECC9A' : active ? 'rgba(46,204,154,0.12)' : 'rgba(255,255,255,0.04)',
                      border: done ? '2px solid #2ECC9A' : active ? '2px solid rgba(46,204,154,0.6)' : '2px solid rgba(255,255,255,0.08)',
                      color: done ? '#fff' : active ? '#2ECC9A' : 'rgba(255,255,255,0.2)',
                      transition:'all 0.5s ease',
                      animation: active ? 'nodePulse 1.5s ease-in-out infinite' : 'none',
                      boxShadow: active ? '0 0 20px rgba(46,204,154,0.25)' : done ? '0 0 16px rgba(46,204,154,0.3)' : 'none',
                    }}>
                      {done
                        ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : node.icon
                      }
                    </div>

                    {/* Label */}
                    <div style={{ flex:1 }}>
                      <p style={{ fontFamily:'DM Sans, sans-serif', fontWeight:600, fontSize:'0.95rem', color: pending ? 'rgba(255,255,255,0.25)' : '#fff', margin:0, transition:'color 0.3s' }}>
                        {node.label}
                      </p>
                      <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem', color: pending ? 'rgba(255,255,255,0.12)' : active ? '#2ECC9A' : 'rgba(255,255,255,0.4)', margin:'0.15rem 0 0', transition:'color 0.3s', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:260 }}>
                        {done ? '✓ Done' : node.sub}
                      </p>
                    </div>

                    {/* Status badge */}
                    {done && (
                      <div style={{ background:'rgba(46,204,154,0.12)', border:'1px solid rgba(46,204,154,0.3)', borderRadius:12, padding:'0.2rem 0.7rem', flexShrink:0 }}>
                        <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.7rem', color:'#2ECC9A', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Complete</span>
                      </div>
                    )}
                    {active && (
                      <div style={{ background:'rgba(232,163,61,0.12)', border:'1px solid rgba(232,163,61,0.3)', borderRadius:12, padding:'0.2rem 0.7rem', flexShrink:0 }}>
                        <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.7rem', color:'#E8A33D', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Running</span>
                      </div>
                    )}
                  </div>

                  {/* Connector line with electric bolt */}
                  {!isLast && (
                    <div style={{ position:'relative', marginLeft:27, width:2, height:48, background: done ? 'rgba(46,204,154,0.4)' : 'rgba(255,255,255,0.06)', transition:'background 0.5s', overflow:'hidden' }}>
                      {/* Electric bolt traveling down */}
                      {(active || done) && (
                        <div style={{
                          position:'absolute', left:'50%', transform:'translateX(-50%)',
                          width:6, height:6, borderRadius:'50%',
                          background:'#2ECC9A',
                          boxShadow:'0 0 8px 3px rgba(46,204,154,0.8), 0 0 16px 6px rgba(46,204,154,0.4)',
                          animation: done ? 'none' : 'boltTravel 0.8s ease-in-out infinite',
                          top: done ? '100%' : '0%',
                        }} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop:'2rem', background:'rgba(255,255,255,0.06)', borderRadius:4, height:4, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:4,
              background:'linear-gradient(90deg, #2ECC9A, #1aad7e)',
              width:`${(completedSteps.filter(Boolean).length / nodes.length) * 100}%`,
              transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              boxShadow:'0 0 8px rgba(46,204,154,0.6)',
            }} />
          </div>
          <p style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem', color:'rgba(255,255,255,0.3)', textAlign:'center', marginTop:'0.75rem' }}>
            {allDone ? 'Finalising your report…' : `Step ${Math.min(completedSteps.filter(Boolean).length + 1, nodes.length)} of ${nodes.length}`}
          </p>
        </div>
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────────
  if (state === 'RESULTS' && auditResult) {
    const comp1Score = auditResult.competitorScores[0] ?? 0;
    const comp2Score = auditResult.competitorScores[1] ?? 0;
    const comp1Domain = auditResult.competitorDomains?.[0] ?? 'Competitor 1';
    const comp2Domain = auditResult.competitorDomains?.[1] ?? 'Competitor 2';

    return (
      <div style={{ background: '#F7FAFA', minHeight: '100vh', paddingBottom: '4rem' }}>
        <style>{`
          @keyframes resultsIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes rowIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
          .results-section { animation: resultsIn 0.5s ease both; }
          .row-animate { animation: rowIn 0.4s ease both; }
        `}</style>

        {/* Dark header band */}
        <div style={{ background: 'linear-gradient(135deg, #0A1929 0%, #1C3557 100%)', padding: '2rem 1rem 3rem', marginBottom: '-1.5rem' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2ECC9A' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#2ECC9A', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gap Report Complete</span>
            </div>
            <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(1.4rem, 4vw, 1.875rem)', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>{qualifyData.businessName}</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Keyword: "{qualifyData.keyword} {qualifyData.location}"</p>
          </div>
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 1rem' }}>

          {/* Score cards */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <ScoreCard rank="You" domain={auditResult.userDomain} score={auditResult.userScore} />
            {comp1Score > 0 && <ScoreCard rank="#1 Ranked" domain={comp1Domain} score={comp1Score} />}
            {comp2Score > 0 && <ScoreCard rank="#2 Ranked" domain={comp2Domain} score={comp2Score} />}
          </div>

          {/* Comparison table */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 12px rgba(28,53,87,0.07)', marginBottom: '2rem', overflowX: 'auto' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: '#1C3557', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>What they have that you don't</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#8A9BAD', marginTop: '0.25rem' }}>Each row shows the real reason they're getting calls and you're not.</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#6B7F8E', fontWeight: 500, borderBottom: '1px solid #EFF2F5' }}></th>
                  <th style={{ padding: '0.5rem 0.75rem', color: '#6B7F8E', fontWeight: 500, borderBottom: '1px solid #EFF2F5', textAlign: 'center' }}>You</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: '#6B7F8E', fontWeight: 500, borderBottom: '1px solid #EFF2F5', textAlign: 'center' }}>Them</th>
                </tr>
              </thead>
              <tbody>
                {auditResult.comparisonRows.map((row, i) => (
                  <tr key={i} className="row-animate" style={{ borderBottom: i < auditResult.comparisonRows.length - 1 ? '1px solid #EFF2F5' : 'none', animationDelay: `${i * 0.08}s` }}>
                    <td style={{ padding: '0.75rem 0.75rem' }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#1A2E3D' }}>{row.metric}</div>
                      {row.sub && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#8A9BAD', marginTop: '0.15rem', lineHeight: 1.4 }}>{row.sub}</div>}
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'top' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.5rem', background: row.youGood ? 'rgba(46,204,154,0.08)' : 'rgba(224,90,78,0.08)', borderRadius: 6, padding: '0.35rem 0.6rem', color: row.youGood ? '#1aad7e' : '#E05A4E', fontWeight: 500, fontSize: '0.8rem' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0, marginTop: 3 }}><circle cx="5" cy="5" r="5" fill={row.youGood ? '#2ECC9A' : '#E05A4E'}/></svg>
                        <span style={{ lineHeight: 1.5 }}>{row.you}</span>
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.75rem', verticalAlign: 'top' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(46,204,154,0.08)', borderRadius: 6, padding: '0.35rem 0.6rem', color: '#1aad7e', fontWeight: 500, fontSize: '0.8rem' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0, marginTop: 3 }}><circle cx="5" cy="5" r="5" fill="#2ECC9A"/></svg>
                        <span style={{ lineHeight: 1.5 }}>{row.them}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SERP list */}
          {auditResult.serpTop10?.length > 0 && (
            <div className="results-section" style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 12px rgba(28,53,87,0.07)', marginBottom: '2rem', animationDelay: '0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ECC9A" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: '#1C3557', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Google top 10</p>
              </div>
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {auditResult.serpTop10.map((item) => {
                  const isUser = item.domain === auditResult.userDomain;
                  const isTop3 = item.position <= 3;
                  return (
                    <li key={item.position} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', padding: '0.375rem 0.5rem', borderRadius: 6, background: isUser ? 'rgba(224,90,78,0.06)' : isTop3 ? 'rgba(46,204,154,0.04)' : 'transparent' }}>
                      <span style={{ width: 22, height: 22, borderRadius: 6, background: isTop3 ? (isUser ? '#E05A4E' : '#2ECC9A') : '#EFF2F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: isTop3 ? '#fff' : '#6B7F8E', flexShrink: 0 }}>{item.position}</span>
                      <span style={{ color: isUser ? '#E05A4E' : '#1A2E3D', fontWeight: isTop3 ? 500 : 400 }}>{item.domain}</span>
                      {isTop3 && !isUser && <span style={{ marginLeft: 'auto', background: 'rgba(46,204,154,0.1)', border: '1px solid rgba(46,204,154,0.2)', borderRadius: 4, padding: '0.1rem 0.4rem', fontSize: '0.65rem', color: '#1aad7e', fontWeight: 600, flexShrink: 0 }}>TOP 3</span>}
                    </li>
                  );
                })}
                {auditResult.userDomainPosition === null && (
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', marginTop: '0.375rem', padding: '0.5rem', borderRadius: 6, background: 'rgba(224,90,78,0.06)', border: '1px dashed rgba(224,90,78,0.2)' }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: '#E05A4E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="2" y1="2" x2="8" y2="8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><line x1="8" y1="2" x2="2" y2="8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    </span>
                    <span style={{ color: '#E05A4E', fontWeight: 500 }}>{auditResult.userDomain} — not in the top 10</span>
                  </li>
                )}
              </ol>
            </div>
          )}

          {/* Verdict */}
          <div className="results-section" style={{ background: 'linear-gradient(135deg, #0D2240 0%, #1C3557 100%)', borderRadius: 12, padding: '1.75rem', marginBottom: '2rem', animationDelay: '0.4s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ECC9A" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>The verdict</span>
            </div>
            {auditResult.topStrength && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', background: 'rgba(46,204,154,0.1)', border: '1px solid rgba(46,204,154,0.2)', borderRadius: 8, padding: '0.625rem 0.875rem', marginBottom: '1rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ECC9A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>{auditResult.topStrength}</p>
              </div>
            )}
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, margin: 0 }}>
              <Typewriter text={auditResult.verdict} />
            </p>
          </div>

          {/* CTA */}
          <div style={{ background: '#1C3557', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(1.25rem, 3.5vw, 1.625rem)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
              This is fixable. Faster than you think.
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Book a free 15-minute call and we'll walk you through exactly what closing the gap looks like. No pitch deck, no jargon.
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Plans from £59/month (£200 upfront, that's it).
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', background: '#2ECC9A', color: '#fff', borderRadius: 8, padding: '0.875rem 2rem', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '1rem', textDecoration: 'none' }}
            >
              Book my free call →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
