
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Info } from 'lucide-react';

const GHANA_LOCATIONS = [
  "Accra Central", "Sapieman", "East Legon", "West Legon", "Osu", "Madina", 
  "Tema Community 1", "Tema Community 25", "Kumasi", "Abokobi", "Amasaman", 
  "Spintex Road", "Dansoman", "Cantonments", "Labone", "Ridge", "Airport Residential",
  "Dzorwulu", "Abelemkpe", "Kaneshie", "Achimota", "Lapaz", "Haatso", "Adenta",
  "Teshie", "Nungua", "Sakumono", "Lashibi", "Ashongman", "Kwabenya", "Pokuase",
  "Takoradi", "Tamale", "Cape Coast", "Koforidua", "Ho", "Sunyani", "Wa", "Bolgatanga"
];

interface LocationSearchProps { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string; 
  minimal?: boolean;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ value, onChange, placeholder, minimal }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    if (value !== query && !isOpen) {
      setQuery(value); 
    }
  }, [value, isOpen]);

  useEffect(() => {
    if (query && query.length >= 1 && isOpen) {
      const filtered = GHANA_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) { 
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (loc: string) => {
    setQuery(loc);
    onChange(loc);
    setIsOpen(false);
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    onChange(val); // This ensures any location typed works, even if not in the suggestions list
  };

  const showCustomHint = query && !GHANA_LOCATIONS.some(l => l.toLowerCase() === query.toLowerCase()) && isOpen;

  if (minimal) {
    return (
      <div className="relative w-full" ref={wrapperRef}>
        <div className="flex items-center gap-3 pb-2 border-b border-stone-100 group-focus-within:border-stone-900 transition-all">
          <MapPin className="text-stone-300 group-focus-within:text-stone-900 transition-colors" size={18} />
          <input 
            type="text" 
            value={query} 
            onChange={e => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-transparent outline-none text-sm font-bold text-stone-900 placeholder:text-stone-200"
            placeholder={placeholder || "Anywhere in Ghana (e.g. Sapieman)..."}
          />
        </div>
        {isOpen && (suggestions.length > 0 || showCustomHint) && (
          <div className="absolute z-[150] w-full mt-2 bg-white border border-stone-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {suggestions.map((loc, idx) => (
              <button 
                key={idx} 
                type="button" 
                onClick={() => handleSelect(loc)} 
                className="w-full text-left px-4 py-3 text-xs hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 font-bold text-stone-600 hover:text-stone-900 flex items-center gap-2"
              >
                <MapPin size={12} className="text-stone-300" />
                {loc}
              </button>
            ))}
            {showCustomHint && suggestions.length === 0 && (
              <div className="px-4 py-3 text-[10px] text-stone-400 font-bold uppercase tracking-widest bg-stone-50/50 italic flex items-center gap-2">
                <Info size={12} />
                Using custom location
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group w-full" ref={wrapperRef}>
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors" size={20} />
      <input 
        type="text" 
        value={query} 
        onChange={e => handleInputChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all text-sm font-bold text-black"
        placeholder={placeholder || "Enter any location in Ghana..."}
      />
      {isOpen && (suggestions.length > 0 || showCustomHint) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-stone-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {suggestions.map((loc, idx) => (
            <button 
              key={idx} 
              type="button" 
              onClick={() => handleSelect(loc)} 
              className="w-full text-left px-5 py-3.5 text-sm hover:bg-stone-50 flex items-center gap-3 transition-colors group/item border-b border-stone-50 last:border-0"
            >
              <MapPin size={16} className="text-stone-300 group-hover/item:text-orange-500 transition-colors" />
              <span className="font-semibold text-stone-600 group-hover/item:text-stone-900">{loc}</span>
            </button>
          ))}
          {showCustomHint && suggestions.length === 0 && (
            <div className="px-5 py-4 text-[10px] text-stone-400 font-bold uppercase tracking-widest bg-stone-50/50 italic flex items-center gap-2">
              <Info size={14} className="text-orange-500" />
              Using your specific location entry
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
