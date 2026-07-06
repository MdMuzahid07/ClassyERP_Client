import React, { useState, useRef, useEffect } from 'react';
import { type Product } from '../../types/product';
import { Trash2, ChevronDown, Search, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface ProductPickerRowProps {
  index: number;
  products: Product[];
  selectedProductId: string;
  quantity: number;
  onProductChange: (id: string) => void;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
  disabledProducts: string[];
}

export const ProductPickerRow: React.FC<ProductPickerRowProps> = ({
  products,
  selectedProductId,
  quantity,
  onProductChange,
  onQuantityChange,
  onRemove,
  disabledProducts,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
  });

  const subtotal = selectedProduct ? selectedProduct.sellingPrice * quantity : 0;
  const isOutOfStock = selectedProduct ? quantity > selectedProduct.stockQuantity : false;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start border border-border bg-muted/20 p-4 rounded-xl relative group">
      {/* Product Selector */}
      <div className="sm:col-span-5 relative" ref={dropdownRef}>
        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
          Product
        </label>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-left text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
        >
          {selectedProduct ? (
            <span className="truncate">
              {selectedProduct.name}{' '}
              <span className="text-muted-foreground font-mono text-xs">
                ({selectedProduct.sku})
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select a product...</span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 mt-1 z-30 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-lg p-1.5 space-y-1">
            <div className="relative mb-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-border bg-muted text-foreground placeholder-muted-foreground rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-0.5">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const isSelected = p._id === selectedProductId;
                  const isAlreadyPicked = disabledProducts.includes(p._id) && !isSelected;

                  return (
                    <button
                      key={p._id}
                      type="button"
                      disabled={isAlreadyPicked}
                      onClick={() => {
                        onProductChange(p._id);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white font-medium'
                          : isAlreadyPicked
                            ? 'opacity-40 cursor-not-allowed bg-muted/30 text-muted-foreground'
                            : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="block font-medium truncate">{p.name}</span>
                        <span
                          className={`block font-mono text-[10px] ${isSelected ? 'text-blue-100' : 'text-muted-foreground'}`}
                        >
                          SKU: {p.sku} • {formatCurrency(p.sellingPrice)}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold whitespace-nowrap px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : p.stockQuantity <= 0
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {p.stockQuantity} in stock
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground text-xs py-3">
                  No products match search
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quantity Selector Widget */}
      <div className="sm:col-span-3">
        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
          Quantity
        </label>
        <div className="flex h-9 rounded-lg border border-border bg-card overflow-hidden w-full max-w-[130px] sm:max-w-none">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="flex items-center justify-center w-9 h-full border-r border-border hover:bg-muted text-muted-foreground hover:text-foreground active:bg-muted/80 transition-colors cursor-pointer flex-shrink-0"
            title="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full text-center text-sm font-semibold bg-transparent text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="flex items-center justify-center w-9 h-full border-l border-border hover:bg-muted text-muted-foreground hover:text-foreground active:bg-muted/80 transition-colors cursor-pointer flex-shrink-0"
            title="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="sm:col-span-3">
        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
          Subtotal
        </label>
        <div className="h-9 flex items-center px-3 text-sm font-semibold text-foreground bg-muted rounded-lg border border-border/50">
          {formatCurrency(subtotal)}
        </div>
      </div>

      {/* Remove Button */}
      <div className="sm:col-span-1 pt-6 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          title="Remove item"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Soft Stock Check Alert */}
      {isOutOfStock && selectedProduct && (
        <div className="col-span-12 mt-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-800 dark:text-amber-400">
          Only {selectedProduct.stockQuantity} in stock. Non-blocking; the real stock level is
          checked atomically upon submission.
        </div>
      )}
    </div>
  );
};
export default ProductPickerRow;
