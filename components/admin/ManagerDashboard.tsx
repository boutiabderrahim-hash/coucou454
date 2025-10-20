import React from 'react';
import { Shift, InventoryItem, MenuItem, Role } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '../icons';
import InventoryManagement from './InventoryManagement';

interface ManagerDashboardProps {
    activeShift: Shift | null;
    onCashMovement: (type: 'in' | 'out') => void;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    menuItems: MenuItem[];
    setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    currentUserRole: Role;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ 
    activeShift, 
    onCashMovement, 
    inventory, 
    setInventory, 
    menuItems, 
    setMenuItems, 
    currentUserRole 
}) => {
    const isPrivileged = currentUserRole === 'ADMIN' || currentUserRole === 'MANAGER';

    const totalCashIn = activeShift?.cashIn.reduce((sum, mov) => sum + mov.amount, 0) || 0;
    const totalCashOut = activeShift?.cashOut.reduce((sum, mov) => sum + mov.amount, 0) || 0;
    const expectedCash = (activeShift?.startingBalance || 0) + (activeShift?.cashSales || 0) + totalCashIn - totalCashOut;
    const allMovements = [...(activeShift?.cashIn || []), ...(activeShift?.cashOut || [])].sort((a,b) => b.timestamp - a.timestamp);

    return (
        <div className="flex-1 flex flex-col bg-gray-800 p-6 gap-8 overflow-y-auto">
            {isPrivileged && (
                <div>
                    {!activeShift ? (
                        <div className="flex items-center justify-center bg-gray-900 p-6 rounded-xl">
                            <h1 className="text-2xl text-gray-400">No hay ningún turno activo para gestionar.</h1>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Panel de Gerente</h1>
                            <p className="text-lg text-gray-400 mb-6">Gestionando el turno de: <span className="font-bold text-white">{activeShift.waiterName}</span></p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gray-900 p-6 rounded-xl">
                                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Ventas Totales del Turno</h3>
                                    <p className="text-4xl font-bold text-green-400">{formatCurrency(activeShift.totalSales)}</p>
                                </div>
                                <div className="bg-gray-900 p-6 rounded-xl">
                                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Efectivo Esperado en Caja</h3>
                                    <p className="text-4xl font-bold text-yellow-400">{formatCurrency(expectedCash)}</p>
                                </div>
                                <div className="bg-gray-900 p-6 rounded-xl">
                                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Ventas con Tarjeta</h3>
                                    <p className="text-4xl font-bold text-blue-400">{formatCurrency(activeShift.cardSales)}</p>
                                </div>
                            </div>
                            
                            <div className="w-full flex flex-col bg-gray-900 p-6 rounded-xl">
                                <h2 className="text-2xl font-bold mb-4">Gestión de Caja</h2>
                                <div className="flex gap-4 mb-6">
                                    <button onClick={() => onCashMovement('in')} className="flex-1 flex items-center justify-center gap-2 p-4 bg-green-600 rounded-lg font-semibold hover:bg-green-700">
                                        <ArrowUpTrayIcon className="h-6 w-6" />
                                        Entrada de Caja
                                    </button>
                                    <button onClick={() => onCashMovement('out')} className="flex-1 flex items-center justify-center gap-2 p-4 bg-red-600 rounded-lg font-semibold hover:bg-red-700">
                                        <ArrowDownTrayIcon className="h-6 w-6" />
                                        Salida de Caja
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto max-h-64">
                                    <h3 className="text-lg font-semibold mb-2">Últimos Movimientos</h3>
                                    {allMovements.length === 0 ? (
                                        <p className="text-gray-500">No hay movimientos de caja.</p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {allMovements.map(mov => (
                                                <li key={mov.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                                                    <div>
                                                        <p className="font-semibold">{mov.reason}</p>
                                                        <p className="text-xs text-gray-400">{new Date(mov.timestamp).toLocaleTimeString()}</p>
                                                    </div>
                                                    <p className={`font-bold text-lg ${mov.type === 'in' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {mov.type === 'in' ? '+' : '-'}
                                                        {formatCurrency(mov.amount)}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
            
            <InventoryManagement
                inventory={inventory}
                setInventory={setInventory}
                menuItems={menuItems}
                setMenuItems={setMenuItems}
                userRole={currentUserRole}
            />
        </div>
    );
};

export default ManagerDashboard;