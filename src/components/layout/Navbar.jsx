import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, MessageSquare, Settings, Compass, LogOut, LayoutDashboard, User } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import Button from '../ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const guestLinks = [
    { label: 'Browse', path: '/browse', icon: Compass },
  ];

  const customerLinks = [
    { label: 'Browse', path: '/browse', icon: Compass },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
  ];

  const jigoloLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
  ];

  const links = !user 
    ? guestLinks 
    : user.role === 'jigolo' 
      ? jigoloLinks 
      : customerLinks;

  return (
    <nav className="sticky top-0 z-40 w-full bg-darkBg/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brandIndigo to-brandPurple flex items-center justify-center font-heading text-white font-extrabold text-lg shadow-neon-purple">
            J
          </div>
          <span className="text-xl font-heading font-bold text-white tracking-wide">
            Jigo<span className="text-brandIndigo">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white ${
                  isActive(link.path) ? 'text-brandIndigo font-semibold' : 'text-slate-400'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User Account Controls */}
        <div className="hidden md:flex items-center gap-4 relative">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all focus:outline-none"
              >
                <img
                  src={user.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="text-sm font-medium text-slate-200 pr-1">{user.name.split(' ')[0]}</span>
              </button>

              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-48 py-1.5 glass-panel bg-darkSurface border border-white/10 shadow-2xl z-20 animate-fade-in-up">
                    <Link
                      to="/settings"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-4 animate-fade-in-up">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.path) 
                    ? 'bg-white/5 text-brandIndigo font-semibold' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <div className="border-t border-white/5 pt-4 mt-2 flex flex-col gap-2">
              <div className="flex items-center gap-2.5 px-3 mb-2">
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-9 h-9 rounded-lg object-cover"
                />
                <div>
                  <h4 className="text-sm font-semibold text-white">{user.name}</h4>
                  <span className="text-xs text-slate-400 capitalize">{user.role}</span>
                </div>
              </div>
              
              <Link
                to="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-white/5 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                <Button variant="ghost" className="w-full" size="md">Log In</Button>
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full">
                <Button variant="primary" className="w-full" size="md">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
