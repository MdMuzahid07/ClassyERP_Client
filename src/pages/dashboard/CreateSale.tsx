import React from 'react';
import { useCreateSaleMutation, useGetSalesQuery } from '../../redux/features/sales/salesApi';

export const CreateSale: React.FC = () => {
  const { data } = useGetSalesQuery();
  const [createSale] = useCreateSaleMutation();

  return (
    <div>
      <h1>Create Sale Page</h1>
    </div>
  );
};
export default CreateSale;
