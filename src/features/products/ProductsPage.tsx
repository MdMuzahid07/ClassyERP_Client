import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { hasPermission } from '../../lib/permissions';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  productsApi,
} from '../../redux/features/products/productsApi';
import { getSocket } from '../../lib/socket';
import { PageHeader } from '../../components/shared/PageHeader';
import { SearchInput } from '../../components/shared/SearchInput';
import { Pagination } from '../../components/shared/Pagination';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { ProductFormDialog } from './ProductFormDialog';
import { formatCurrency } from '../../lib/utils';
import { Plus, Edit2, Trash2, Package, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { type Product } from '../../types/product';
import { ProductsSkeleton } from '../../skeleton/ProductsSkeleton';

export const ProductsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;

  const canCreate = role ? hasPermission(role, 'product:create') : false;
  const canUpdate = role ? hasPermission(role, 'product:update') : false;
  const canDelete = role ? hasPermission(role, 'product:delete') : false;
  const hasActions = canUpdate || canDelete;

  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  const dispatch = useAppDispatch();
  const { data, isLoading, error, refetch } = useGetProductsQuery({ search, page, limit });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStockUpdated = (payload: { productId: string; stockQuantity: number }) => {
      dispatch(
        productsApi.util.updateQueryData('getProducts', { search, page, limit }, (draft) => {
          const product = draft.products.find((p) => p._id === payload.productId);
          if (product) {
            product.stockQuantity = payload.stockQuantity;
          }
        })
      );
    };

    socket.on('stockUpdated', handleStockUpdated);

    return () => {
      socket.off('stockUpdated', handleStockUpdated);
    };
  }, [dispatch, search, page, limit]);

  // Dialog States
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const handleDeletePrompt = (product: Product) => {
    setProductToDelete(product);
    setDeleteProductOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete._id).unwrap();
      toast.success('Product deleted successfully');
      setDeleteProductOpen(false);
      setProductToDelete(null);
    } catch (err: unknown) {
      const errorMsg =
        (err as { data?: { message?: string } })?.data?.message ?? 'Failed to delete product';
      toast.error(errorMsg);
    }
  };

  const getProductImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
      return imagePath;
    }
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    const apiHost = apiUrl ? apiUrl.replace('/api/v1', '') : 'http://localhost:5000';
    return `${apiHost}/${imagePath}`;
  };

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-red-100 dark:border-red-950/30 rounded-xl text-center space-y-4 shadow-xs text-foreground">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">Failed to Load Products</h3>
          <p className="text-xs text-muted-foreground">
            There was a problem communicating with the server.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const { products = [], meta } = data ?? {
    products: [],
    meta: { page: 1, limit, total: 0, totalPage: 1 },
  };

  return (
    <div className="space-y-6 animate-page-entrance text-foreground">
      <PageHeader
        title="Products Inventory"
        description="Search, view, update, and manage product inventory stocks and prices."
      >
        {canCreate && (
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 shadow-xs focus:outline-none transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        )}
      </PageHeader>

      {/* Filters & Actions Panel */}
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search products by Name or SKU..."
        />
      </div>

      {products.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop/Tablet Table View */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-4 w-20">Image</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Purchase Price</th>
                    <th className="px-6 py-4">Selling Price</th>
                    <th className="px-6 py-4">Stock</th>
                    {hasActions && <th className="px-6 py-4 text-right w-28">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-sm text-foreground">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <img
                          src={getProductImageUrl(product.image)}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover border border-border bg-muted"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{product.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4">{product.category}</td>
                      <td className="px-6 py-4">{formatCurrency(product.purchasePrice)}</td>
                      <td className="px-6 py-4">{formatCurrency(product.sellingPrice)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge quantity={product.stockQuantity} />
                      </td>
                      {hasActions && (
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {canUpdate && (
                              <button
                                type="button"
                                onClick={() => handleEdit(product)}
                                className="p-1 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-muted rounded"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDeletePrompt(product)}
                                className="p-1 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-muted rounded"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              limit={limit}
              total={meta?.total ?? 0}
              totalPage={meta?.totalPage ?? 1}
              onPageChange={setPage}
            />
          </div>

          {/* Mobile Stacked Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs text-foreground"
                >
                  <div className="flex gap-4">
                    <img
                      src={getProductImageUrl(product.image)}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover border border-border bg-muted flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground text-base">{product.name}</h4>
                      <p className="text-xs font-mono text-muted-foreground">SKU: {product.sku}</p>
                      <p className="text-xs text-muted-foreground">Category: {product.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-border text-xs">
                    <div>
                      <span className="text-muted-foreground block">Buy Price</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(product.purchasePrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Sell Price</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Status</span>
                      <span className="block mt-0.5">
                        <StatusBadge quantity={product.stockQuantity} />
                      </span>
                    </div>
                  </div>

                  {hasActions && (
                    <div className="flex justify-end gap-3 pt-1">
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-border rounded-lg text-foreground hover:bg-muted"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeletePrompt(product)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-red-200 dark:border-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <Pagination
                page={page}
                limit={limit}
                total={meta?.total ?? 0}
                totalPage={meta?.totalPage ?? 1}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl p-8 border border-border text-center shadow-xs text-foreground">
          <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold text-foreground">No products found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or add new items to the inventory.
          </p>
        </div>
      )}

      {/* Forms & Prompts */}
      <ProductFormDialog
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        product={selectedProduct}
      />

      <ConfirmDialog
        isOpen={deleteProductOpen}
        onClose={() => setDeleteProductOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product?"
        description="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
};
export default ProductsPage;
