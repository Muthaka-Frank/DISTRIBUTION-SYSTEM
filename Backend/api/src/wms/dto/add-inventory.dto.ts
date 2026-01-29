export class AddInventoryDto {
  sku: string;
  name: string;
  batchNumber: string;
  expiryDate: string; // ISO Date string
  quantity: number;
  warehouseLocation: string;
}
