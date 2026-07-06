export interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  sellingPrice: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  lowStockProducts: LowStockProduct[];
}
