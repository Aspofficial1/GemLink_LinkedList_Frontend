import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Shield, TrendingUp, CheckCircle, ArrowRight, Pickaxe, Scissors, ShoppingBag, Plane, User } from "lucide-react";
import BlurText from "../components/reactbits/BlurText";

const fadeUp = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const GemSvgIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <polygon points="8,4 24,4 30,12 16,28 2,12" fill="#1B4F8A" />
    <polygon points="8,4 24,4 20,12 12,12" fill="#4A7FC1" />
    <polygon points="12,12 20,12 16,28" fill="#143D6B" />
    <line x1="2" y1="12" x2="30" y2="12" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
    <polygon points="14,6 18,6 16,10" fill="white" fillOpacity="0.5" />
    <line x1="6" y1="6" x2="26" y2="24" stroke="white" strokeOpacity="0.2" strokeWidth="0.5" />
  </svg>
);

import GemViewer from "../components/GemViewer";

const HeroSection: React.FC = () => (
  <section data-section="hero" className="min-h-[calc(100vh-64px)] flex items-center pt-16">
    <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
      <motion.div className="lg:w-[52%] flex flex-col gap-6" initial="hidden" animate="visible" variants={stagger}>
        <motion.div variants={{ hidden: { opacity: 0, y: -24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          className="inline-flex items-center gap-2 px-3 h-7 rounded-full border border-gold bg-gold-light w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-gold-dark">Sri Lanka Gem Industry Platform</span>
        </motion.div>

        <motion.h1 variants={fadeUp} transition={{ duration: 0.7 }} className="font-display text-[clamp(36px,5vw,64px)] font-extrabold leading-[1.05] text-text-primary">
          Protecting the<br />
          <span className="inline-flex items-baseline gap-1">
            <GemSvgIcon size={48} className="inline-block relative top-1" />uthenticity
          </span>
          <br />of Ceylon Gems
        </motion.h1>

        <BlurText
          text="A digital chain of custody for every gemstone. Track origin, verify authenticity, detect fraud — powered by a Doubly Linked List data structure."
          delay={60}
          direction="bottom"
          animateBy="words"
          className="text-[17px] text-text-secondary leading-[1.7] max-w-[460px]"
        />

        <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.5 }} className="flex gap-3 flex-wrap">
          <button className="h-[52px] px-7 rounded-[10px] bg-primary text-primary-foreground font-semibold text-[15px] flex items-center gap-2 hover:opacity-90 active:scale-[0.97] transition-all">
            Start Tracking <ArrowRight size={18} />
          </button>
          <button className="h-[52px] px-7 rounded-[10px] bg-background border-[1.5px] border-border text-text-primary font-semibold text-[15px] hover:bg-surface hover:border-border-strong transition-all">
            See How It Works
          </button>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, delay: 0.8 } } }} className="flex gap-6 flex-wrap">
          {["No Server Required", "SQLite Powered", "Open Source"].map(t => (
            <span key={t} className="flex items-center gap-1.5 text-[13px] font-medium text-text-secondary">
              <CheckCircle size={14} className="text-success" />{t}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div className="lg:w-[48%] flex justify-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
        <div className="relative flex flex-col items-center">
          <GemViewer />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="text-center text-[16px] font-semibold tracking-[0.15em] text-text-muted mt-4">
            Scan <GemSvgIcon size={10} className="inline mx-1" /> Verify <GemSvgIcon size={10} className="inline mx-1" /> Trust
          </motion.p>
        </div>
      </motion.div>
    </div>
  </section>
);

const AboutSection: React.FC = () => {
  const cards = [
    { icon: AlertTriangle, iconColor: "text-danger", iconBg: "bg-danger-bg", title: "The $1 Billion Problem", body: "Over one billion dollars worth of gems leave Sri Lanka unofficially every year. African and Madagascar gems are smuggled in and sold as genuine Ceylon gems, cheating international buyers and damaging Sri Lanka's century-old gem reputation." },
    { icon: Shield, iconColor: "text-success", iconBg: "bg-success-bg", title: "Digital Chain of Custody", body: "Every gemstone gets a digital passport. A Doubly Linked List records each stage of the journey — mining, cutting, trading, exporting, and final sale — with full verification and tamper-evident records." },
    { icon: TrendingUp, iconColor: "text-gold-dark", iconBg: "bg-gold-light", title: "Trust Means Better Prices", body: "Verified Ceylon gems command 40 to 50 percent higher prices in international markets. Our system gives miners, traders, and exporters the tools to prove authenticity instantly with a QR code scan." },
  ];

  return (
    <section data-section="about" className="py-[120px]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <BlurText
            text="THE PROBLEM WE SOLVE"
            delay={80}
            direction="top"
            animateBy="words"
            className="text-[11px] font-bold uppercase tracking-[0.1em] text-gold mb-4"
          />
          <BlurText
            text="Ceylon Gems Are Worth More. Their Story Should Be Too."
            delay={60}
            direction="top"
            animateBy="words"
            className="font-display text-[clamp(28px,4vw,42px)] font-bold text-text-primary leading-[1.1]"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-surface border border-border rounded-2xl p-10 hover:border-gold hover:shadow-[0_8px_32px_rgba(201,168,76,0.12)] hover:-translate-y-1 transition-all duration-300">
              <div className={`w-[52px] h-[52px] rounded-full ${c.iconBg} flex items-center justify-center mb-5`}>
                <c.icon size={28} className={c.iconColor} />
              </div>
              <BlurText
                text={c.title}
                delay={80}
                direction="top"
                animateBy="words"
                className="text-lg font-semibold text-text-primary mb-3"
              />
              <BlurText
                text={c.body}
                delay={30}
                direction="bottom"
                animateBy="words"
                className="text-[15px] text-text-secondary leading-[1.7]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const steps = [
  { icon: Pickaxe, name: "Mine", desc: "Gem discovered and registered with full origin details" },
  { icon: Scissors, name: "Cut", desc: "Cutting facility records new weight and polishing details" },
  { icon: ShoppingBag, name: "Trade", desc: "Ownership transfer with certificate and price recorded" },
  { icon: Plane, name: "Export", desc: "Flight number and customs invoice captured" },
  { icon: User, name: "Buyer", desc: "Final sale recorded and QR code generated" },
];

const HowItWorksSection: React.FC = () => (
  <section data-section="how-it-works" className="py-[120px] bg-surface">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <BlurText
          text="HOW IT WORKS"
          delay={80}
          direction="top"
          animateBy="words"
          className="text-[11px] font-bold uppercase tracking-[0.1em] text-gold mb-4"
        />
        <BlurText
          text="Five Stages. One Unbreakable Chain."
          delay={70}
          direction="top"
          animateBy="words"
          className="font-display text-[clamp(28px,4vw,42px)] font-bold text-text-primary leading-[1.1]"
        />
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0">
        {steps.map((s, i) => (
          <React.Fragment key={s.name}>
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
              className="w-[180px] bg-background border border-border rounded-xl p-6 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base">{i + 1}</div>
              <s.icon size={24} className="text-gold" />
              <BlurText
                text={s.name}
                delay={60}
                direction="top"
                animateBy="words"
                className="text-sm font-semibold text-text-primary"
              />
              <BlurText
                text={s.desc}
                delay={30}
                direction="bottom"
                animateBy="words"
                className="text-xs text-text-muted"
              />
            </motion.div>
            {i < 4 && (
              <motion.svg initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.3 }}
                width="40" height="24" viewBox="0 0 40 24" className="text-border-strong hidden md:block flex-shrink-0 mx-1">
                <path d="M0,12 L32,12 M26,6 L32,12 L26,18" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </motion.svg>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="text-sm text-text-muted text-center mt-12 max-w-xl mx-auto">
        <BlurText
          text="Every stage is a node in a Doubly Linked List — traversable forward from mine to buyer, and backward from buyer to mine using the prev pointer."
          delay={30}
          direction="bottom"
          animateBy="words"
          className="text-sm text-text-muted"
        />
      </div>
    </div>
  </section>
);

const techItems = [
  { name: "Java", desc: "Backend logic, data structures, and all business rules", label: "JV" },
  { name: "Doubly Linked List", desc: "Core data structure enabling bidirectional gem journey traversal", label: "DL" },
  { name: "SQLite", desc: "Lightweight embedded database requiring zero server configuration", label: "SQ" },
  { name: "ZXing", desc: "Open source QR code generation library for gem digital passports", label: "ZX" },
  { name: "React", desc: "Component-based frontend with hooks and real-time state management", label: "Re" },
  { name: "Tailwind CSS", desc: "Utility-first CSS for consistent and rapid UI development", label: "Tw" },
  { name: "Recharts", desc: "Composable chart library for price appreciation visualization", label: "Rc" },
  { name: "Framer Motion", desc: "Production-grade animation library for smooth interactions", label: "FM" },
];

const TechSection: React.FC = () => (
  <section data-section="tech" className="py-[120px]">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <BlurText
          text="TECHNOLOGY"
          delay={80}
          direction="top"
          animateBy="words"
          className="text-[11px] font-bold uppercase tracking-[0.1em] text-gold mb-4"
        />
        <BlurText
          text="Built With Purpose"
          delay={80}
          direction="top"
          animateBy="words"
          className="font-display text-[clamp(28px,4vw,42px)] font-bold text-text-primary"
        />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {techItems.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-surface border border-border rounded-xl p-6 flex items-start gap-4 hover:border-gold hover:bg-[#FFFDF5] transition-all duration-200">
            <div className="w-11 h-11 rounded-[10px] bg-surface-2 flex items-center justify-center text-sm font-bold text-text-secondary flex-shrink-0">{t.label}</div>
            <div>
              <BlurText
                text={t.name}
                delay={60}
                direction="top"
                animateBy="words"
                className="text-[15px] font-semibold text-text-primary"
              />
              <BlurText
                text={t.desc}
                delay={25}
                direction="bottom"
                animateBy="words"
                className="text-[13px] text-text-muted mt-1"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const statsItems = [
  { value: 2847, label: "Gems Tracked", suffix: "+" },
  { value: 94, label: "Ceylon Verified", suffix: "%" },
  { value: 156, label: "Fraud Alerts Prevented", suffix: "" },
  { value: 23, label: "Countries Reached", suffix: "" },
];

const CountUp: React.FC<{ target: number; suffix: string }> = ({ target, suffix }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const interval = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(interval); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center px-8">
      <p className="font-display text-[52px] font-extrabold text-primary-foreground">{count.toLocaleString()}{suffix}</p>
      <BlurText
        text={statsItems.find(s => s.value === target)?.label ?? ""}
        delay={60}
        direction="bottom"
        animateBy="words"
        className="text-sm font-medium text-primary-foreground/50 mt-1"
      />
    </div>
  );
};

const StatsSection: React.FC = () => (
  <section data-section="stats" className="py-20 bg-primary">
    <div className="container mx-auto px-6 flex flex-wrap justify-center items-center divide-x divide-primary-foreground/10">
      {statsItems.map(s => <CountUp key={s.label} target={s.value} suffix={s.suffix} />)}
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer data-section="footer" className="bg-primary pt-20 pb-10">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-3 gap-12 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GemSvgIcon size={24} />
            <span className="font-display text-xl font-bold text-primary-foreground">Ceylon<span className="text-gold">Gem</span></span>
          </div>
          <BlurText
            text="A digital passport system for the Ceylon gem industry. Protecting authenticity, building trust."
            delay={30}
            direction="bottom"
            animateBy="words"
            className="text-sm text-primary-foreground/50 max-w-[280px] leading-relaxed"
          />
        </div>
        <div>
          <BlurText
            text="Navigation"
            delay={80}
            direction="top"
            animateBy="words"
            className="text-xs font-bold uppercase tracking-[0.1em] text-primary-foreground/30 mb-4"
          />
          {["Home", "Track Gem", "Register Gem", "Compare Gems", "Fraud Alerts", "Reports"].map(l => (
            <p key={l} className="text-sm text-primary-foreground/60 hover:text-primary-foreground cursor-pointer mb-2 transition-colors">{l}</p>
          ))}
        </div>
        <div>
          <BlurText
            text="Built For"
            delay={80}
            direction="top"
            animateBy="words"
            className="text-xs font-bold uppercase tracking-[0.1em] text-primary-foreground/30 mb-4"
          />
          {["National Institute of Business Management", "School of Computing and Engineering", "HND Software Engineering", "PDSA Coursework 2025"].map(l => (
            <p key={l} className="text-sm text-primary-foreground/60 mb-2">{l}</p>
          ))}
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between gap-4">
        <BlurText
          text="2025 Gem Origin Tracking System. Built for NIBM PDSA Coursework."
          delay={30}
          direction="bottom"
          animateBy="words"
          className="text-[13px] text-primary-foreground/30"
        />
        <BlurText
          text="Powered by Java and Doubly Linked List"
          delay={50}
          direction="bottom"
          animateBy="words"
          className="text-[13px] text-primary-foreground/30"
        />
      </div>
    </div>
  </footer>
);

const LandingPage: React.FC = () => (
  <>
    <HeroSection />
    <AboutSection />
    <HowItWorksSection />
    <TechSection />
    <StatsSection />
    <Footer />
  </>
);

export default LandingPage;
