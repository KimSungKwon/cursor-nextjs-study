export type CreateOrderInput = {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export type CreateOrderResult = {
  orderId: string;
};
