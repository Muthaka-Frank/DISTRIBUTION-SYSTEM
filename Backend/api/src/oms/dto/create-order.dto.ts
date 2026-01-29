export class CreateOrderDto {
  hospitalId: string;
  items: {
    inventoryId: string;
    quantity: number;
  }[];
}
