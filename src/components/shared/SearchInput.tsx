import React, { useState, useEffect } from 'react';
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

  if (initialValue !== prevInitialValue) {
    setValue(initialValue);
    setPrevInitialValue(initialValue);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(value);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, onChange, debounceMs]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="block w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors bg-white text-slate-900"
        placeholder={placeholder}
      />
    </div>
  );
};
export default SearchInput;
