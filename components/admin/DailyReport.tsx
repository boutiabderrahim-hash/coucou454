import React from 'react';
import { Order, Shift } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface DailyReportProps {
    orders: Order[];
    shifts: Shift[];
}

const DailyReport: React.FC<DailyReportProps> = ({ orders, shifts }) => {
    // Fix: Use timezone-safe date comparison for today's orders
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysOrders = orders.filter(o => 
        o.status === 'closed' && 
        o.closedAt && // Ensure closedAt exists
        o.closedAt >= todayStart.getTime() && 
        o.closedAt <= todayEnd.getTime()
    );

    const todaysShifts = shifts.filter(s => 
        s.startTime >= todayStart.getTime() && 
        s.startTime <= todayEnd.getTime()
    );

    const totalSales = todaysOrders.reduce((acc, order) => acc + order.total, 0);
    
    // Fix: Correctly calculate sales from multiple split payments
    const totalCashSales = todaysOrders.reduce((acc, order) => {
        const orderCash = order.splitPayments
            ?.filter(p => p.method === 'cash')
            .reduce((sum, p) => sum + p.amount, 0) || 0;
        return acc + orderCash;
    }, 0);

    const totalCardSales = todaysOrders.reduce((acc, order) => {
        const orderCard = order.splitPayments
            ?.filter(p => p.method === 'card')
            .reduce((sum, p) => sum + p.amount, 0) || 0;
        return acc + orderCard;
    }, 0);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Informe del Día - {new Date().toLocaleDateString('es-ES')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Ventas Totales</h3>
                    <p className="text-4xl font-bold text-green-400">{formatCurrency(totalSales)}</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Total Pedidos Completados</h3>
                    <p className="text-4xl font-bold">{todaysOrders.length}</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Ventas Efectivo / Tarjeta</h3>
                    <p className="text-2xl font-bold">{formatCurrency(totalCashSales)} / {formatCurrency(totalCardSales)}</p>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Pedidos Completados Hoy</h3>
            <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-700 text-xs text-gray-300 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-3 text-left">Nº Pedido</th>
                            <th className="px-6 py-3 text-left">Mesa</th>
                            <th className="px-6 py-3 text-left">Camarero</th>
                            <th className="px-6 py-3 text-left">Hora Cierre</th>
                            <th className="px-6 py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {todaysOrders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-800">
                                <td className="px-6 py-4">{order.orderNumber}</td>
                                <td className="px-6 py-4">{order.tableNumber}</td>
                                <td className="px-6 py-4">{order.waiterName}</td>
                                <td className="px-6 py-4">{new Date(order.closedAt!).toLocaleTimeString('es-ES')}</td>
                                <td className="px-6 py-4 text-right font-bold">{formatCurrency(order.total)}</td>
                            </tr>
                        ))}
                         {todaysOrders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">No hay pedidos completados hoy.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DailyReport;