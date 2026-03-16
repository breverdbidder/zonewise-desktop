import AnimatedSection from "zonewise/components/animations/AnimatedSection";
import { StaggerChildren } from "zonewise/components/animations/StaggerChildren";
import AnimatedCounter from "zonewise/components/animations/AnimatedCounter";
import MeshGradient from "zonewise/components/animations/MeshGradient";
import GlowButton from "zonewise/components/animations/GlowButton";
import { ArrowRight } from "lucide-react";

const modules = [
  { n:1, name:"DiscoverWise", desc:"Find upcoming auctions across 67 FL counties" },
  { n:2, name:"GatherWise", desc:"Pull all property data — BCPAO, photos, history" },
  { n:3, name:"TitleWise", desc:"Verify the full chain of title" },
  { n:4, name:"LienWise", desc:"Map the complete lien waterfall" },
  { n:5, name:"TaxWise", desc:"Check tax certificates and delinquencies" },
  { n:6, name:"NeighborWise", desc:"Neighborhood intelligence — income, vacancy, demand" },
  { n:7, name:"ScoreWise", desc:"AI bid probability score — should you bid?" },
  { n:8, name:"BidWise", desc:"Your exact max bid. The number that matters.", hero:true },
  { n:9, name:"CallWise", desc:"Final BID / REVIEW / SKIP decision output" },
  { n:10, name:"InsightWise", desc:"Full 298-KPI auction intelligence report" },
  { n:11, name:"TrackWise", desc:"Track outcome — flip, rent, or pass" },
  { n:12, name:"VaultWise", desc:"Archive every deal, decision, and result" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#020617', color: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <header className="border-b sticky top-0 z-50" style={{ borderColor: 'rgba(30,58,95,0.3)', background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: '#1E3A5F', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>Z</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 20 }}>ZoneWise.AI</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#how" style={{ color: '#94A3B8', fontSize: 14, textDecoration: 'none' }}>How It Works</a>
            <a href="#pricing" style={{ color: '#94A3B8', fontSize: 14, textDecoration: 'none' }}>Pricing</a>
            <GlowButton href="/login" variant="primary" className="text-sm px-5 py-2.5 text-base">Get Started Free</GlowButton>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '96px 16px 80px', position: 'relative', overflow: 'hidden' }}>
        <MeshGradient intensity="subtle" />
        <div style={{ maxWidth: 896, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <AnimatedSection delay={0} direction="none">
            <p style={{ color: '#F59E0B', fontWeight: 600, letterSpacing: '0.1em', fontSize: 12, marginBottom: 24, textTransform: 'uppercase' }}>Powering Everest Capital USA</p>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.08, marginBottom: 32, letterSpacing: '-0.025em' }}>
              The AI for<br/><span style={{ color: '#F59E0B' }}>Zoning & Real Estate Intelligence</span>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <p style={{ fontSize: 'clamp(17px, 2.2vw, 22px)', color: '#94A3B8', marginBottom: 12, maxWidth: 540, margin: '0 auto 12px' }}>Distressed assets decoded. For everyone. Everywhere.</p>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 40 }}>Founded by Ariel Shapira</p>
          </AnimatedSection>
          <AnimatedSection delay={0.45}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginBottom: 48 }}>
              <GlowButton href="/login" variant="primary">Join the Beta <ArrowRight size={18} style={{ display: 'inline', marginLeft: 6 }} /></GlowButton>
              <GlowButton href="/app" variant="outline">Try AI Assistant</GlowButton>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.6}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(30,58,95,0.4)', borderRadius: 999, padding: '10px 22px' }}>
              <div style={{ width: 7, height: 7, background: '#22C55E', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, color: '#94A3B8' }}>Real intelligence across all 67 Florida counties</span>
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '40px 16px', background: '#1E3A5F' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, textAlign: 'center' }}>
          {[{ end:67, l:'Counties' }, { end:369, l:'Jurisdictions' }, { end:5950, s:'+', l:'Zoning Districts' }, { end:10.5, s:'M', d:1, l:'Parcels' }].map((s,i) => (
            <AnimatedSection key={i} delay={i*0.1}>
              <p style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800, color: '#F59E0B' }}><AnimatedCounter end={s.end} suffix={s.s||''} decimals={s.d||0} /></p>
              <p style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4 }}>{s.l}</p>
            </AnimatedSection>
          ))}
          <AnimatedSection delay={0.4}>
            <p style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800, color: '#F59E0B' }}>AI+ML</p>
            <p style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4 }}>Powered</p>
          </AnimatedSection>
        </div>
      </section>

      {/* 12 Wise System */}
      <section id="how" style={{ padding: '96px 16px', background: '#0F172A' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <AnimatedSection>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
              The 12-Stage <span style={{ color: '#F59E0B' }}>Wise System</span>
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>Every auction property passes through all 12 modules — automatically.</p>
          </AnimatedSection>
          <StaggerChildren className="" staggerDelay={0.055}>
            {modules.map(m => (
              <div key={m.n} style={{
                display: 'inline-block', width: 'calc(25% - 12px)', verticalAlign: 'top', margin: '0 6px 12px',
                borderRadius: 14, padding: 20, border: `1px solid ${m.hero ? '#F59E0B' : 'rgba(30,58,95,0.4)'}`,
                background: m.hero ? '#1E3A5F' : '#020617',
                boxShadow: m.hero ? '0 8px 32px rgba(245,158,11,0.15)' : 'none',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999, background: m.hero ? 'rgba(245,158,11,0.2)' : 'rgba(30,58,95,0.3)', color: m.hero ? '#F59E0B' : '#94A3B8' }}>{String(m.n).padStart(2,'0')}</span>
                  {m.hero && <span style={{ fontSize: 11, fontWeight: 800, color: '#F59E0B' }}>⭐ HERO</span>}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{m.name}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: m.hero ? '#bfdbfe' : '#64748b', margin: 0 }}>{m.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 16px', background: '#1E3A5F', position: 'relative', overflow: 'hidden' }}>
        <MeshGradient intensity="bold" />
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <AnimatedSection>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, marginBottom: 20 }}>Start making smarter real estate decisions</h2>
            <p style={{ color: '#cbd5e1', fontSize: 17, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.6 }}>Join investors across Florida who use ZoneWise to analyze properties and find opportunities others miss.</p>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <GlowButton href="/login" variant="primary">Join the Beta</GlowButton>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 16px', background: '#020617', borderTop: '1px solid rgba(30,58,95,0.3)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, background: '#1E3A5F', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Z</span>
          </div>
          <span style={{ fontWeight: 600 }}>ZoneWise.AI</span>
        </div>
        <p style={{ fontSize: 13, color: '#64748b' }}>Founded by Ariel Shapira · <a href="https://everestcapitalusa.com" target="_blank" rel="noopener noreferrer" style={{ color: '#F59E0B', textDecoration: 'none' }}>Everest Capital USA</a></p>
        <p style={{ fontSize: 11, color: '#475569', marginTop: 16 }}>© 2026 ZoneWise.AI — The AI for Real Estate Intelligence.</p>
      </footer>
    </div>
  );
}
