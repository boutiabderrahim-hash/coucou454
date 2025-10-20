import React, { useState } from 'react';
import { Waiter } from '../../types';
import { PencilIcon, TrashIcon, PlusCircleIcon } from '../icons';
import WaiterFormModal from './WaiterFormModal';

interface WaiterManagementProps {
    waiters: Waiter[];
    onUpdateWaiters: React.Dispatch<React.SetStateAction<Waiter[]>>;
}

const WaiterManagement: React.FC<WaiterManagementProps> = ({ waiters, onUpdateWaiters }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);

    const handleAddWaiter = () => {
        setEditingWaiter(null);
        setIsModalOpen(true);
    };

    const handleEditWaiter = (waiter: Waiter) => {
        setEditingWaiter(waiter);
        setIsModalOpen(true);
    };

    const handleDeleteWaiter = (id: string) => {
        if (waiters.length <= 1) {
            alert('No se puede eliminar el último usuario.');
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            onUpdateWaiters(prev => prev.filter(w => w.id !== id));
        }
    };
    
    const handleSaveWaiter = (waiter: Waiter) => {
        if (editingWaiter) {
            onUpdateWaiters(prev => prev.map(w => w.id === waiter.id ? waiter : w));
        } else {
            onUpdateWaiters(prev => [...prev, { ...waiter, id: `waiter-${Date.now()}` }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestionar Camareros</h2>
                <button onClick={handleAddWaiter} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Añadir Camarero
                </button>
            </div>
            <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-700 text-xs text-gray-300 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3 text-left">Nombre</th>
                            <th className="px-6 py-3 text-left">Rol</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {waiters.map((waiter) => (
                            <tr key={waiter.id} className="hover:bg-gray-800">
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{waiter.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        waiter.role === 'ADMIN' ? 'bg-red-200 text-red-800' : 
                                        waiter.role === 'MANAGER' ? 'bg-yellow-200 text-yellow-800' : 
                                        'bg-green-200 text-green-800'
                                    }`}>
                                        {waiter.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button onClick={() => handleEditWaiter(waiter)} className="text-indigo-400 hover:text-indigo-300 mr-4">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDeleteWaiter(waiter.id)} className="text-red-500 hover:text-red-400">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <WaiterFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveWaiter}
                    waiter={editingWaiter}
                />
            )}
        </div>
    );
};

export default WaiterManagement;
