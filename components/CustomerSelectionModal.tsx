import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import { XMarkIcon, UserCircleIcon, MagnifyingGlassIcon, PlusCircleIcon, CurrencyEuroIcon, KeyboardIcon } from './icons';
import { formatCurrency } from '../utils/helpers';
import VirtualKeyboard from './VirtualKeyboard';

interface CustomerSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    customers: Customer[];
    onSelectCustomer: (customerId: string | null) => void;
    onAddNewCustomer: () => void;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({ isOpen, onClose, customers, onSelectCustomer, onAddNewCustomer }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [customers, searchTerm]);

    if (!isOpen) return null;

    const handleClose = () => {
        setKeyboardVisible(false);
        setSearchTerm('');
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className={`bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col transition-transform duration-300 ease-in-out ${isKeyboardVisible ? '-translate-y-[20vh]' : ''}`}>
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Seleccionar Cliente</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                </div>

                <div className="p-4">
                     <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Toca para buscar por nombre..."
                            value={searchTerm}
                            onFocus={() => setKeyboardVisible(true)}
                            readOnly
                            className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {filteredCustomers.map(customer => (
                        <button key={customer.id} onClick={() => onSelectCustomer(customer.id)} className="w-full flex items-center text-left p-4 bg-gray-900 rounded-lg mb-2 hover:bg-indigo-600 transition-colors">
                            <UserCircleIcon className="h-10 w-10 text-gray-400 mr-4"/>
                            <div>
                                <p className="font-bold text-lg">{customer.name}</p>
                            </div>
                            <div className={`ml-auto flex items-center ${customer.creditBalance > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                <CurrencyEuroIcon className="h-5 w-5 mr-1"/>
                                <span className="font-bold">{formatCurrency(customer.creditBalance)}</span>
                            </div>
                        </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                        <p className="text-center text-gray-500 mt-8">No se encontraron clientes.</p>
                    )}
                </div>
                 <div className="p-4 border-t border-gray-700 flex justify-between gap-4">
                    {isKeyboardVisible ? (
                         <button onClick={() => setKeyboardVisible(false)} className="w-full py-3 bg-yellow-600 rounded-lg font-semibold hover:bg-yellow-700 flex items-center justify-center">
                            <KeyboardIcon className="h-6 w-6 mr-2"/>
                            Ocultar Teclado
                        </button>
                    ) : (
                        <>
                            <button onClick={() => onSelectCustomer(null)} className="w-full py-3 bg-red-600 rounded-lg font-semibold hover:bg-red-700">Quitar Cliente</button>
                            <button onClick={onAddNewCustomer} className="w-full py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center">
                                <PlusCircleIcon className="h-6 w-6 mr-2"/>
                                Nuevo Cliente
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isKeyboardVisible && (
                <div className="fixed bottom-0 left-0 right-0 z-[80]">
                    <VirtualKeyboard
                        onKeyPress={(key) => setSearchTerm(prev => prev + key)}
                        onBackspace={() => setSearchTerm(prev => prev.slice(0, -1))}
                    />
                </div>
            )}
        </div>
    );
};

export default CustomerSelectionModal;