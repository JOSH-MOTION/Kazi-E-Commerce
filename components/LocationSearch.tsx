
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';

const UGANDA_LOCATIONS = [
  "Kampala Central", "Nakawa", "Makindye", "Kawempe", "Rubaga", "Entebbe", "Kira", "Nansana", "Mukono", "Jinja", "Mbarara", 
  "Gulu", "Lira", "Masaka", "Arua", "Mbale", "Fort Portal", "Kasese", "Hoima", "Busia", "Tororo", "Mityana", "Lugazi",
  "Kansanga", "Kabiru", "Muyenga", "Buziga", "Munyonyo", "Kiwatule", "Najjeera", "Kyanja", "Ntinda", "Naguru", "Kololo", "Bukoto", "Lweza", "Kajjansi", "Seguku"
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

  useEffect(() => { if (value !== query && !isOpen) setQuery(value); }, [value]);
  useEffect(() => {
    if (query && query.length > 1 && isOpen) {
      setSuggestions(UGANDA_LOCATIONS.filter(loc => loc.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
    } else setSuggestions([]);
  }, [query, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) { if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (minimal) {
    return (
      <div className="relative w-full" ref={wrapperRef}>
        <div className="flex items-center gap-3 pb-2">
          <MapPin className="text-stone-300 group-focus-within:text-stone-900 transition-colors" size={18} />
          <input 
            type="text" value={query} onChange={e => { setQuery(e.target.value); onChange(e.target.value); }}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-transparent outline-none text-sm font-bold text-stone-900 placeholder:text-stone-200"
            placeholder={placeholder || "Area..."}
          />
        </div>
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-[150] w-full mt-2 bg-white border border-stone-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {suggestions.map((loc, idx) => (
              <button key={idx} type="button" onClick={() => { setQuery(loc); onChange(loc); setIsOpen(false); }} className="w-full text-left px-4 py-3 text-xs hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 font-bold text-stone-600 hover:text-stone-900">
                {loc}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group w-full" ref={wrapperRef}>
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900 transition-colors" size={20} />
      <input 
        type="text" value={query} onChange={e => { setQuery(e.target.value); onChange(e.target.value); }}
        onFocus={() => setIsOpen(true)}
        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all text-sm font-bold text-black"
        placeholder={placeholder || "Search area..."}
      />
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-stone-100 rounded-2xl shadow-2xl overflow-hidden">
          {suggestions.map((loc, idx) => (
            <button key={idx} type="button" onClick={() => { setQuery(loc); onChange(loc); setIsOpen(false); }} className="w-full text-left px-5 py-3.5 text-sm hover:bg-stone-50 flex items-center gap-3 transition-colors group/item border-b border-stone-50 last:border-0">
              <span className="font-semibold text-stone-600 group-hover/item:text-stone-900">{loc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default LocationSearch;
