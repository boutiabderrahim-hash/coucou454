import React, { useState, useEffect, useMemo } from 'react';
import { Order, Payment, Customer } from '../types';
import { formatCurrency } from '../utils/helpers';
import { XMarkIcon, CurrencyEuroIcon, CreditCardIcon, UserCircleIcon, PlusIcon, TrashIcon, TicketIcon } from './icons';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    customers: Customer[];
    onFinalizePayment: (order: Order, payments: Payment[]) => void;
    onPartialPayment: (order: Order, payments: Payment[]) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, order, customers, onFinalizePayment, onPartialPayment }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [currentPayment, setCurrentPayment] = useState<{method: 'cash' | 'card', amount: string}>({ method: 'cash', amount: '' });
    
    const customer = useMemo(() => customers.find(c => c.id === order.customerId), [customers, order.customerId]);

    const totalPaidInModal = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
    const initialDue = useMemo(() => order.total - (order.totalPaid || 0), [order]);
    
    const amountStillDue = useMemo(() => Math.max(0, initialDue - totalPaidInModal), [initialDue, totalPaidInModal]);
    const change = useMemo(() => Math.max(0, totalPaidInModal - initialDue), [initialDue, totalPaidInModal]);

    useEffect(() => {
        if (isOpen) {
            const due = order.total - (order.totalPaid || 0);
            setCurrentPayment({ method: 'cash', amount: due > 0 ? due.toFixed(2) : '' });
        } else {
            setPayments([]);
            setCurrentPayment({ method: 'cash', amount: '' });
        }
    }, [isOpen, order]);

    if (!isOpen) return null;

    const handleAddPayment = () => {
        const amount = parseFloat(currentPayment.amount);
        if (isNaN(amount) || amount <= 0) return;

        setPayments([...payments, { method: currentPayment.method, amount }]);
        const newAmountDue = initialDue - (totalPaidInModal + amount);
        setCurrentPayment({ method: 'cash', amount: newAmountDue > 0 ? newAmountDue.toFixed(2) : '' });
    };

    const handleRemovePayment = (index: number) => {
        const newPayments = payments.filter((_, i) => i !== index);
        setPayments(newPayments);

        const newTotalPaidInModal = newPayments.reduce((acc, p) => acc + p.amount, 0);
        const newAmountDue = initialDue - newTotalPaidInModal;
        setCurrentPayment(prev => ({...prev, amount: newAmountDue > 0 ? newAmountDue.toFixed(2) : ''}));
    };
    
    const handleNumpad = (value: string) => {
        if(value === 'del') {
            setCurrentPayment(p => ({...p, amount: p.amount.slice(0, -1)}));
        } else if (value === '.') {
            if(!currentPayment.amount.includes('.')) {
                setCurrentPayment(p => ({...p, amount: p.amount + '.'}));
            }
        } else {
            setCurrentPayment(p => ({...p, amount: p.amount + value}));
        }
    };
    
    const setQuickAmount = (fraction: number) => {
         const currentDue = initialDue - totalPaidInModal;
         if (currentDue > 0) {
            setCurrentPayment(p => ({...p, amount: (currentDue * fraction).toFixed(2)}));
         }
    };

    const handleConfirmPayment = () => {
        if (payments.length === 0) return;
        
        if (amountStillDue > 0.005) { 
            onPartialPayment(order, payments);
        } else {
            onFinalizePayment(order, payments);
        }
    };
    
    const handlePayOnCredit = () => {
        if (!customer) return;
        const creditPayment: Payment = { method: 'credit', amount: initialDue };
        onFinalizePayment(order, [creditPayment]);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white">Pago de la Mesa {order.tableNumber}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-8 w-8" /></button>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-2/5 p-6 flex flex-col border-r border-gray-700">
                        <div className="text-lg space-y-2 mb-4">
                             <div className="flex justify-between font-bold text-3xl text-green-400">
                                <span>TOTAL</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                            <div className="flex justify-between text-yellow-400">
                                <span>Pagado Anteriormente</span>
                                <span>{formatCurrency(order.totalPaid || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pagando Ahora</span>
                                <span>{formatCurrency(totalPaidInModal)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-2xl text-red-400 border-t-2 border-gray-600 pt-2 mt-2">
                                <span>PENDIENTE</span>
                                <span>{formatCurrency(amountStillDue)}</span>
                            </div>
                            {change > 0 && (
                                <div className="flex justify-between font-bold text-2xl text-cyan-400">
                                    <span>VUELTO</span>
                                    <span>{formatCurrency(change)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto mt-4 border-t border-gray-700 pt-4">
                            <h3 className="text-xl font-semibold mb-2">Pagos a Realizar</h3>
                            {payments.map((p, i) => (
                                <div key={i} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg mb-2">
                                    <div className="flex items-center">
                                        {p.method === 'cash' && <CurrencyEuroIcon className="h-6 w-6 text-green-400 mr-3" />}
                                        {p.method === 'card' && <CreditCardIcon className="h-6 w-6 text-blue-400 mr-3" />}
                                        <span className="capitalize font-semibold">{p.method === 'cash' ? 'Efectivo' : 'Tarjeta'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-bold text-lg">{formatCurrency(p.amount)}</span>
                                        <button onClick={() => handleRemovePayment(i)} className="ml-4 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                         <div className="mt-4 space-y-2">
                             <button 
                                onClick={handlePayOnCredit}
                                disabled={!customer}
                                className="w-full py-3 bg-orange-600 rounded-lg text-lg font-bold hover:bg-orange-700 disabled:bg-gray-600 disabled:text-gray-400 flex items-center justify-center gap-2">
                                <TicketIcon className="h-6 w-6"/>
                                Poner a Crédito
                            </button>
                            <button 
                                onClick={handleConfirmPayment}
                                disabled={payments.length === 0}
                                className="w-full py-4 bg-green-600 rounded-lg text-xl font-bold hover:bg-green-700 disabled:bg-gray-600">
                                {amountStillDue > 0.005 ? `Pagar ${formatCurrency(totalPaidInModal)} y Mantener Abierta` : `Confirmar Pago y Cerrar Cuenta`}
                            </button>
                         </div>
                    </div>

                    <div className="w-3/5 p-6 flex flex-col">
                         {customer && (
                             <div className="bg-indigo-900 p-3 rounded-lg mb-4 text-center">
                                 <p className="font-semibold">{customer.name} - Saldo Pendiente: <span className="font-bold text-red-300">{formatCurrency(customer.creditBalance)}</span></p>
                             </div>
                         )}
                         <div className="flex space-x-2 mb-4">
                            <button onClick={() => setCurrentPayment(p => ({...p, method: 'cash'}))} className={`flex-1 py-3 font-semibold rounded-lg ${currentPayment.method === 'cash' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Efectivo</button>
                            <button onClick={() => setCurrentPayment(p => ({...p, method: 'card'}))} className={`flex-1 py-3 font-semibold rounded-lg ${currentPayment.method === 'card' ? 'bg-indigo-600' : 'bg-gray-700'}`}>Tarjeta</button>
                         </div>
                         <div className="relative mb-4">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-400">€</span>
                            <input type="text" readOnly value={currentPayment.amount} className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg py-4 pl-14 pr-4 text-5xl text-right font-mono"/>
                         </div>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {[2, 5, 10, 20, 50].map(val => (
                                <button key={val} onClick={() => setCurrentPayment(p => ({...p, amount: val.toString()}))} className="py-3 bg-gray-700 rounded-lg font-semibold">{val}€</button>
                            ))}
                             <button onClick={() => setQuickAmount(1)} className="py-3 bg-gray-700 rounded-lg font-semibold">Total</button>
                             <button onClick={() => setQuickAmount(0.5)} className="py-3 bg-gray-700 rounded-lg font-semibold">1/2</button>
                             <button onClick={() => setQuickAmount(0.25)} className="py-3 bg-gray-700 rounded-lg font-semibold">1/4</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 flex-1">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(key => (
                                <button key={key} onClick={() => handleNumpad(key)} className="text-3xl font-bold bg-gray-700 rounded-lg hover:bg-gray-600">
                                    {key === 'del' ? '⌫' : key}
                                </button>
                            ))}
                        </div>
                         <button onClick={handleAddPayment} className="mt-4 w-full py-3 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg"><PlusIcon className="h-6 w-6 mr-2"/> Añadir Pago</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;