
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';

const UGANDA_LOCATIONS = [
  "Kampala Central", "Nakawa", "Makindye", "Kawempe", "Rubaga",
  "Entebbe", "Kira", "Nansana", "Mukono", "Jinja", "Mbarara", 
  "Gulu", "Lira", "Masaka", "Arua", "Mbale", "Fort Portal",
  "Kasese", "Hoima", "Busia", "Tororo", "Mityana", "Lugazi",
  "Kansanga", "Kabiru", "Muyenga", "Buziga", "Munyonyo", "Kiwatule",
  "Najjeera", "Kyanja", "Ntinda", "Naguru", "Kololo", "Bukoto", "Lweza", "Kajjansi", "Seguku"
];

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update local query state if external value changes (e.g. pre-fill)
    if (value !== query && !isOpen) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    if (query && query.length > 1 && isOpen) {
      const filtered = UGANDA_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
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

  return (
    <div className="relative group w-full" ref={wrapperRef}>
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={20} />
      <input 
        type="text" 
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all text-sm font-semibold"
        placeholder={placeholder || "Search area..."}
      />
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-stone-100 rounded-2xl shadow-2xl shadow-stone-900/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Suggested Areas</span>
          </div>
          {suggestions.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(loc);
                onChange(loc);
                setIsOpen(false);
              }}
              className="w-full text-left px-5 py-3.5 text-sm hover:bg-stone-50 flex items-center gap-3 transition-colors group/item border-b border-stone-50 last:border-0"
            >
              <div className="w-8 h-8 rounded-xl bg-stone-100 group-hover/item:bg-white flex items-center justify-center text-stone-400 group-hover/item:text-stone-900 transition-all">
                <MapPin size={14} />
              </div>
              <span className="font-semibold text-stone-600 group-hover/item:text-stone-900">{loc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
