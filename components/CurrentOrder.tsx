import React, { useState, useMemo } from 'react';
import { Order, OrderItem, Customer, Role } from '../types';
import { formatCurrency } from '../utils/helpers';
import { PlusIcon, MinusIcon, TrashIcon, ChevronDownIcon, UserCircleIcon, CurrencyEuroIcon, ReceiptPercentIcon } from './icons';

interface CurrentOrderProps {
  order: Order;
  customers: Customer[];
  onUpdateQuantity: (itemId: string, change: number) => void;
  onPay: () => void;
  onSave: () => void;
  onPrint: () => void;
  onCancel: () => void;
  onOpenCustomerModal: () => void;
  onOpenDiscountModal: () => void;
  waiterRole: Role;
}

const CurrentOrder: React.FC<CurrentOrderProps> = ({ order, customers, onUpdateQuantity, onPay, onSave, onPrint, onCancel, onOpenCustomerModal, onOpenDiscountModal, waiterRole }) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  
  const { items, subtotal, tax, total } = order;

  const currentCustomer = useMemo(() => {
    return customers.find(c => c.id === order.customerId);
  }, [customers, order.customerId]);

  const toggleExpand = (itemId: string) => {
    setExpandedItemId(prevId => (prevId === itemId ? null : itemId));
  };

  const canCancelOrder = waiterRole === 'ADMIN' || waiterRole === 'MANAGER';
  const isZeroOrNegativeTotal = total <= 0 && items.length > 0;

  return (
    <div className="w-full md:w-1/3 lg:w-2/5 bg-gray-900 flex flex-col p-4 shadow-lg min-h-0">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">Pedido Actual</h2>
      
      <div className="mb-4">
        {currentCustomer ? (
            <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                <div>
                    <p className="font-bold text-lg flex items-center"><UserCircleIcon className="h-5 w-5 mr-2" /> {currentCustomer.name}</p>
                    <p className={`text-sm flex items-center mt-1 ${currentCustomer.creditBalance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        <CurrencyEuroIcon className="h-4 w-4 mr-1"/> 
                        Saldo Pendiente: <span className="font-bold ml-1">{formatCurrency(currentCustomer.creditBalance)}</span>
                    </p>
                </div>
                <button onClick={onOpenCustomerModal} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md">Cambiar</button>
            </div>
        ) : (
            <button onClick={onOpenCustomerModal} className="w-full text-center py-3 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700">
                Añadir Cliente a la Cuenta
            </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        {items.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">El pedido está vacío.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="mb-2 bg-gray-800 rounded-lg overflow-hidden transition-all duration-300">
              <div className="flex items-center p-2">
                <div className="flex-1">
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-sm text-gray-400">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 rounded-full bg-gray-700 hover:bg-red-600"><MinusIcon className="h-5 w-5"/></button>
                  <span className="w-10 text-center font-bold text-xl">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 rounded-full bg-gray-700 hover:bg-green-600"><PlusIcon className="h-5 w-5"/></button>
                </div>
                <p className="w-20 text-right font-bold text-lg">{formatCurrency(item.price * item.quantity)}</p>
                <button onClick={() => onUpdateQuantity(item.id, -item.quantity)} className="ml-3 p-2 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
              </div>

              {item.additions.length > 0 && (
                <div className="px-2 pb-2">
                    <button onClick={() => toggleExpand(item.id)} className="w-full text-left text-xs text-indigo-400 hover:underline flex items-center">
                        <ChevronDownIcon className={`h-4 w-4 mr-1 transition-transform ${expandedItemId === item.id ? 'rotate-180' : ''}`} />
                        {expandedItemId === item.id ? 'Ocultar detalles' : 'Mostrar detalles de adición'}
                    </button>
                </div>
              )}

              {expandedItemId === item.id && (
                <div className="px-4 pb-3 text-sm text-gray-400 bg-gray-900 animate-fade-in-up">
                    <ul className="list-disc list-inside space-y-1 pt-2">
                        {item.additions.map((addition, index) => (
                            <li key={index}>
                                1x añadido a las {new Date(addition.addedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </li>
                        ))}
                    </ul>
                </div>
              )}

            </div>
          ))
        )}
      </div>
      
      <div className="pt-4 mt-auto border-t border-gray-700">
        <div className="space-y-2 text-lg mb-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          {order.discount && order.discount.amount > 0 && (
              <div className="flex justify-between text-red-400">
                  <span>
                      Descuento 
                      {order.discount.type === 'percentage' ? ` (${order.discount.value}%)` : ''}
                  </span>
                  <span className="font-semibold">-{formatCurrency(order.discount.amount)}</span>
              </div>
          )}
          <div className="flex justify-between">
            <span>IVA (21%)</span>
            <span className="font-semibold">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-green-400">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button onClick={onSave} className="w-full text-center py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700">Guardar y Cerrar</button>
            <button onClick={onPrint} className="w-full text-center py-3 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700">Imprimir Factura</button>
            <button onClick={onOpenDiscountModal} className="w-full flex items-center justify-center text-center py-3 bg-yellow-600 rounded-lg font-semibold hover:bg-yellow-700">
              <ReceiptPercentIcon className="h-5 w-5 mr-2" />
              Descuento
            </button>
            <button 
              onClick={onCancel} 
              disabled={!canCancelOrder}
              title={!canCancelOrder ? "Solo administradores o gerentes pueden cancelar" : ""}
              className="w-full text-center py-3 bg-red-600 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
              Cancelar Pedido
            </button>
            <button 
              onClick={onPay} 
              disabled={items.length === 0} 
              className="col-span-2 w-full text-center py-4 bg-green-600 rounded-lg font-bold text-xl hover:bg-green-700 disabled:bg-gray-500"
            >
              {isZeroOrNegativeTotal ? 'Cerrar Cuenta' : 'PAGAR'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentOrder;