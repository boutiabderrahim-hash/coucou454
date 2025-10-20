import React, { useState, useEffect } from 'react';
// Fix: Import the missing 'InventoryItem' type.
import { MenuItem, Category, InventoryItem } from '../../types';
import { XMarkIcon } from '../icons';

interface MenuItemFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: MenuItem) => void;
    item: MenuItem | null;
    categories: Category[];
    inventory: InventoryItem[]; // Keep inventory prop for now, might be needed later
}

const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({ isOpen, onClose, onSave, item, categories, inventory }) => {
    const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
        name: '',
        price: 0,
        categoryId: categories[0]?.id || '',
        imageUrl: '',
        isStockTracked: false,
    });

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({
                name: '',
                price: 0,
                categoryId: categories[0]?.id || '',
                imageUrl: '',
                isStockTracked: false,
            });
        }
    }, [item, isOpen, categories]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let finalValue: string | number | undefined = value;

        if (name === 'price') {
            finalValue = parseFloat(value) || 0;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: item?.id || '' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">{item ? 'Editar' : 'Añadir'} Artículo al Menú</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre del Artículo</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                        </div>
                        <div className="flex gap-4">
                             <div className="flex-1">
                                <label htmlFor="price" className="block text-sm font-medium text-gray-300">Precio (€)</label>
                                <input type="number" step="0.01" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300">Categoría</label>
                                <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3">
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">URL de la Imagen (Opcional)</label>
                            <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-900 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700">Cancelar</button>
                        <button type="submit" className="py-2 px-4 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuItemFormModal;