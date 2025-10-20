import React from 'react';
import { CheckCircleIcon, PrinterIcon, XMarkIcon } from './icons';

interface PostPaymentConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPrint: () => void;
}

const PostPaymentConfirmationModal: React.FC<PostPaymentConfirmationModalProps> = ({ isOpen, onClose, onPrint }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg text-center p-8 transform transition-all animate-fade-in-up">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-900 mb-6">
                    <CheckCircleIcon className="h-12 w-12 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">¡Pago Completado!</h2>
                <p className="text-lg text-gray-400 mb-8">¿Desea imprimir la factura?</p>
                
                <div className="flex justify-center space-x-6">
                    <button
                        onClick={onClose}
                        className="w-1/2 py-4 px-6 bg-gray-600 rounded-lg font-semibold text-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-3"
                    >
                        <XMarkIcon className="h-7 w-7"/>
                        <span>Finalizar</span>
                    </button>
                    <button
                        onClick={onPrint}
                        className="w-1/2 py-4 px-6 bg-blue-600 rounded-lg font-semibold text-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
                    >
                        <PrinterIcon className="h-7 w-7"/>
                        <span>Imprimir Factura</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostPaymentConfirmationModal;
