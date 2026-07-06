import React from 'react';
import { type LowStockProduct } from '../../types/dashboard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { formatCurrency } from '../../lib/utils';

interface LowStockTableProps {
  products: LowStockProduct[];
}

export const LowStockTable: React.FC<LowStockTableProps> = ({ products }) => {
  return (
    <div className="space-y-4">
      {/* Desktop & Tablet Table (>=768px) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Selling Price</th>
              <th className="px-6 py-4">Stock Quantity</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                <td className="px-6 py-4 font-mono text-xs">{product.sku}</td>
                <td className="px-6 py-4">{formatCurrency(product.sellingPrice)}</td>
                <td className="px-6 py-4 font-medium">{product.stockQuantity}</td>
                <td className="px-6 py-4">
                  <StatusBadge quantity={product.stockQuantity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards (<768px) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {products.map((product) => (
          <div
            key={product._id}
            className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-slate-900 text-base">{product.name}</h4>
                <p className="text-xs font-mono text-slate-500 mt-0.5">SKU: {product.sku}</p>
              </div>
              <StatusBadge quantity={product.stockQuantity} />
            </div>

            <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-500 block text-xs">Selling Price</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(product.sellingPrice)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-xs">Stock Qty</span>
                <span className="font-semibold text-slate-900">{product.stockQuantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default LowStockTable;
