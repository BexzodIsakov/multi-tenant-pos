export interface TopProduct {
  _id: string;
  name: string;
  totalQuantity: number;
}

export interface SalesReport {
  topProducts: TopProduct[];
  totalRevenue: number;
  totalMargin: number;
}
