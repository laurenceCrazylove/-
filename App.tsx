import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AddItemModal from './components/AddItemModal';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import { Item, Location, ViewMode } from './types';
import { Plus, Search, Package, MapPin, Tag, Menu } from 'lucide-react';

// Initial Data - Translated to Chinese
const INITIAL_LOCATIONS: Location[] = [
  { id: '1', name: '客厅', type: 'room', icon: 'sofa' },
  { id: '2', name: '主卧', type: 'room', icon: 'bed' },
  { id: '3', name: '厨房', type: 'room', icon: 'utensils' },
  { id: '4', name: '储物间', type: 'room', icon: 'warehouse' },
  { id: '5', name: '地下室储物箱 A', type: 'storage', icon: 'box' },
];

const INITIAL_ITEMS: Item[] = [
  {
    id: '101',
    name: '冬季羽绒服',
    category: '服装',
    locationId: '5',
    description: '滑雪用的厚外套',
    quantity: 3,
    tags: ['冬季', '衣物', '外套'],
    image: 'https://picsum.photos/400/400?random=1'
  },
  {
    id: '102',
    name: '破壁机',
    category: '厨房电器',
    locationId: '3',
    description: '高速搅拌机，做果汁用',
    quantity: 1,
    tags: ['厨房', '电器'],
    image: 'https://picsum.photos/400/400?random=2'
  },
  {
    id: '103',
    name: '桌游合集',
    category: '娱乐',
    locationId: '1',
    description: '大富翁，卡坦岛，拼字游戏',
    quantity: 5,
    tags: ['游戏', '家庭', '娱乐'],
    image: 'https://picsum.photos/400/400?random=3'
  }
];

function App() {
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAddItem = (newItem: Omit<Item, 'id'>) => {
    const item: Item = {
      ...newItem,
      id: Date.now().toString(),
      image: newItem.image || `https://picsum.photos/400/400?random=${Date.now()}`
    };
    setItems(prev => [item, ...prev]);
  };

  const handleAddLocation = () => {
    const name = prompt("请输入新空间名称:");
    if (name) {
      setLocations([...locations, {
        id: Date.now().toString(),
        name,
        type: 'room',
        icon: 'home'
      }]);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesLocation = selectedLocationId ? item.locationId === selectedLocationId : true;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLocation && matchesSearch;
  });

  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || '未知位置';

  return (
    <div className="flex min-h-screen bg-[#fafaf9] text-stone-800 font-sans selection:bg-violet-100 selection:text-violet-900">
      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:relative z-30 h-full`}>
        <Sidebar
          locations={locations}
          selectedLocation={selectedLocationId}
          onSelectLocation={(id) => {
            setSelectedLocationId(id);
            setIsMobileMenuOpen(false);
          }}
          currentView={currentView}
          onChangeView={(view) => {
            setCurrentView(view);
            setIsMobileMenuOpen(false);
          }}
          onAddLocation={handleAddLocation}
        />
        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-300 w-full">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/80 backdrop-blur border-b border-stone-200 p-4 flex items-center justify-between sticky top-0 z-20">
           <div className="flex items-center space-x-3">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-stone-500">
               <Menu size={24} />
             </button>
             <div className="flex items-center space-x-2 text-violet-600">
               <Package size={22} strokeWidth={2.5} />
               <span className="font-bold text-lg">智享收纳</span>
             </div>
           </div>
           <button onClick={() => setIsAddModalOpen(true)} className="bg-violet-600 text-white p-2 rounded-full shadow-lg shadow-violet-200">
             <Plus size={20} />
           </button>
        </header>

        {/* Desktop Top Bar (Search & Add) */}
        <div className="hidden md:flex sticky top-0 z-20 bg-[#fafaf9]/90 backdrop-blur-md p-6 items-center justify-between border-b border-transparent">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-violet-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="搜索物品、标签或分类..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none shadow-sm transition-all hover:shadow-md placeholder-stone-400"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-violet-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={18} />
            <span>记一笔</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard items={items} locations={locations} />
          )}

          {currentView === 'inventory' && (
             <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-stone-800 tracking-tight flex items-center">
                  {selectedLocationId ? getLocationName(selectedLocationId) : '所有物品'}
                </h1>
                <span className="text-sm font-medium text-stone-500 bg-white px-4 py-1.5 rounded-full border border-stone-200 shadow-sm">
                  共 {filteredItems.length} 件
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 text-stone-400 bg-white rounded-3xl border border-stone-100 border-dashed">
                    <Package size={56} className="mb-4 opacity-20" />
                    <p className="font-medium">这里还没有东西哦</p>
                    <button onClick={() => setIsAddModalOpen(true)} className="mt-4 text-violet-600 hover:underline text-sm">
                        去添加一个？
                    </button>
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 group flex flex-col h-full">
                      <div className="relative h-52 overflow-hidden bg-stone-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-stone-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                          ×{item.quantity}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-stone-800 line-clamp-1 text-lg">{item.name}</h3>
                        </div>
                        <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg w-fit mb-3 border border-violet-100/50">
                            {item.category}
                        </span>
                        <p className="text-sm text-stone-500 mb-4 line-clamp-2 flex-1 leading-relaxed">{item.description}</p>
                        
                        <div className="flex items-center text-xs font-medium text-stone-400 mb-4 pt-3 border-t border-stone-50">
                          <MapPin size={14} className="mr-1.5 text-stone-300" />
                          {getLocationName(item.locationId)}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="flex items-center text-[11px] bg-stone-50 text-stone-500 px-2 py-1 rounded-md border border-stone-100 group-hover:border-violet-100 group-hover:text-violet-500 transition-colors">
                              <Tag size={10} className="mr-1 opacity-70" /> {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
             </div>
          )}

          {currentView === 'assistant' && (
            <AIAssistant items={items} />
          )}
        </div>
      </main>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
        locations={locations}
      />
    </div>
  );
}

export default App;