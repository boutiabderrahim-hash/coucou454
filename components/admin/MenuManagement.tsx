import React, { useState } from 'react';
import { MenuItem, Category, InventoryItem } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { PencilIcon, TrashIcon, PlusCircleIcon, Bars3Icon } from '../icons';
import MenuItemFormModal from './MenuItemFormModal';

interface MenuManagementProps {
    menuItems: MenuItem[];
    categories: Category[];
    inventory: InventoryItem[];
    onUpdateMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ menuItems, categories, inventory, onUpdateMenuItems }) => {
    const [filter, setFilter] = useState('all');
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const handleAddItem = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };
    
    const handleEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteItem = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este artículo del menú?')) {
            onUpdateMenuItems(prev => prev.filter(item => item.id !== id));
        }
    };
    
    const handleSaveItem = (item: MenuItem) => {
        if (editingItem) {
            onUpdateMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
        } else {
            onUpdateMenuItems(prev => [...prev, { ...item, id: `item-${Date.now()}` }]);
        }
        setIsModalOpen(false);
    };

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Sin categoría';
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.preventDefault(); 
    };

    const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) {
            setDraggedItemId(null);
            return;
        }

        const newItems = [...menuItems];
        const draggedItemIndex = newItems.findIndex(item => item.id === draggedItemId);
        const targetItemIndex = newItems.findIndex(item => item.id === targetId);

        if (draggedItemIndex === -1 || targetItemIndex === -1) {
            setDraggedItemId(null);
            return;
        }
        
        const [draggedItem] = newItems.splice(draggedItemIndex, 1);
        newItems.splice(targetItemIndex, 0, draggedItem);
        
        onUpdateMenuItems(newItems);
        setDraggedItemId(null);
    };

    const filteredItems = filter === 'all' ? menuItems : menuItems.filter(item => item.categoryId === filter);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestionar Menú</h2>
                <button onClick={handleAddItem} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Añadir Artículo
                </button>
            </div>

            <div className="mb-4">
                <select onChange={(e) => setFilter(e.target.value)} value={filter} className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3">
                    <option value="all">Todas las Categorías</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-700 text-xs text-gray-300 uppercase font-semibold">
                        <tr>
                            <th className="px-4 py-3 text-center w-12" title="Arrastrar para reordenar"></th>
                            <th className="px-6 py-3 text-left">Artículo</th>
                            <th className="px-6 py-3 text-left">Categoría</th>
                            <th className="px-6 py-3 text-left">Precio</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredItems.map((item) => (
                            <tr 
                                key={item.id}
                                draggable={filter === 'all'}
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, item.id)}
                                className={`hover:bg-gray-800 ${filter === 'all' ? 'cursor-move' : ''} ${draggedItemId === item.id ? 'opacity-50' : ''}`}
                            >
                                <td className="px-4 py-4 text-center">
                                    {filter === 'all' && <Bars3Icon className="h-5 w-5 text-gray-500" />}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                         {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-10 w-10 mr-4 rounded-full object-cover bg-gray-700" />}
                                         <span className="font-medium">{item.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{getCategoryName(item.categoryId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.price)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button onClick={() => handleEditItem(item)} className="text-indigo-400 hover:text-indigo-300 mr-4">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-400">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filter !== 'all' && (
                    <div className="p-4 text-center text-gray-500 text-sm border-t border-gray-700">
                        La reordenación solo está disponible cuando se visualizan "Todas las Categorías".
                    </div>
                )}
            </div>
            {isModalOpen && (
                <MenuItemFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveItem}
                    item={editingItem}
                    categories={categories}
                    inventory={inventory}
                />
            )}
        </div>
    );
};

export default MenuManagement;
