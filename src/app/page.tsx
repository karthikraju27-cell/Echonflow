import { WordmarkText } from "@/components/WordmarkText";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { FlowArtwork } from "@/components/FlowArtwork";

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link href="/" className="wordmark" aria-label="Echonflow home"><BrandMark size={34} /><WordmarkText /></Link>
        <nav aria-label="Main navigation"><a href="#explore" className="desktop-link">Explore Echonflow</a><Link href="/auth/seeker" className="text-link">Sign in <span aria-hidden="true">↗</span></Link></nav>
      </header>
      <main id="main-content">
        <section className="landing-hero">
          <div className="hero-copy">
            <h1>A little more energy.<br />A little more <em>you.</em></h1>
            <p>Understand what you need. Learn what helps. Find the people and places that bring your wellbeing to life.</p>
            <Link href="/auth/seeker" className="flow-button">Find your starting point <span aria-hidden="true">↗</span></Link>
            <p className="hero-caption">Your Energy &amp; Resilience Audit is a good place to begin.</p>
          </div>
          <div className="hero-world">
            <FlowArtwork />
            <div className="world-caption"><span>Make room for your wellbeing.</span><span>Find your flow.</span></div>
          </div>
        </section>
        <section id="explore" className="explore-section">
          <div className="section-heading"><h2>One place.<br />Three ways to grow.</h2><p>For your own journey. For the people who guide it. For the ideas that move us forward.</p></div>
          <div className="layer-grid">
            <Link href="/auth/seeker" className="layer-panel individual-panel"><span className="layer-label">Individuals</span><h3>Start with<br />yourself.</h3><p>Understand your energy with ERA. Build your knowledge through 13 modules, 116 chapters, and course certifications.</p><span className="panel-cta">Explore your wellbeing <span aria-hidden="true">↗</span></span></Link>
            <Link href="/auth/provider" className="layer-panel provider-panel"><span className="layer-label">Providers</span><h3>Your practice.<br />More possibilities.</h3><p>Enroll your service, list your practice, or explore Workation Readiness Score (WRS™) for your property.</p><span className="panel-cta">Enter your provider space <span aria-hidden="true">↗</span></span></Link>
            <Link href="/auth/seeker?next=%2Fvarta" className="layer-panel varta-panel"><span className="layer-label">Vārtā</span><h3>A fresh<br />perspective.</h3><p>Discover wellness reels, thoughtful insights, and ideas worth bringing into your everyday life.</p><span className="panel-cta">Discover Vārtā <span aria-hidden="true">↗</span></span></Link>
          </div>
        </section>
        <section className="journey-section"><h2>Less guessing.<br /><em>More understanding.</em></h2><div className="journey-steps"><div><h3>Understand your energy</h3><p>Explore five dimensions of your wellbeing with the Energy &amp; Resilience Audit.</p></div><div><h3>Find your next step</h3><p>Use your personal results to discover relevant learning and providers.</p></div><div><h3>Build at your own pace</h3><p>Learn, earn certificates, and return to your audit to see how things change.</p></div><Link className="text-link" href="/auth/seeker">Begin with a free account <span aria-hidden="true">↗</span></Link></div></section>
      </main>
      <footer className="landing-footer"><Link href="/" className="wordmark"><BrandMark size={28} /><WordmarkText /></Link><p>Wellness, connected.</p><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></footer>
    </div>
  );
}
