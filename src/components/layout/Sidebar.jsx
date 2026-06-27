import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar = ({
  items = [], // [{ label: 'Browse', path: '/browse', icon: Icon }]
  className = ''
}) => {
  return (
    <aside className={`w-full md:w-64 glass-panel bg-darkSurface/50 border border-white/5 p-4 flex flex-col gap-1.5 h-fit ${className}`}>
      {items.map((item) => {
        const Icon = item.icon;
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-brandIndigo/20 to-brandPurple/20 border-l-4 border-brandIndigo text-white font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};

export default Sidebar;
