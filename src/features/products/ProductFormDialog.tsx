import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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

import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
  };

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/50 animate-backdrop-fade" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-xl bg-card border border-border shadow-xl flex flex-col max-h-[90vh] animate-modal-scale text-foreground">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border flex-shrink-0">
          <h3 className="text-lg font-bold text-foreground">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Image Upload Row */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-foreground">Product Image</label>
              <ImageUploadField onChange={handleImageChange} value={imageFile} />
            </div>

            {/* Product Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="block text-xs font-semibold text-foreground">
                Product Name
              </label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                className={
                  errors.name
                    ? 'border-red-200 focus-visible:ring-red-600/5 focus-visible:border-red-500'
                    : ''
                }
                placeholder="Eco-Friendly TPE Yoga Mat"
                disabled={isLoading}
              />
              {errors.name?.message && (
                <p className="text-[10px] font-semibold text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* SKU and Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SKU */}
              <div className="space-y-1">
                <label htmlFor="sku" className="block text-xs font-semibold text-foreground">
                  SKU
                </label>
                <Input
                  id="sku"
                  type="text"
                  {...register('sku')}
                  className={
                    errors.sku
                      ? 'border-red-200 focus-visible:ring-red-600/5 focus-visible:border-red-500'
                      : ''
                  }
                  placeholder="FITN-YOGA-01"
                  disabled={isLoading}
                />
                {errors.sku?.message && (
                  <p className="text-[10px] font-semibold text-red-600 mt-1">
                    {errors.sku.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label htmlFor="category" className="block text-xs font-semibold text-foreground">
                  Category
                </label>
                <Input
                  id="category"
                  type="text"
                  {...register('category')}
                  className={
                    errors.category
                      ? 'border-red-200 focus-visible:ring-red-600/5 focus-visible:border-red-500'
                      : ''
                  }
                  placeholder="Fitness"
                  disabled={isLoading}
                />
                {errors.category?.message && (
                  <p className="text-[10px] font-semibold text-red-600 mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            {/* Pricing Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Purchase Price */}
              <div className="space-y-1">
                <label
                  htmlFor="purchasePrice"
                  className="block text-xs font-semibold text-foreground"
                >
                  Purchase Price ($)
                </label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  {...register('purchasePrice')}
                  className={
                    errors.purchasePrice
                      ? 'border-red-200 focus-visible:ring-red-600/5 focus-visible:border-red-500'
                      : ''
                  }
                  placeholder="18"
                  disabled={isLoading}
                />
                {errors.purchasePrice?.message && (
                  <p className="text-[10px] font-semibold text-red-600 mt-1">
                    {errors.purchasePrice.message}
                  </p>
                )}
              </div>

              {/* Selling Price */}
              <div className="space-y-1">
                <label
                  htmlFor="sellingPrice"
                  className="block text-xs font-semibold text-foreground"
                >
                  Selling Price ($)
                </label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  {...register('sellingPrice')}
                  className={
                    errors.sellingPrice
                      ? 'border-red-200 focus-visible:ring-red-600/5 focus-visible:border-red-500'
                      : ''
                  }
                  placeholder="35"
                  disabled={isLoading}
                />
                {errors.sellingPrice?.message && (
                  <p className="text-[10px] font-semibold text-red-600 mt-1">
                    {errors.sellingPrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Initial Stock */}
            <div className="space-y-1">
              <label
                htmlFor="stockQuantity"
                className="block text-xs font-semibold text-foreground"
              >
                Initial Stock
              </label>
              <Input
                id="stockQuantity"
                type="number"
                {...register('stockQuantity')}
                className={
                  errors.stockQuantity
                    ? 'border-red-200 focus-visible:ring-red-600/5 focus-visible:border-red-500'
                    : ''
                }
                placeholder="28"
                disabled={isLoading}
              />
              {errors.stockQuantity?.message && (
                <p className="text-[10px] font-semibold text-red-600 mt-1">
                  {errors.stockQuantity.message}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border flex-shrink-0 bg-muted/30">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (!isEdit && !imageFile)}
              className="cursor-pointer"
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
export default ProductFormDialog;
