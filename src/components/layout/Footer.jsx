import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-darkSurface border-t border-gray-800 mt-auto">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Jigo</h3>
          <p className="text-sm text-gray-400">
            Premium companion platform
          </p>
        </div>
        
        {/* Legal Links */}
        <div>
          <h4 className="font-semibold text-white mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/legal/privacy" className="text-gray-400 hover:text-white transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/legal/terms" className="text-gray-400 hover:text-white transition">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/legal/safety" className="text-gray-400 hover:text-white transition">
                Safety Guidelines
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="text-gray-400 hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/search" className="text-gray-400 hover:text-white transition">
                Search
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="text-gray-400">
              <a href="mailto:support@jigoapp.com" className="hover:text-white transition">
                support@jigoapp.com
              </a>
            </li>
            <li className="text-gray-400">
              <a href="mailto:safety@jigoapp.com" className="hover:text-white transition">
                safety@jigoapp.com
              </a>
            </li>
            <li className="text-gray-400">
              <a href="mailto:legal@jigoapp.com" className="hover:text-white transition">
                legal@jigoapp.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
        <p>© 2024 Jigo. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
