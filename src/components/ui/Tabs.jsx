import React from 'react';

export const Tabs = ({
  tabs = [], // [{ id: 'tab1', label: 'Tab 1', icon: Icon }]
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex border-b border-white/5 gap-2 overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              isActive 
                ? 'border-brandIndigo text-brandIndigo font-semibold bg-white/5 rounded-t-xl' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-white/10'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
