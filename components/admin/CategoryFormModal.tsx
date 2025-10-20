import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { XMarkIcon } from '../icons';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Category) => void;
    category: Category | null;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSave, category }) => {
    const [formData, setFormData] = useState<Omit<Category, 'id'>>({ name: '', imageUrl: '' });

    useEffect(() => {
        if (category) {
            setFormData(category);
        } else {
            setFormData({ name: '', imageUrl: '' });
        }
    }, [category, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: category?.id || '' });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">{category ? 'Editar' : 'Añadir'} Categoría</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre de la Categoría</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                        </div>
                        <div>
                            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">URL de la Imagen (Opcional)</label>
                            <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl || ''} onChange={handleChange}
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
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

export default CategoryFormModal;
