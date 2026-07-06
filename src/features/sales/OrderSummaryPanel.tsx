import React from 'react';
import { type Product } from '../../types/product';
import { formatCurrency } from '../../lib/utils';
import { ShoppingCart } from 'lucide-react';

interface OrderSummaryPanelProps {
  items: { product: string; quantity: number }[];
  products: Product[];
  customer: string;
}

export const OrderSummaryPanel: React.FC<OrderSummaryPanelProps> = ({
  items,
  products,
  customer,
}) => {
  const selectedItemsDetails = items
    .map((item) => {
      const prod = products.find((p) => p._id === item.product);
      return {
        product: prod,
        quantity: item.quantity,
        subtotal: prod ? prod.sellingPrice * item.quantity : 0,
      };
    })
    .filter((detail) => !!detail.product);

  const grandTotal = selectedItemsDetails.reduce((sum, current) => sum + current.subtotal, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 lg:sticky lg:top-20">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <ShoppingCart className="h-5 w-5 text-blue-600" />
        <h3 className="text-base font-bold text-slate-800">Order Summary</h3>
      </div>

      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Customer
        </span>
        <p className="text-sm font-medium text-slate-800 truncate">
          {customer ? (
            customer
          ) : (
            <span className="text-slate-400 italic">No customer specified</span>
          )}
        </p>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Items List
        </span>
        {selectedItemsDetails.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto pr-1">
            {selectedItemsDetails.map((detail, index) => (
              <div
                key={`${detail.product?._id}-${index}`}
                className="flex justify-between py-2.5 text-xs"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-800 block truncate">
                    {detail.product?.name}
                  </span>
                  <span className="text-slate-400 block mt-0.5">
                    {detail.quantity} x {formatCurrency(detail.product?.sellingPrice ?? 0)}
                  </span>
                </div>
                <span className="font-bold text-slate-700 whitespace-nowrap">
                  {formatCurrency(detail.subtotal)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-xs italic py-4">No items added to sale yet.</p>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-semibold text-slate-800">Grand Total</span>
          <span className="text-xl font-extrabold text-blue-600">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
};
export default OrderSummaryPanel;
