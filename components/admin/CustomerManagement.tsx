import React, { useState } from 'react';
import { Customer, Payment } from '../../types';
import { PencilIcon, TrashIcon, PlusCircleIcon, CurrencyEuroIcon } from '../icons';
import CustomerFormModal from './CustomerFormModal';
import { formatCurrency } from '../../utils/helpers';
import CreditPaymentModal from './CreditPaymentModal';

interface CustomerManagementProps {
    customers: Customer[];
    onUpdateCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    onCreditPayment: (customerId: string, payment: Payment) => void;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, onUpdateCustomers, onCreditPayment }) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [customerToPay, setCustomerToPay] = useState<Customer | null>(null);

    const handleAddCustomer = () => {
        setEditingCustomer(null);
        setIsFormModalOpen(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsFormModalOpen(true);
    };

    const handleDeleteCustomer = (id: string) => {
        const customerToDelete = customers.find(c => c.id === id);
        if (!customerToDelete) return;

        if (customerToDelete.creditBalance > 0) {
            alert(`No se puede eliminar un cliente con saldo pendiente. La deuda actual es de ${formatCurrency(customerToDelete.creditBalance)}.`);
            return;
        }

        const isConfirmed = window.confirm(`¿Estás seguro de que quieres eliminar al cliente "${customerToDelete.name}"? Esta acción no se puede deshacer.`);
        if (isConfirmed) {
            onUpdateCustomers(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleSaveCustomer = (customerData: Omit<Customer, 'id' | 'creditBalance'>) => {
        if (editingCustomer) {
            onUpdateCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...customerData } : c));
        } else {
            onUpdateCustomers(prev => [...prev, { ...customerData, id: `cust-${Date.now()}`, creditBalance: 0 }]);
        }
        setIsFormModalOpen(false);
    };

    const handleOpenPaymentModal = (customer: Customer) => {
        setCustomerToPay(customer);
        setIsPaymentModalOpen(true);
    };

    const handleConfirmCreditPayment = (customerId: string, payment: Payment) => {
        onCreditPayment(customerId, payment);
        setIsPaymentModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestionar Clientes</h2>
                <button onClick={handleAddCustomer} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    Añadir Cliente
                </button>
            </div>
            <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-700 text-xs text-gray-300 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3 text-left">Nombre</th>
                            <th className="px-6 py-3 text-left">Saldo Pendiente</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-800">
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{customer.name}</td>
                                <td className={`px-6 py-4 whitespace-nowrap font-bold ${customer.creditBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {formatCurrency(customer.creditBalance)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-4">
                                    {customer.creditBalance > 0 && (
                                         <button onClick={() => handleOpenPaymentModal(customer)} className="text-green-400 hover:text-green-300" title="Registrar Pago">
                                            <CurrencyEuroIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                    <button onClick={() => handleEditCustomer(customer)} className="text-indigo-400 hover:text-indigo-300" title="Editar Cliente">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDeleteCustomer(customer.id)} className="text-red-500 hover:text-red-400" title="Eliminar Cliente">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isFormModalOpen && (
                <CustomerFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSave={handleSaveCustomer}
                    customer={editingCustomer}
                />
            )}
            {isPaymentModalOpen && customerToPay && (
                <CreditPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onConfirm={handleConfirmCreditPayment}
                    customer={customerToPay}
                />
            )}
        </div>
    );
};

export default CustomerManagement;