import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarCheck2, Clock, Heart, Users2, Sparkles, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';


const FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% Verified Profiles",
    desc: "Every single companion profile undergoes rigorous background checks and phone audits for ultimate safety."
  },
  {
    icon: CalendarCheck2,
    title: "Seamless Booking Flow",
    desc: "Pick dates, browse schedules, choose packages, and confirm bookings within a couple of clicks."
  },
  {
    icon: Clock,
    title: "Real-time Communication",
    desc: "Instantly chat with companions to align on meeting details, outfits, and location coordinates."
  },
  {
    icon: Heart,
    title: "Custom Curated Fits",
    desc: "Filter by age, specialties, pricing, languages, and ratings to match with your perfect buddy."
  },
  {
    icon: Users2,
    title: "Social Escort Expert",
    desc: "Find appropriate partners for high-profile business dinners, family weddings, or casual coffee tours."
  },
  {
    icon: Sparkles,
    title: "Strict Confidentiality",
    desc: "Your privacy is our highest priority. All personal logs and chats are fully encrypted and private."
  }
];

const TESTIMONIALS = [
  {
    quote: "Kabir was the absolute perfect date for my company's annual award gala. Polished, elegant, and an amazing conversationalist. Highly recommended!",
    name: "Ritu M.",
    role: "Marketing Director",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
  },
  {
    quote: "Rohan's energy made the weekend cafe crawl and hike so much fun. I usually find it hard to meet new friends, but his companion session was so natural.",
    name: "Aishwarya S.",
    role: "UX Researcher",
    rating: 5,
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    quote: "Exceptional service! The security, scheduling, and billing are handled seamlessly. Arjun was prompt, polite, and very scholarly.",
    name: "Dr. Pallavi Roy",
    role: "Associate Professor",
    rating: 4.8,
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  }
];

export const LandingPage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 py-20 lg:py-32 overflow-hidden flex items-center justify-center max-w-7xl mx-auto w-full">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brandIndigo/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brandPurple/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          {/* Hero Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brandIndigo/10 border border-brandIndigo/20 text-xs font-semibold text-brandIndigo uppercase tracking-wider animate-pulse-slow">
              <Sparkles className="w-3.5 h-3.5" /> Premium Companion Network
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight">
              Find Your Perfect <br />
              <span className="text-gradient-purple">Companion Today.</span>
            </h1>
            
            <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed mx-auto lg:mx-0">
              Browse verified profiles of high-profile companions, social escorts, travel partners, and conversation specialists. Experience dating and social outings redesigned with class, privacy, and simplicity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/browse" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto hover:scale-[1.03]">
                  Find Companions
                </Button>
              </Link>
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto hover:bg-white/10">
                  Join as Companion
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Showcase Images */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="w-[380px] h-[480px] rounded-3xl overflow-hidden border border-white/10 shadow-glass-shadow relative group">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800"
                alt="Companion showcase"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel bg-darkBg/30 border-white/5 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-white">Kabir Malhotra, 26</h4>
                  <span className="text-xs text-slate-400">Social Escort • Mumbai</span>
                </div>
                <div className="flex items-center gap-1 bg-brandIndigo/20 px-2.5 py-1 rounded-lg border border-brandIndigo/30">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-white">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="bg-black/10 py-20 px-6 lg:px-12 border-y border-white/5 w-full">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-white">Redefining Social Outings</h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              We focus on premium safety, user verification, and ultimate scheduling ease, so you can book with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <Card key={index} hoverable={true} padding="md" className="space-y-4 border border-white/5 bg-white/5">
                  <div className="w-10 h-10 rounded-xl bg-brandIndigo/15 border border-brandIndigo/25 flex items-center justify-center text-brandIndigo shadow-neon-indigo">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </Card>
              );
            })}
          </div>

        </div>
      </section>

      {/* Testimonials Slider */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full relative">
        <div className="space-y-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-white">Client Reviews</h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Hear what our client community has to say about their verified companion dates.
            </p>
          </div>

          {/* Slider content */}
          <div className="relative max-w-3xl mx-auto">
            <div className="glass-panel p-8 sm:p-10 border border-white/10 relative overflow-hidden">
              <div className="space-y-6">
                
                {/* Stars */}
                <div className="flex gap-0.5 justify-center sm:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(TESTIMONIALS[activeTestimonial].rating) 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-slate-600'
                      }`} 
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-base sm:text-lg text-white font-medium italic text-center sm:text-left leading-relaxed">
                  "{TESTIMONIALS[activeTestimonial].quote}"
                </blockquote>

                {/* Avatar / Detail */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/5">
                  <img
                    src={TESTIMONIALS[activeTestimonial].photo}
                    alt={TESTIMONIALS[activeTestimonial].name}
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                  <div className="text-center sm:text-left">
                    <cite className="not-italic text-sm font-bold text-white">{TESTIMONIALS[activeTestimonial].name}</cite>
                    <span className="block text-xs text-slate-400">{TESTIMONIALS[activeTestimonial].role}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Slider controls */}
            <div className="flex justify-center sm:justify-end gap-3 mt-6">
              <button 
                onClick={handlePrevTestimonial}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNextTestimonial}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </section>
      
    </div>
  );
};

export default LandingPage;
