import React, { useState, useMemo } from 'react';
import { InventoryItem, MenuItem, Role } from '../../types';
import { PlusIcon, MinusIcon, ExclamationTriangleIcon, Bars3Icon } from '../icons';
import StockAdjustmentModal from './StockAdjustmentModal';
import InitialStockModal from './InitialStockModal';

interface InventoryManagementProps {
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    menuItems: MenuItem[];
    setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    userRole: Role;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ inventory, setInventory, menuItems, setMenuItems, userRole }) => {
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [isInitialStockModalOpen, setIsInitialStockModalOpen] = useState(false);
    
    const [itemToAdjust, setItemToAdjust] = useState<InventoryItem | null>(null);
    const [itemToInitialize, setItemToInitialize] = useState<MenuItem | null>(null);
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    
    const isAdmin = userRole === 'ADMIN';

    const inventoryMap = useMemo(() => new Map(inventory.map(item => [item.id, item])), [inventory]);

    const handleOpenAdjustmentModal = (item: InventoryItem, type: 'add' | 'subtract') => {
        setItemToAdjust(item);
        setAdjustmentType(type);
        setIsAdjustmentModalOpen(true);
    };

    const handleConfirmAdjustment = (amount: number, reason: string) => {
        if (!itemToAdjust) return;
        setInventory(prev => prev.map(item => 
            item.id === itemToAdjust.id 
            ? { ...item, quantity: Math.max(0, adjustmentType === 'add' ? item.quantity + amount : item.quantity - amount) } 
            : item
        ));
        setIsAdjustmentModalOpen(false);
    };
    
    const handleToggleStockTracking = (menuItem: MenuItem) => {
        if (menuItem.isStockTracked) {
            // Deactivate
            if (window.confirm(`¿Seguro que quieres desactivar el seguimiento de stock para "${menuItem.name}"? Se eliminará del inventario.`)) {
                setMenuItems(prev => prev.map(m => m.id === menuItem.id ? { ...m, isStockTracked: false } : m));
                setInventory(prev => prev.filter(i => i.id !== menuItem.id));
            }
        } else {
            // Activate
            setItemToInitialize(menuItem);
            setIsInitialStockModalOpen(true);
        }
    };

    const handleConfirmInitialStock = (initialData: Omit<InventoryItem, 'id' | 'name'>) => {
        if (!itemToInitialize) return;
        setMenuItems(prev => prev.map(m => m.id === itemToInitialize.id ? { ...m, isStockTracked: true } : m));
        setInventory(prev => [...prev, { ...initialData, id: itemToInitialize.id, name: itemToInitialize.name }]);
        setIsInitialStockModalOpen(false);
        setItemToInitialize(null);
    };

    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
        if (!isAdmin) return;
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
        if (isAdmin) e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
        if (!isAdmin) return;
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) {
            setDraggedItemId(null);
            return;
        }
        
        const newItems = [...menuItems];
        const draggedIndex = newItems.findIndex(item => item.id === draggedItemId);
        const targetIndex = newItems.findIndex(item => item.id === targetId);
        
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        
        setMenuItems(newItems);
        setDraggedItemId(null);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Gestionar Inventario por Artículo del Menú</h2>
            <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-700 text-xs text-gray-300 uppercase font-semibold">
                        <tr>
                            <th className="px-4 py-3 w-12"></th>
                            <th className="px-6 py-3 text-left">Artículo del Menú</th>
                            <th className="px-6 py-3 text-center">Seguimiento Activo</th>
                            <th className="px-6 py-3 text-left">Cantidad en Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {menuItems.map(menuItem => {
                            const stockItem = inventoryMap.get(menuItem.id);
                            const isLowStock = stockItem ? stockItem.quantity <= stockItem.lowStockThreshold : false;
                            
                            return (
                                <tr 
                                    key={menuItem.id}
                                    draggable={isAdmin}
                                    onDragStart={(e) => handleDragStart(e, menuItem.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, menuItem.id)}
                                    className={`hover:bg-gray-800 ${isAdmin ? 'cursor-move' : ''} ${draggedItemId === menuItem.id ? 'opacity-50' : ''} ${isLowStock ? 'bg-yellow-900 bg-opacity-25' : ''}`}
                                >
                                     {isAdmin ? (
                                        <td className="px-4 py-4 text-center text-gray-500"><Bars3Icon className="h-5 w-5"/></td>
                                    ) : (
                                        <td className="px-4 py-4 w-12"></td>
                                    )}
                                    <td className="px-6 py-4 font-medium">{menuItem.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" checked={!!menuItem.isStockTracked} onChange={() => handleToggleStockTracking(menuItem)} className="sr-only peer" disabled={!isAdmin} />
                                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4">
                                        {menuItem.isStockTracked && stockItem ? (
                                            <div className="flex items-center">
                                                <span className={`text-xl font-bold ${isLowStock ? 'text-yellow-300' : ''}`}>{stockItem.quantity}</span>
                                                <span className="text-sm text-gray-400 ml-2">{stockItem.unit}</span>
                                                {isLowStock && (
                                                    <span title={`Stock bajo (umbral: ${stockItem.lowStockThreshold})`}>
                                                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 ml-2" />
                                                    </span>
                                                )}
                                                <div className="ml-4 flex gap-1">
                                                    <button onClick={() => handleOpenAdjustmentModal(stockItem, 'subtract')} className="p-1 rounded-full bg-red-800 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isAdmin}><MinusIcon className="h-4 w-4"/></button>
                                                    <button onClick={() => handleOpenAdjustmentModal(stockItem, 'add')} className="p-1 rounded-full bg-green-800 hover:bg-green-700 text-white"><PlusIcon className="h-4 w-4"/></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">No rastreado</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {isAdjustmentModalOpen && itemToAdjust && (
                <StockAdjustmentModal
                    isOpen={isAdjustmentModalOpen}
                    onClose={() => setIsAdjustmentModalOpen(false)}
                    onConfirm={handleConfirmAdjustment}
                    item={itemToAdjust}
                    type={adjustmentType}
                />
            )}
            {isInitialStockModalOpen && itemToInitialize && (
                <InitialStockModal
                    isOpen={isInitialStockModalOpen}
                    onClose={() => setIsInitialStockModalOpen(false)}
                    onConfirm={handleConfirmInitialStock}
                    menuItem={itemToInitialize}
                />
            )}
        </div>
    );
};

export default InventoryManagement;