import React, { useState, useEffect } from 'react';
import { Waiter, Role } from '../../types';
import { XMarkIcon } from '../icons';

interface WaiterFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (waiter: Waiter) => void;
    waiter: Waiter | null;
}

const WaiterFormModal: React.FC<WaiterFormModalProps> = ({ isOpen, onClose, onSave, waiter }) => {
    const [formData, setFormData] = useState<Omit<Waiter, 'id'>>({
        name: '',
        pin: '',
        role: 'WAITER',
    });

    useEffect(() => {
        if (waiter) {
            setFormData(waiter);
        } else {
            setFormData({ name: '', pin: '', role: 'WAITER' });
        }
    }, [waiter, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
            alert('El PIN debe tener exactamente 4 dígitos.');
            return;
        }
        onSave({ ...formData, id: waiter?.id || '' });
    };

    const roles: Role[] = ['WAITER', 'MANAGER', 'ADMIN'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">{waiter ? 'Editar' : 'Añadir'} Camarero</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                        </div>
                        <div className="flex gap-4">
                             <div className="flex-1">
                                <label htmlFor="pin" className="block text-sm font-medium text-gray-300">PIN (4 dígitos)</label>
                                <input type="password" name="pin" id="pin" value={formData.pin} onChange={handleChange} required maxLength={4}
                                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3" />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="role" className="block text-sm font-medium text-gray-300">Rol</label>
                                <select name="role" id="role" value={formData.role} onChange={handleChange}
                                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3">
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
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

export default WaiterFormModal;
