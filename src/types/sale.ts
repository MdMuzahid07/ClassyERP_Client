import { type Product } from './product';
import { type User } from './user';

export interface SaleItem {
  product: string | Product;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  _id: string;
  customer: string;
  items: SaleItem[];
  grandTotal: number;
  soldBy: string | User;
  createdAt: string;
  updatedAt?: string;
}
