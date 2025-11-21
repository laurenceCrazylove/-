import React from 'react';
import { LayoutDashboard, Package, MessageCircleQuestion, Plus, Box, Home, Archive, Heart } from 'lucide-react';
import { Location, ViewMode } from '../types';

interface SidebarProps {
  locations: Location[];
  selectedLocation: string | null;
  onSelectLocation: (id: string | null) => void;
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  onAddLocation: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  locations, 
  selectedLocation, 
  onSelectLocation,
  currentView,
  onChangeView,
  onAddLocation
}) => {
  
  const getLocationIcon = (type: 'room' | 'storage') => {
    return type === 'room' ? <Home size={18} /> : <Box size={18} />;
  };

  return (
    <div className="w-64 bg-[#fffcf9] h-screen border-r border-stone-200 flex flex-col hidden md:flex fixed left-0 top-0 z-10 shadow-sm">
      <div className="p-6 flex items-center space-x-2 text-violet-600">
        <Package size={28} strokeWidth={2.5} />
        <span className="text-xl font-bold tracking-tight">智享收纳</span>
      </div>

      <div className="px-4 mb-6">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3 px-2">功能菜单</p>
        <nav className="space-y-1">
          <button
            onClick={() => onChangeView('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'dashboard' 
                ? 'bg-violet-50 text-violet-700 shadow-sm' 
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>数据概览</span>
          </button>
          <button
            onClick={() => onChangeView('inventory')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'inventory' 
                ? 'bg-violet-50 text-violet-700 shadow-sm' 
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Archive size={18} />
            <span>所有物品</span>
          </button>
          <button
            onClick={() => onChangeView('assistant')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === 'assistant' 
                ? 'bg-violet-50 text-violet-700 shadow-sm' 
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <MessageCircleQuestion size={18} />
            <span>AI 收纳顾问</span>
          </button>
        </nav>
      </div>

      <div className="px-4 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-3 px-2">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">空间管理</p>
          <button onClick={onAddLocation} className="text-stone-400 hover:text-violet-600 transition-colors bg-stone-50 p-1 rounded-md">
            <Plus size={14} />
          </button>
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => onSelectLocation(null)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedLocation === null && currentView === 'inventory'
                ? 'bg-violet-50 text-violet-700 shadow-sm' 
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Home size={18} />
            <span>全屋总览</span>
          </button>
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => {
                onSelectLocation(loc.id);
                onChangeView('inventory');
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedLocation === loc.id && currentView === 'inventory'
                  ? 'bg-violet-50 text-violet-700 shadow-sm' 
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span className={
                 selectedLocation === loc.id ? 'text-violet-600' : 'text-stone-400'
              }>
                {getLocationIcon(loc.type)}
              </span>
              <span className="truncate">{loc.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-stone-100">
        <div className="bg-gradient-to-br from-violet-100 to-fuchsia-50 rounded-xl p-4 border border-violet-100">
          <div className="flex items-center space-x-2 text-violet-800 mb-1">
            <Heart size={14} fill="currentColor" />
            <p className="text-xs font-bold">每日一贴</p>
          </div>
          <p className="text-xs text-violet-700/80 leading-relaxed">
            不知道怎么整理冬衣？试试问问 AI 收纳顾问吧！
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;