import React from 'react';
import { Item, Location } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, YAxis, CartesianGrid } from 'recharts';
import { Package, Home, Layers, AlertCircle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  items: Item[];
  locations: Location[];
}

const Dashboard: React.FC<DashboardProps> = ({ items, locations }) => {
  // Calculate stats
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  // Data for charts
  const itemsPerCategory = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(itemsPerCategory).map(key => ({
    name: key,
    value: itemsPerCategory[key]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const itemsPerLocation = locations.map(loc => ({
    name: loc.name,
    count: items.filter(i => i.locationId === loc.id).length
  }));

  // Warmer, softer pastel palette
  const COLORS = ['#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa'];

  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }: { title: string, value: number | string, icon: any, colorClass: string, bgClass: string }) => (
    <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 flex items-center justify-between group">
      <div className="flex flex-col justify-between h-full space-y-1">
        <div className="flex items-center space-x-2">
             <div className={`w-2 h-2 rounded-full ${colorClass.replace('text-', 'bg-')} opacity-50`}></div>
            <p className="text-sm font-medium text-stone-500 tracking-wide">{title}</p>
        </div>
        <h3 className="text-4xl font-bold text-stone-800 tracking-tight pl-4">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-2xl ${bgClass} ${colorClass} flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300`}>
        <Icon size={28} strokeWidth={2} />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">数据概览</h1>
        <div className="text-sm text-stone-500 bg-white px-4 py-1.5 rounded-full border border-stone-200 shadow-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          状态：数据已实时同步
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="物品总数" 
          value={totalItems} 
          icon={Package} 
          bgClass="bg-violet-50" 
          colorClass="text-violet-600" 
        />
        <StatCard 
          title="空间数量" 
          value={locations.length} 
          icon={Home} 
          bgClass="bg-rose-50" 
          colorClass="text-rose-500" 
        />
        <StatCard 
          title="分类统计" 
          value={Object.keys(itemsPerCategory).length} 
          icon={Layers} 
          bgClass="bg-amber-50" 
          colorClass="text-amber-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-stone-800">物品分类占比</h3>
              <p className="text-sm text-stone-400 mt-1">了解您的收纳构成</p>
            </div>
            <div className="p-2 bg-stone-50 rounded-xl">
              <AlertCircle size={20} className="text-stone-400" />
            </div>
          </div>
          <div className="flex-1 min-h-[300px] relative">
             {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={85}
                      outerRadius={120}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={8}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '16px', 
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px'
                      }} 
                      itemStyle={{ color: '#44403c', fontWeight: 600, fontSize: '14px' }}
                      formatter={(value: number) => [`${value} 件`, '数量']}
                    />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                 <Package size={48} className="mb-3 opacity-20" />
                 <p className="font-medium">暂无数据</p>
               </div>
             )}
             
             {/* Center Text Overlay for Donut Chart */}
             {categoryData.length > 0 && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-center transform -translate-y-2">
                   <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">最多的分类</p>
                   <p className="text-xl font-bold text-stone-800 max-w-[120px] truncate mx-auto">{categoryData[0]?.name}</p>
                 </div>
               </div>
             )}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-sm p-2.5 rounded-xl hover:bg-stone-50 transition-colors cursor-default">
                <div className="flex items-center space-x-3">
                   <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                   <span className="text-stone-600 font-medium truncate max-w-[100px]">{entry.name}</span>
                </div>
                <span className="text-stone-800 font-bold bg-white px-2 py-0.5 rounded-md shadow-sm text-xs border border-stone-100">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <div>
               <h3 className="text-lg font-bold text-stone-800">空间物品分布</h3>
               <p className="text-sm text-stone-400 mt-1">各区域收纳情况概览</p>
             </div>
             <div className="p-2 bg-stone-50 rounded-xl">
               <TrendingUp size={20} className="text-stone-400" />
             </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={itemsPerLocation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#78716c'}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#78716c'}} 
                />
                <Tooltip 
                  cursor={{fill: '#fafaf9', radius: 8}}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '16px', 
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px'
                  }}
                  labelStyle={{ color: '#78716c', marginBottom: '4px', fontSize: '12px' }}
                  itemStyle={{ color: '#44403c', fontWeight: 600 }}
                  formatter={(value: number) => [`${value} 件`, '数量']}
                />
                <Bar 
                  dataKey="count" 
                  fill="#a78bfa" 
                  radius={[8, 8, 8, 8]} 
                  barSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;