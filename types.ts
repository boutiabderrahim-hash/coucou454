// Fix: Re-add kitchenTicket settings to prevent compilation errors
export interface RestaurantSettings {
    name: string;
    address: string;
    phone: string;
    logoUrl?: string;
    footer?: string;
    kitchenTicket: {
        title: string;
        showWaiter: boolean;
        showTable: boolean;
        showTime: boolean;
        footer: string;
    };
}


export type Role = 'WAITER' | 'MANAGER' | 'ADMIN';

export interface Waiter {
  id: string;
  name: string;
  pin: string;
  role: Role;
}

export interface Category {
  id: string;
  name:string;
  imageUrl?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isStockTracked: boolean;
}

export interface Addition {
    addedAt: number;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  additions: Addition[];
}

export interface Discount {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
}

export interface Payment {
    method: 'cash' | 'card' | 'credit';
    amount: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  status: 'open' | 'closed' | 'cancelled';
  createdAt: number;
  closedAt?: number;
  subtotal: number;
  tax: number;
  total: number;
  customerId?: string;
  totalPaid?: number;
  splitPayments?: Payment[];
  discount?: Discount;
  lastPrintedItems?: OrderItem[];
}

export interface Customer {
    id: string;
    name: string;
    creditBalance: number;
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: 'units' | 'kg' | 'liters';
    lowStockThreshold: number;
}

export type TableShape = 'square' | 'rectangle' | 'circle' | 'fixture';

export interface Table {
    id: number;
    name: string;
    capacity: number;
    shape: TableShape;
    x: number;
    y: number;
    width: number;
    height: number;
    area?: string;
}

export interface Area {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export interface CashMovement {
    id: string;
    timestamp: number;
    type: 'in' | 'out';
    amount: number;
    reason: string;
}

export interface Shift {
    id: string;
    waiterId: string;
    waiterName: string;
    startTime: number;
    endTime?: number;
    startingBalance: number;
    endingBalance?: number;
    cashSales: number;
    cardSales: number;
    totalSales: number;
    totalDiscounts: number;
    expectedCash: number;
    actualCash?: number;
    difference?: number;
    cashIn: CashMovement[];
    cashOut: CashMovement[];
    orders: string[]; // array of order ids
}

export type AppScreen = 'table-selection' | 'order' | 'admin' | 'manager' | 'customers';