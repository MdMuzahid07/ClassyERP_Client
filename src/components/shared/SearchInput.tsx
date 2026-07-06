import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: initialValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 400,
}) => {
  const [value, setValue] = useState(initialValue);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const timerRef = useRef<number | null>(null);

  if (initialValue !== prevInitialValue) {
    setValue(initialValue);
    setPrevInitialValue(initialValue);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      onChangeRef.current(value);
    }, debounceMs);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [value, debounceMs]);

  const triggerInstantSearch = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    onChangeRef.current(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerInstantSearch();
  };

  return (
    <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center gap-2">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="block w-full h-9 rounded-lg border border-slate-300 pl-10 pr-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors bg-white text-slate-900"
          placeholder={placeholder}
        />
      </div>
      <button
        type="submit"
        className="h-9 px-4.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
      >
        Search
      </button>
    </form>
  );
};
export default SearchInput;
