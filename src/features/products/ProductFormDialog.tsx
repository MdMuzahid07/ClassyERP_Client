import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Product } from '../../types/product';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '../../redux/features/products/productsApi';
import { ImageUploadField } from '../../components/shared/ImageUploadField';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  purchasePrice: z.coerce.number().min(0, 'Purchase price must be a non-negative number'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be a non-negative number'),
  stockQuantity: z.coerce
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock must be a non-negative number'),
  image: z.any().nullable(),
});

type ProductSchemaType = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const isEdit = !!product;
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const isLoading = isCreating || isUpdating;

  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [prevProduct, setPrevProduct] = useState<Product | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  if (isOpen !== prevIsOpen || product !== prevProduct) {
    setPrevIsOpen(isOpen);
    setPrevProduct(product);
    if (isOpen) {
      setImageFile(product ? product.image : null);
    }
  }

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductSchemaType>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          sku: product.sku,
          category: product.category,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          stockQuantity: product.stockQuantity,
          image: product.image,
        });
      } else {
        reset({
          name: '',
          sku: '',
          category: '',
          purchasePrice: 0,
          sellingPrice: 0,
          stockQuantity: 0,
          image: null,
        });
      }
    }
  }, [isOpen, product, reset]);

  const onSubmit = async (data: ProductSchemaType) => {
    if (!isEdit && !imageFile) {
      setError('image', { message: 'Product image is required' });
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('sku', data.sku);
    formData.append('category', data.category);
    formData.append('purchasePrice', String(data.purchasePrice));
    formData.append('sellingPrice', String(data.sellingPrice));
    formData.append('stockQuantity', String(data.stockQuantity));

    if (imageFile instanceof File) {
      formData.append('image', imageFile);
    }

    try {
      if (isEdit && product) {
        await updateProduct({ id: product._id, formData }).unwrap();
        toast.success('Product updated successfully!');
      } else {
        await createProduct(formData).unwrap();
        toast.success('Product created successfully!');
      }
      onClose();
    } catch (error: unknown) {
      const err = error as { status?: number; data?: { message?: string } };
      if (err?.status === 409 || err?.data?.message?.toLowerCase().includes('sku')) {
        setError('sku', { message: err?.data?.message ?? 'This SKU is already in use.' });
      } else {
        toast.error(err?.data?.message ?? 'An error occurred during submission.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-backdrop-fade"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-xl flex flex-col max-h-[90vh] animate-modal-scale">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-950">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-800"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Image Field */}
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImageUploadField
                value={imageFile}
                onChange={(file) => {
                  setImageFile(file);
                  field.onChange(file);
                }}
                error={errors.image?.message as string | undefined}
              />
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Product Name
              </label>
              <input
                id="name"
                type="text"
                disabled={isLoading}
                {...register('name')}
                className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                  errors.name
                    ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                    : 'border-slate-200'
                }`}
                placeholder="NexCore Processor X1"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            {/* SKU */}
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-slate-700 mb-1">
                SKU
              </label>
              <input
                id="sku"
                type="text"
                disabled={isLoading}
                {...register('sku')}
                className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                  errors.sku
                    ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                    : 'border-slate-200'
                }`}
                placeholder="CPU-NX-001"
              />
              {errors.sku && <p className="text-xs text-red-600 mt-1">{errors.sku.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <input
                id="category"
                type="text"
                disabled={isLoading}
                {...register('category')}
                className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                  errors.category
                    ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                    : 'border-slate-200'
                }`}
                placeholder="Hardware"
              />
              {errors.category && (
                <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Purchase Price */}
            <div>
              <label
                htmlFor="purchasePrice"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Purchase Price ($)
              </label>
              <input
                id="purchasePrice"
                type="number"
                step="0.01"
                disabled={isLoading}
                {...register('purchasePrice')}
                className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                  errors.purchasePrice
                    ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                    : 'border-slate-200'
                }`}
                placeholder="120.00"
              />
              {errors.purchasePrice && (
                <p className="text-xs text-red-600 mt-1">{errors.purchasePrice.message}</p>
              )}
            </div>

            {/* Selling Price */}
            <div>
              <label
                htmlFor="sellingPrice"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Selling Price ($)
              </label>
              <input
                id="sellingPrice"
                type="number"
                step="0.01"
                disabled={isLoading}
                {...register('sellingPrice')}
                className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                  errors.sellingPrice
                    ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                    : 'border-slate-200'
                }`}
                placeholder="199.99"
              />
              {errors.sellingPrice && (
                <p className="text-xs text-red-600 mt-1">{errors.sellingPrice.message}</p>
              )}
            </div>

            {/* Stock Quantity */}
            <div className="sm:col-span-2">
              <label
                htmlFor="stockQuantity"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Initial Stock
              </label>
              <input
                id="stockQuantity"
                type="number"
                disabled={isLoading}
                {...register('stockQuantity')}
                className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                  errors.stockQuantity
                    ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                    : 'border-slate-200'
                }`}
                placeholder="100"
              />
              {errors.stockQuantity && (
                <p className="text-xs text-red-600 mt-1">{errors.stockQuantity.message}</p>
              )}
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (!isEdit && !imageFile)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 shadow-xs focus:outline-none disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ProductFormDialog;
