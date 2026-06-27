import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#07080c] border-t border-white/5 mt-auto py-12 px-6 lg:px-12 text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-brandIndigo to-brandPurple flex items-center justify-center font-heading text-white font-extrabold text-sm shadow-neon-purple">
              J
            </div>
            <span className="text-lg font-heading font-bold text-white tracking-wide">
              Jigo<span className="text-brandIndigo">.</span>
            </span>
          </Link>
          <p className="text-xs leading-relaxed max-w-xs text-slate-500">
            Find premium companion services, social escorts, and VIP buddies near you. Making dating and connections professional, secure, and classy.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-heading font-semibold text-white mb-4">Quick Links</h4>
          <ul className="flex flex-col gap-2.5 text-xs">
            <li><Link to="/browse" className="hover:text-white transition-colors">Browse Companion Profiles</Link></li>
            <li><Link to="/signup" className="hover:text-white transition-colors">Join as Jigolo</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Client Login</Link></li>
          </ul>
        </div>

        {/* Legal Info */}
        <div>
          <h4 className="text-sm font-heading font-semibold text-white mb-4">Legal</h4>
          <ul className="flex flex-col gap-2.5 text-xs">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Safety Guidelines</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-sm font-heading font-semibold text-white mb-4">Support</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-500">
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>support@jigo.app</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>+91 22 4567 8900</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Bandra West, Mumbai, India</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <span>© {new Date().getFullYear()} Jigo. All rights reserved.</span>
        <span>Made with ❤️ for premium companion connections.</span>
      </div>
    </footer>
  );
};

export default Footer;
