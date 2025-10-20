
import React from 'react';
import { BellIcon } from './icons';

interface NotificationProps {
  title: string;
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ title, message, onClose }) => {
  return (
    <div className="fixed top-5 left-5 rtl:left-auto rtl:right-5 bg-white rounded-xl shadow-2xl p-4 max-w-sm w-full z-50 animate-pulse">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="p-2 bg-indigo-100 rounded-full">
            <BellIcon className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div className="ms-4 flex-1">
          <p className="text-lg font-bold text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-600">{message}</p>
        </div>
        <div className="ms-4 flex-shrink-0 flex">
          <button onClick={onClose} className="inline-flex text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
