import React from 'react';
import { Order } from '../types';
import { ExclamationTriangleIcon, XMarkIcon } from './icons';
import { formatCurrency } from '../utils/helpers';

interface OpenOrdersWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    openOrders: Order[];
}

const OpenOrdersWarningModal: React.FC<OpenOrdersWarningModalProps> = ({ isOpen, onClose, openOrders }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-900 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-white">Pedidos Pendientes de Cerrar</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-400">
                                No puedes cerrar el turno porque aún hay pedidos abiertos. Por favor, cobra o anula los siguientes pedidos antes de continuar.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 bg-gray-900 p-3 rounded-lg max-h-60 overflow-y-auto">
                    <ul className="divide-y divide-gray-700">
                        {openOrders.map(order => (
                            <li key={order.id} className="py-2 flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-bold">Mesa {order.tableNumber}</span>
                                    <span className="text-gray-400"> - {order.waiterName}</span>
                                </div>
                                <span className="font-semibold">{formatCurrency(order.total)}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpenOrdersWarningModal;
