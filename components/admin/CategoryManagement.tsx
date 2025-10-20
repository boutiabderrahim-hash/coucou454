import React, { useState } from 'react';
import { Category, MenuItem } from '../../types';
import { PencilIcon, TrashIcon, PlusCircleIcon } from '../icons';
import CategoryFormModal from './CategoryFormModal';

interface CategoryManagementProps {
    categories: Category[];
    onUpdateCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    menuItems: MenuItem[];
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, onUpdateCategories, menuItems }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleAddCategory = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDeleteCategory = (id: string) => {
        const isCategoryInUse = menuItems.some(item => item.categoryId === id);
        if (isCategoryInUse) {
            alert('No se puede eliminar la categoría porque está en uso por uno o más artículos del menú.');
            return;
        }

        if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
            onUpdateCategories(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleSaveCategory = (category: Category) => {
        if (editingCategory) {
            onUpdateCategories(prev => prev.map(c => c.id === category.id ? category : c));
        } else {
            onUpdateCategories(prev => [...prev, { ...category, id: `cat-${Date.now()}` }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestionar Categorías</h2>
                <button onClick={handleAddCategory} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Añadir Categoría
                </button>
            </div>
            <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-700 text-xs text-gray-300 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3 text-left">Nombre de la Categoría</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-800">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {category.imageUrl && <img src={category.imageUrl} alt={category.name} className="h-10 w-10 mr-4 rounded-full object-cover bg-gray-700" />}
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button onClick={() => handleEditCategory(category)} className="text-indigo-400 hover:text-indigo-300 mr-4">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(category.id)} className="text-red-500 hover:text-red-400">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <CategoryFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCategory}
                    category={editingCategory}
                />
            )}
        </div>
    );
};

export default CategoryManagement;
