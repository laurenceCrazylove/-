import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Camera, Sparkles, Tag } from 'lucide-react';
import { Location, Item } from '../types';
import { analyzeItemImage } from '../services/geminiService';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<Item, 'id'>) => void;
  locations: Location[];
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAddItem, locations }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [locationId, setLocationId] = useState(locations[0]?.id || '');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImage(base64String);
      
      // Auto-trigger analysis
      setIsAnalyzing(true);
      try {
        const result = await analyzeItemImage(base64String);
        setName(result.name);
        setCategory(result.category);
        setDescription(result.description);
        setTags(result.tags);
        // Try to match suggested storage to a location name if possible, otherwise default
        const matchedLocation = locations.find(l => l.name.toLowerCase().includes(result.suggestedStorageType.toLowerCase()));
        if (matchedLocation) setLocationId(matchedLocation.id);
      } catch (error) {
        console.error("Analysis failed", error);
        // Keep silent or show toast
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem({
      name,
      category,
      locationId,
      description,
      quantity,
      image,
      tags
    });
    // Reset
    setName('');
    setCategory('');
    setDescription('');
    setImage(undefined);
    setTags([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row border border-white/50">
        
        {/* Image Section */}
        <div className="w-full md:w-1/3 bg-stone-50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-100 relative">
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-violet-600 flex items-center gap-1 shadow-sm border border-violet-100">
                <Sparkles size={12} /> AI 智能识别
            </div>
          {image ? (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm group border border-stone-200">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-medium"
              >
                更换照片
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:border-violet-400 hover:text-violet-500 transition-colors bg-white"
            >
              <Camera size={32} className="mb-2 opacity-80" />
              <span className="text-sm font-medium">上传物品照片</span>
              <span className="text-xs text-stone-400 mt-1 text-center px-4">我们会自动为您分析物品信息</span>
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
          {isAnalyzing && (
            <div className="mt-4 flex items-center space-x-2 text-violet-600 bg-violet-50 px-4 py-2 rounded-full border border-violet-100">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-medium">正在识别物品详情...</span>
            </div>
          )}
        </div>

        {/* Form Section */}
        <div className="flex-1 p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} />
          </button>
          
          <h2 className="text-2xl font-bold text-stone-800 mb-6 tracking-tight">录入新物品</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-600 mb-1.5">物品名称</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-stone-800 placeholder-stone-400"
                placeholder="例如：蓝色冬季羽绒服"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-stone-600 mb-1.5">分类</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-stone-800 placeholder-stone-400"
                  placeholder="例如：衣物"
                />
              </div>
              <div>
                 <label className="block text-sm font-semibold text-stone-600 mb-1.5">存放位置</label>
                 <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all text-stone-800 appearance-none cursor-pointer"
                 >
                   {locations.map(loc => (
                     <option key={loc.id} value={loc.id}>{loc.name}</option>
                   ))}
                 </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-600 mb-1.5">详细描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all resize-none text-stone-800 placeholder-stone-400"
                placeholder="关于这个物品的细节备注..."
              />
            </div>

            <div>
               <label className="block text-sm font-semibold text-stone-600 mb-1.5">标签 (按回车添加)</label>
               <div className="flex flex-wrap gap-2 p-2 bg-stone-50 border border-stone-200 rounded-xl focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
                 {tags.map(tag => (
                   <span key={tag} className="bg-white border border-stone-200 text-violet-600 text-xs font-medium px-2.5 py-1 rounded-lg flex items-center shadow-sm">
                     {tag}
                     <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 text-stone-400 hover:text-red-500 transition-colors"><X size={12} /></button>
                   </span>
                 ))}
                 <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 outline-none text-sm min-w-[80px] bg-transparent px-1 py-0.5 text-stone-800 placeholder-stone-400"
                  placeholder={tags.length === 0 ? "添加标签..." : ""}
                 />
               </div>
            </div>

            <div className="pt-6 flex items-center justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button 
                type="submit"
                className="px-7 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-lg shadow-violet-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                保存物品
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;