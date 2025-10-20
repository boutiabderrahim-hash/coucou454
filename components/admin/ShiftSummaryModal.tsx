import React, { useState, useMemo } from 'react';
import { Shift } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { XMarkIcon, CalculatorIcon } from '../icons';

interface ShiftSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    shift: Shift;
    onConfirm: (actualCash: number) => void;
}

const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({ isOpen, onClose, shift, onConfirm }) => {
    const [actualCash, setActualCash] = useState('');

    const totalCashIn = useMemo(() => shift.cashIn.reduce((sum, mov) => sum + mov.amount, 0), [shift.cashIn]);
    const totalCashOut = useMemo(() => shift.cashOut.reduce((sum, mov) => sum + mov.amount, 0), [shift.cashOut]);
    const expectedCash = useMemo(() => shift.startingBalance + shift.cashSales + totalCashIn - totalCashOut, [shift, totalCashIn, totalCashOut]);
    
    const actualCashValue = parseFloat(actualCash) || 0;
    const difference = actualCashValue - expectedCash;

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (actualCash === '') {
            alert('Por favor, introduzca el efectivo real contado.');
            return;
        }
        onConfirm(actualCashValue);
    };
    
    const handleNumpad = (value: string) => {
        if (value === 'del') {
            setActualCash(b => b.slice(0, -1));
        } else if (value === '.') {
            if (!actualCash.includes('.')) setActualCash(b => b + '.');
        } else {
            setActualCash(b => b + value);
        }
    };
    
    const getDifferenceColor = () => {
        if (Math.abs(difference) < 0.01) return 'text-gray-400';
        return difference > 0 ? 'text-green-500' : 'text-red-500';
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Resumen y Cierre de Turno</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="flex">
                    <div className="w-1/2 p-6 border-r border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Resumen de Turno para {shift.waiterName}</h3>
                        <div className="space-y-2 text-lg">
                            <div className="flex justify-between"><span className="text-gray-400">Saldo Inicial:</span> <span>{formatCurrency(shift.startingBalance)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Ventas en Efectivo:</span> <span className="text-green-400">{formatCurrency(shift.cashSales)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Ventas con Tarjeta:</span> <span>{formatCurrency(shift.cardSales)}</span></div>
                            {shift.totalDiscounts > 0 && (
                                <div className="flex justify-between"><span className="text-gray-400">Total Descuentos:</span> <span className="text-red-400">-{formatCurrency(shift.totalDiscounts)}</span></div>
                            )}
                            <div className="flex justify-between"><span className="text-gray-400">Entradas de Caja:</span> <span>{formatCurrency(totalCashIn)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Salidas de Caja:</span> <span>{formatCurrency(totalCashOut)}</span></div>
                            <hr className="border-gray-600 my-2"/>
                            <div className="flex justify-between font-bold text-xl"><span className="text-yellow-400">Efectivo Esperado:</span> <span className="text-yellow-400">{formatCurrency(expectedCash)}</span></div>
                             <div className="flex justify-between"><span className="text-gray-400">Efectivo Real:</span> <span>{formatCurrency(actualCashValue)}</span></div>
                             <div className={`flex justify-between font-bold ${getDifferenceColor()}`}>
                                <span>Diferencia:</span> 
                                <span>{difference >= 0 ? '+' : '-'}{formatCurrency(Math.abs(difference))}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2 p-6">
                         <label className="block text-sm font-medium text-gray-400 mb-2">Efectivo Real Contado</label>
                         <input type="text" readOnly value={actualCash} className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg py-2 mb-4 text-3xl text-right font-mono"/>
                         <div className="grid grid-cols-3 gap-2">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(key => (
                                 <button key={key} onClick={() => handleNumpad(key)} className="text-xl font-bold bg-gray-700 rounded-lg py-3 hover:bg-gray-600">
                                    {key === 'del' ? '⌫' : key}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-700">
                    <button onClick={handleConfirm} className="w-full py-3 bg-green-600 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-500">
                        Confirmar y Cerrar Turno
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShiftSummaryModal;