import { type User } from './user';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  image: string;
  createdBy: string | User;
  createdAt?: string;
  updatedAt?: string;
}
