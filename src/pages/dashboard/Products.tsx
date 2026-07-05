import React, { useState } from 'react';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../redux/features/products/productsApi';

export const Products: React.FC = () => {
  const [params] = useState({ page: 1, search: '' });
  const { data, isLoading } = useGetProductsQuery(params);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  return (
    <div>
      <h1>Products CRUD Page</h1>
    </div>
  );
};
export default Products;
