import { Waiter, Category, MenuItem, InventoryItem, Table, Area, Customer, RestaurantSettings } from '../types';

export const mockWaiters: Waiter[] = [
  { id: 'waiter-1', name: 'Admin', pin: '1111', role: 'ADMIN' },
  { id: 'waiter-2', name: 'Manager', pin: '2222', role: 'MANAGER' },
  { id: 'waiter-3', name: 'Juan', pin: '1234', role: 'WAITER' },
  { id: 'waiter-4', name: 'María', pin: '4321', role: 'WAITER' },
];

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Bebidas', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2738/2738730.png' },
  { id: 'cat-2', name: 'Entrantes', imageUrl: 'https://cdn-icons-png.flaticon.com/512/3480/3480823.png' },
  { id: 'cat-3', name: 'Platos Principales', imageUrl: 'https://cdn-icons-png.flaticon.com/512/948/948045.png' },
  { id: 'cat-4', name: 'Postres', imageUrl: 'https://cdn-icons-png.flaticon.com/512/2917/2917650.png' },
];

export const mockMenuItems: MenuItem[] = [
  // Bebidas
  { id: 'item-1', name: 'Agua Mineral', price: 2.00, categoryId: 'cat-1', isStockTracked: true, imageUrl: 'https://images.unsplash.com/photo-1587889952182-308365fd9343?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  { id: 'item-2', name: 'Coca-Cola', price: 2.50, categoryId: 'cat-1', isStockTracked: true, imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32a644a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  { id: 'item-3', name: 'Cerveza', price: 3.00, categoryId: 'cat-1', isStockTracked: true, imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  // Entrantes
  { id: 'item-4', name: 'Patatas Bravas', price: 5.50, categoryId: 'cat-2', isStockTracked: false, imageUrl: 'https://images.unsplash.com/photo-1599921858584-87a718c8c57b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  { id: 'item-5', name: 'Ensalada César', price: 8.00, categoryId: 'cat-2', isStockTracked: false, imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  // Platos Principales
  { id: 'item-6', name: 'Hamburguesa Clásica', price: 12.50, categoryId: 'cat-3', isStockTracked: false, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  { id: 'item-7', name: 'Pizza Margarita', price: 10.00, categoryId: 'cat-3', isStockTracked: false, imageUrl: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
  // Postres
  { id: 'item-8', name: 'Tarta de Queso', price: 6.00, categoryId: 'cat-4', isStockTracked: true, imageUrl: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80' },
];

export const mockInventory: InventoryItem[] = [
  { id: 'item-1', name: 'Agua Mineral', quantity: 50, unit: 'units', lowStockThreshold: 10 },
  { id: 'item-2', name: 'Coca-Cola', quantity: 100, unit: 'units', lowStockThreshold: 20 },
  { id: 'item-3', name: 'Cerveza', quantity: 30, unit: 'units', lowStockThreshold: 12 },
  { id: 'item-8', name: 'Tarta de Queso', quantity: 8, unit: 'units', lowStockThreshold: 3 },
];

export const mockTables: Table[] = [
  { id: 1, name: 'M1', capacity: 4, shape: 'square', x: 50, y: 50, width: 80, height: 80, area: 'Terraza' },
  { id: 2, name: 'M2', capacity: 2, shape: 'circle', x: 150, y: 50, width: 70, height: 70, area: 'Terraza' },
  { id: 3, name: 'S1', capacity: 6, shape: 'rectangle', x: 300, y: 80, width: 120, height: 80, area: 'Salón Principal' },
  { id: 10, name: 'Barra', capacity: 1, shape: 'fixture', x: 30, y: 300, width: 250, height: 50, area: 'Salón Principal' }
];

export const mockAreas: Area[] = [
    { id: 'area-1', name: 'Terraza', x: 20, y: 20, width: 240, height: 200, color: 'rgba(74, 222, 128, 0.1)' },
    { id: 'area-2', name: 'Salón Principal', x: 280, y: 20, width: 300, height: 400, color: 'rgba(59, 130, 246, 0.1)' },
];

export const mockCustomers: Customer[] = [
    { id: 'cust-1', name: 'Cliente de Paso', creditBalance: 0 },
    { id: 'cust-2', name: 'Juan Pérez', creditBalance: 15.50 },
    { id: 'cust-3', name: 'Empresa ACME', creditBalance: 120.75 },
];

export const mockSettings: RestaurantSettings = {
    name: "El Buen Sabor",
    address: "Calle Falsa 123, Ciudad",
    phone: "912 345 678",
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
    footer: "¡Gracias por su visita!",
    kitchenTicket: {
        title: "--- COMANDA COCINA ---",
        showWaiter: true,
        showTable: true,
        showTime: true,
        footer: "--- Fin Comanda ---"
    }
}