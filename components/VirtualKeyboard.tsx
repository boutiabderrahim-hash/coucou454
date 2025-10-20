import React, { useState } from 'react';
import { BackspaceIcon } from './icons';

interface VirtualKeyboardProps {
    onKeyPress: (key: string) => void;
    onBackspace: () => void;
}

const Key: React.FC<{
    value: string;
    onClick: (value: string) => void;
    className?: string;
    children?: React.ReactNode;
}> = ({ value, onClick, className = '', children }) => (
    <button
        type="button"
        onClick={() => onClick(value)}
        className={`flex items-center justify-center rounded-lg sm:rounded-xl bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white font-semibold text-xl sm:text-2xl transition-colors select-none h-16 ${className}`}
    >
        {children || value}
    </button>
);


const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKeyPress, onBackspace }) => {
    const [layout, setLayout] = useState<'lower' | 'upper' | 'symbols'>('lower');

    const handleKeyPress = (key: string) => {
        onKeyPress(key);
        if (layout === 'upper') {
            setLayout('lower');
        }
    };

    const toggleLayout = () => {
        if (layout === 'lower') setLayout('upper');
        else setLayout('lower');
    };
    
    const toggleSymbols = () => {
         setLayout(prev => prev === 'symbols' ? 'lower' : 'symbols');
    };

    const lowerCaseKeys = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];
    const upperCaseKeys = lowerCaseKeys.map(row => row.map(key => key.toUpperCase()));

    const symbolKeys = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['@', '#', '€', '_', '&', '-', '+', '(', ')', '/'],
        ['*', '"', "'", ':', ';', '!', '?', '.']
    ];

    const keysToRender = layout === 'lower' ? lowerCaseKeys : (layout === 'upper' ? upperCaseKeys : symbolKeys);

    return (
        <div className="bg-gray-900 bg-opacity-95 p-2 sm:p-3 rounded-xl w-full mx-auto">
            <div className="space-y-2 sm:space-y-3">
                {keysToRender.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-2 sm:gap-3">
                        {row.map(key => <Key key={key} value={key} onClick={handleKeyPress} className="flex-1" />)}
                    </div>
                ))}
                <div className="flex justify-center gap-2 sm:gap-3">
                    <Key value="shift" onClick={toggleLayout} className="flex-[1.5]">⇧</Key>
                    <Key value=" " onClick={handleKeyPress} className="flex-[5]">espacio</Key>
                    <Key value="symbols" onClick={toggleSymbols} className="flex-[1.5]">{layout === 'symbols' ? 'abc' : '123'}</Key>
                    <Key value="backspace" onClick={onBackspace} className="flex-[1.5]"><BackspaceIcon className="h-8 w-8 mx-auto" /></Key>
                </div>
            </div>
        </div>
    );
};

export default VirtualKeyboard;