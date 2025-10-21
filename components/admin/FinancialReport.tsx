import React, { useState, useMemo } from 'react';
import { Order, Shift } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { CurrencyEuroIcon, CreditCardIcon, TicketIcon, CalculatorIcon } from '../icons';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-900 p-6 rounded-xl flex items-center">
        <div className="p-3 rounded-lg bg-gray-800 mr-4">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const FinancialReport: React.FC<{ orders: Order[], shifts: Shift[] }> = ({ orders, shifts }) => {
    type ReportPeriod = 'daily' | 'monthly' | 'quarterly' | 'annually';
    const [period, setPeriod] = useState<ReportPeriod>('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const reportData = useMemo(() => {
        const closedOrders = orders.filter(o => o.status === 'closed' && o.closedAt);

        const filterByDate = (timestamp: number) => {
            const itemDate = new Date(timestamp);
            const selectedDateObj = new Date(selectedDate);
            // Adjust for timezone to compare dates correctly
            selectedDateObj.setMinutes(selectedDateObj.getMinutes() + selectedDateObj.getTimezoneOffset());

            const selectedYear = selectedDateObj.getFullYear();
            const selectedMonth = selectedDateObj.getMonth();
            const selectedDay = selectedDateObj.getDate();

            switch (period) {
                case 'daily':
                    return itemDate.getFullYear() === selectedYear &&
                           itemDate.getMonth() === selectedMonth &&
                           itemDate.getDate() === selectedDay;
                case 'monthly':
                    return itemDate.getFullYear() === selectedYear &&
                           itemDate.getMonth() === selectedMonth;
                case 'quarterly':
                    const itemQuarter = Math.floor(itemDate.getMonth() / 3);
                    const selectedQuarter = Math.floor(selectedMonth / 3);
                    return itemDate.getFullYear() === selectedYear && itemQuarter === selectedQuarter;
                case 'annually':
                    return itemDate.getFullYear() === selectedYear;
                default:
                    return false;
            }
        };
        
        const filteredOrders = closedOrders.filter(order => filterByDate(order.closedAt!));

        let totalRevenue = 0;
        let totalTax = 0;
        let cardRevenue = 0;
        let cashRevenue = 0;
        let creditRevenue = 0;

        for (const order of filteredOrders) {
            totalRevenue += order.total;
            totalTax += order.tax;

            if (order.splitPayments) {
                for (const payment of order.splitPayments) {
                    if (payment.method === 'card') {
                        cardRevenue += payment.amount;
                    } else if (payment.method === 'cash') {
                        cashRevenue += payment.amount;
                    } else if (payment.method === 'credit') {
                        creditRevenue += payment.amount;
                    }
                }
            }
        }

        const netRevenue = totalRevenue - totalTax;
        
        return {
            totalRevenue,
            netRevenue,
            totalTax,
            cardRevenue,
            cashRevenue,
            creditRevenue,
            transactionCount: filteredOrders.length,
            transactions: filteredOrders.sort((a, b) => b.closedAt! - a.closedAt!),
        };
    }, [orders, period, selectedDate]);
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const getPeriodLabel = () => {
        const date = new Date(selectedDate);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        switch (period) {
            case 'daily': return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
            case 'monthly': return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            case 'quarterly':
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                return `T${quarter} ${date.getFullYear()}`;
            case 'annually': return date.getFullYear().toString();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Informe Financiero: <span className="text-indigo-400">{getPeriodLabel()}</span></h2>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg mb-6 flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                    {(['daily', 'monthly', 'quarterly', 'annually'] as ReportPeriod[]).map(p => (
                        <button key={p} onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap capitalize ${period === p ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {p === 'daily' ? 'Diario' : p === 'monthly' ? 'Mensual' : p === 'quarterly' ? 'Trimestral' : 'Anual'}
                        </button>
                    ))}
                 </div>
                 <div className="flex items-center">
                    <label htmlFor="report-date" className="mr-2 font-semibold">Seleccionar Fecha:</label>
                    <input type="date" id="report-date" value={selectedDate} onChange={handleDateChange} className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3"/>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Ingresos Totales" value={formatCurrency(reportData.totalRevenue)} icon={<CurrencyEuroIcon className="h-6 w-6 text-green-400"/>} />
                <StatCard title="Ingresos Netos" value={formatCurrency(reportData.netRevenue)} icon={<CurrencyEuroIcon className="h-6 w-6 text-green-400"/>} />
                <StatCard title="Total IVA (21%)" value={formatCurrency(reportData.totalTax)} icon={<CalculatorIcon className="h-6 w-6 text-yellow-400"/>} />
                <StatCard title="Ingresos por Tarjeta" value={formatCurrency(reportData.cardRevenue)} icon={<CreditCardIcon className="h-6 w-6 text-blue-400"/>} />
                <StatCard title="Ingresos en Efectivo" value={formatCurrency(reportData.cashRevenue)} icon={<CurrencyEuroIcon className="h-6 w-6 text-green-400"/>} />
                <StatCard title="Ventas a Crédito" value={formatCurrency(reportData.creditRevenue)} icon={<TicketIcon className="h-6 w-6 text-orange-400"/>} />
            </div>

            <h3 className="text-xl font-bold mb-4">Transacciones del Periodo</h3>
            <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-700 text-xs text-gray-300 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3 text-left">Nº Pedido</th>
                                <th className="px-6 py-3 text-left">Fecha</th>
                                <th className="px-6 py-3 text-left">Camarero</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-right">Pagos</th>
                                <th className="px-6 py-3 text-right">IVA</th>
                                <th className="px-6 py-3 text-right">Neto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {reportData.transactions.map(order => {
                                const cash = order.splitPayments?.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0) || 0;
                                const card = order.splitPayments?.filter(p => p.method === 'card').reduce((sum, p) => sum + p.amount, 0) || 0;
                                const credit = order.splitPayments?.filter(p => p.method === 'credit').reduce((sum, p) => sum + p.amount, 0) || 0;
                                return (
                                <tr key={order.id} className="hover:bg-gray-800">
                                    <td className="px-6 py-4">{order.orderNumber}</td>
                                    <td className="px-6 py-4">{new Date(order.closedAt!).toLocaleString('es-ES')}</td>
                                    <td className="px-6 py-4">{order.waiterName}</td>
                                    <td className="px-6 py-4 text-right font-bold">{formatCurrency(order.total)}</td>
                                    <td className="px-6 py-4 text-right text-xs">
                                        {cash > 0 && <div>Efectivo: {formatCurrency(cash)}</div>}
                                        {card > 0 && <div>Tarjeta: {formatCurrency(card)}</div>}
                                        {credit > 0 && <div>Crédito: {formatCurrency(credit)}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(order.tax)}</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(order.total - order.tax)}</td>
                                </tr>
                            )})}
                             {reportData.transactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">No hay transacciones para el periodo seleccionado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default FinancialReport;