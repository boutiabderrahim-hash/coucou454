import React from 'react';
import { Order, RestaurantSettings } from '../types';
import { generateReceiptHTML } from '../utils/helpers';
import { XMarkIcon, PrinterIcon } from './icons';

interface ReceiptPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    settings: RestaurantSettings;
}

const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({ isOpen, onClose, order, settings }) => {

    const handlePrint = () => {
        const receiptHTML = generateReceiptHTML(order, settings);
        const receiptContainer = document.getElementById('receipt-container');
        if (receiptContainer) {
            receiptContainer.innerHTML = receiptHTML;
            window.print();
            receiptContainer.innerHTML = ''; // Clean up
        }
    };
    
    if (!isOpen) return null;

    // Generate the same HTML for preview as for printing
    const receiptPreviewHTML = generateReceiptHTML(order, settings);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Vista Previa del Recibo</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-4 overflow-y-auto flex justify-center bg-white">
                   <div dangerouslySetInnerHTML={{ __html: receiptPreviewHTML }} />
                </div>
                <div className="p-4 border-t border-gray-700">
                    <button onClick={handlePrint} className="w-full py-3 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg hover:bg-blue-700">
                        <PrinterIcon className="h-6 w-6 mr-2"/> Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptPreviewModal;