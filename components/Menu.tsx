import React, { useState } from 'react';
import { Category, MenuItem, InventoryItem } from '../types';
import { MagnifyingGlassIcon } from './icons';

interface MenuProps {
  categories: Category[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  onAddItem: (item: MenuItem) => void;
}

const Menu: React.FC<MenuProps> = ({ categories, menuItems, inventory, onAddItem }) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenuItems = menuItems.filter(item => {
    const categoryMatch = activeCategoryId === 'all' || item.categoryId === activeCategoryId;
    const searchMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const isOutOfStock = (item: MenuItem): boolean => {
    if (!item.isStockTracked) return false;
    const stockItem = inventory.find(inv => inv.id === item.id);
    return !stockItem || stockItem.quantity <= 0;
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-gray-800 min-h-0">
      {/* Search and Categories */}
      <div className="mb-4">
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${activeCategoryId === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Todos
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${activeCategoryId === category.id ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {category.imageUrl && <img src={category.imageUrl} alt={category.name} className="h-6 w-6 mr-2" />}
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Menu Items Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMenuItems.map(item => {
            const outOfStock = isOutOfStock(item);
            return (
              <button
                key={item.id}
                onClick={() => onAddItem(item)}
                disabled={outOfStock}
                className="relative bg-gray-900 rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {outOfStock && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Agotado</div>
                )}
                <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-32 object-cover" />
                <div className="p-3 text-center">
                  <p className="font-bold text-md leading-tight">{item.name}</p>
                  <p className="text-sm text-green-400 font-semibold mt-1">{item.price.toFixed(2)}€</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Menu;