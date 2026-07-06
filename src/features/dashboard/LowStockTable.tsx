import React, { useState } from 'react';
import { type LowStockProduct } from '../../types/dashboard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { formatCurrency } from '../../lib/utils';
import { useAppSelector } from '../../app/hooks';
import { useUpdateProductMutation } from '../../redux/features/products/productsApi';
import { toast } from 'sonner';
import { Loader2, ArrowUpRight } from 'lucide-react';

interface LowStockTableProps {
  products: LowStockProduct[];
}

export const LowStockTable: React.FC<LowStockTableProps> = ({ products }) => {
  const user = useAppSelector((state) => state.auth.user);
  const canUpdate = user?.role === 'Admin' || user?.role === 'Manager';
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [restockProduct, setRestockProduct] = useState<LowStockProduct | null>(null);
  const [addedQuantity, setAddedQuantity] = useState<number>(10);

  const handleOpenRestock = (product: LowStockProduct) => {
    setRestockProduct(product);
    setAddedQuantity(10);
  };

  const handleCloseModal = () => {
    setRestockProduct(null);
  };

  const handleRestockConfirm = async () => {
    if (!restockProduct) return;
    try {
      const formData = new FormData();
      const nextQuantity = restockProduct.stockQuantity + addedQuantity;
      formData.append('stockQuantity', String(nextQuantity));

      await updateProduct({ id: restockProduct._id, formData }).unwrap();
      toast.success(`Successfully restocked "${restockProduct.name}" to ${nextQuantity} units.`);
      handleCloseModal();
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ?? 'Failed to update stock';
      toast.error(errorMsg);
    }
  };

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
              {canUpdate && <th className="px-6 py-4 text-right">Actions</th>}
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
                {canUpdate && (
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenRestock(product)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-lg transition-colors cursor-pointer"
                    >
                      Restock
                    </button>
                  </td>
                )}
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

            {canUpdate && (
              <button
                type="button"
                onClick={() => handleOpenRestock(product)}
                className="w-full mt-2 py-2 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-lg transition-colors cursor-pointer"
              >
                Restock Product
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Restock Dialog Overlay */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={handleCloseModal}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-sm rounded-xl bg-white border border-slate-200 p-6 shadow-xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-1.5">
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
                Quick Restock
              </h3>
              <p className="text-xs text-slate-500">Increase inventory levels for this product.</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 gap-4">
                <span>Product</span>
                <span
                  className="font-semibold text-slate-800 text-right truncate max-w-[200px]"
                  title={restockProduct.name}
                >
                  {restockProduct.name}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>SKU</span>
                <span className="font-mono text-[10px] text-slate-800">{restockProduct.sku}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Current Stock</span>
                <span className="font-semibold text-slate-800">{restockProduct.stockQuantity}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Quantity to Add</label>
              <input
                type="number"
                min="1"
                value={addedQuantity || ''}
                onChange={(e) => setAddedQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="block w-full h-9 rounded-lg border border-slate-200 pl-3 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all bg-white"
              />
              {/* Presets */}
              <div className="flex gap-1.5">
                {[5, 10, 20, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAddedQuantity((prev) => prev + preset)}
                    className="px-2 py-1 text-[10px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    +{preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAddedQuantity(10)}
                  className="px-2 py-1 text-[10px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-100 rounded-md transition-colors ml-auto cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Total projection */}
            <div className="flex justify-between items-center text-xs font-semibold pt-1 border-t border-slate-100 text-slate-700">
              <span>Projected Total Stock</span>
              <span className="text-sm font-bold text-emerald-600">
                {restockProduct.stockQuantity + addedQuantity} items
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleCloseModal}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleRestockConfirm}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs focus:outline-none transition-colors cursor-pointer"
              >
                {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LowStockTable;
