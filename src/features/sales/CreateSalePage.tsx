/* eslint-disable */
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGetProductsQuery } from '../../redux/features/products/productsApi';
import { useCreateSaleMutation } from '../../redux/features/sales/salesApi';
import { useAppSelector } from '../../app/hooks';
import { hasPermission } from '../../lib/permissions';
import { useNavigate } from 'react-router';
import { PageHeader } from '../../components/shared/PageHeader';
import { ProductPickerRow } from './ProductPickerRow';
import { OrderSummaryPanel } from './OrderSummaryPanel';
import { Plus, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const saleFormSchema = z.object({
  customer: z.string().min(1, 'Customer name is required'),
  items: z
    .array(
      z.object({
        product: z.string().min(1, 'Product selection is required'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'Must add at least one item to the sale'),
});

type SaleFormValues = z.infer<typeof saleFormSchema>;

export const CreateSalePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const canReadSales = user ? hasPermission(user.role, 'sale:read') : false;

  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery({ limit: 100 });
  const products = productsData?.products ?? [];

  const [createSale, { isLoading: isSubmitting }] = useCreateSaleMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    mode: 'onChange',
    defaultValues: {
      customer: '',
      items: [{ product: '', quantity: 1 }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });

  const itemsValue = watch('items') ?? [];
  const customerValue = watch('customer') ?? '';

  const handleProductChange = (index: number, id: string) => {
    update(index, { product: id, quantity: 1 });
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const item = itemsValue[index];
    if (item) {
      update(index, { ...item, quantity: qty });
    }
  };

  const onSubmit = async (data: SaleFormValues) => {
    const saleRequest = {
      customer: data.customer,
      products: data.items,
    };

    try {
      await createSale(saleRequest).unwrap();
      toast.success('Sale transaction completed successfully!');
      reset({
        customer: '',
        items: [{ product: '', quantity: 1 }],
      });

      if (canReadSales) {
        void navigate('/sales/history');
      }
    } catch (err: unknown) {
      const errPayload = err as { data?: { message?: string } };
      const errorMsg = errPayload?.data?.message ?? 'Failed to complete sale transaction.';
      toast.error(errorMsg);
    }
  };

  const selectedProductIds = itemsValue.map((item) => item.product).filter(Boolean);

  if (isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-entrance text-foreground">
      <PageHeader
        title="Create Sale"
        description="Launch a new sale transaction and adjust catalog stock levels atomically."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-6 text-foreground">
            <div>
              <label
                htmlFor="customer"
                className="block text-sm font-semibold text-foreground mb-1.5"
              >
                Customer Name
              </label>
              <input
                id="customer"
                type="text"
                {...register('customer')}
                className={`block w-full rounded-lg border px-3.5 py-2.5 text-sm placeholder-muted-foreground bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors ${
                  errors.customer ? 'border-red-300 focus:border-red-500' : 'border-border'
                }`}
                placeholder="Enter customer name..."
              />
              {errors.customer && (
                <p className="text-xs text-red-600 mt-1">{errors.customer.message}</p>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-foreground">Order Items</h4>
                <button
                  type="button"
                  onClick={() => append({ product: '', quantity: 1 })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-dashed border-blue-200 dark:border-blue-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <ProductPickerRow
                    key={field.id}
                    index={index}
                    products={products}
                    selectedProductId={itemsValue[index]?.product || ''}
                    quantity={itemsValue[index]?.quantity || 1}
                    onProductChange={(id) => handleProductChange(index, id)}
                    onQuantityChange={(qty) => handleQuantityChange(index, qty)}
                    onRemove={() => {
                      if (fields.length > 1) {
                        remove(index);
                      } else {
                        toast.error('Must keep at least one order line item.');
                      }
                    }}
                    disabledProducts={selectedProductIds}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <OrderSummaryPanel items={itemsValue} products={products} customer={customerValue} />

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xs focus:outline-none disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Completing Transaction...
              </>
            ) : (
              <>
                Complete Sale
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CreateSalePage;
