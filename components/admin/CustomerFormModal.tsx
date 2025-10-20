import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { XMarkIcon } from '../icons';
import VirtualKeyboard from '../VirtualKeyboard';

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Omit<Customer, 'id' | 'creditBalance'>) => void;
    customer: Customer | null;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSave, customer }) => {
    const [formData, setFormData] = useState({ name: '' });
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({ name: customer.name });
        } else {
            setFormData({ name: '' });
        }
        setKeyboardVisible(false);
    }, [customer, isOpen]);

    if (!isOpen) return null;

    const handleInputFocus = () => {
        setKeyboardVisible(true);
    };

    const handleKeyPress = (key: string) => {
        setFormData(prev => ({ ...prev, name: prev.name + key }));
    };

    const handleBackspace = () => {
        setFormData(prev => ({ ...prev, name: prev.name.slice(0, -1) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert("El nombre del cliente no puede estar vacío.");
            return;
        }
        onSave(formData);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[70] p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0">
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">{customer ? 'Editar' : 'Añadir'} Cliente</h2>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre del Cliente</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onFocus={handleInputFocus}
                                    className={`mt-1 block w-full bg-gray-700 border-2 rounded-md py-2 px-3 text-lg ${isKeyboardVisible ? 'border-indigo-500' : 'border-gray-600'}`}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-900 rounded-b-2xl flex justify-between items-center">
                            <button type="button" onClick={() => setKeyboardVisible(!isKeyboardVisible)} className="py-2 px-4 bg-yellow-600 rounded-lg font-semibold hover:bg-yellow-700">
                                {isKeyboardVisible ? 'Ocultar' : 'Mostrar'} Teclado
                            </button>
                            <div className="flex gap-3">
                                <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700">Cancelar</button>
                                <button type="submit" className="py-2 px-4 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700">Guardar</button>
                            </div>
                        </div>
                    </form>
                </div>

                {isKeyboardVisible && (
                    <div className="p-2 sm:p-3 mt-auto">
                         <VirtualKeyboard
                            onKeyPress={handleKeyPress}
                            onBackspace={handleBackspace}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerFormModal;