import React, { useRef, useState } from 'react';
import { Waiter, Category, MenuItem, InventoryItem, Customer, Order, Shift } from '../../types';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ClipboardDocumentListIcon, ClockIcon } from '../icons';
import ConfirmationModal from '../ConfirmationModal';

interface DataManagementProps {
    waiters: Waiter[];
    setWaiters: React.Dispatch<React.SetStateAction<Waiter[]>>;
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    menuItems: MenuItem[];
    setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    shifts: Shift[];
    setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
}

type DataType = 'waiters' | 'categories' | 'menuItems' | 'inventory' | 'customers' | 'orders' | 'shifts';

const DataManagement: React.FC<DataManagementProps> = ({
    waiters, setWaiters,
    categories, setCategories,
    menuItems, setMenuItems,
    inventory, setInventory,
    customers, setCustomers,
    orders, setOrders,
    shifts, setShifts,
}) => {
    const fileInputs = {
        waiters: useRef<HTMLInputElement>(null),
        categories: useRef<HTMLInputElement>(null),
        menuItems: useRef<HTMLInputElement>(null),
        inventory: useRef<HTMLInputElement>(null),
        customers: useRef<HTMLInputElement>(null),
        orders: useRef<HTMLInputElement>(null),
        shifts: useRef<HTMLInputElement>(null),
        all: useRef<HTMLInputElement>(null),
    };

    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [importData, setImportData] = useState<{ type: DataType | 'all'; data: any } | null>(null);

    // --- Helper Functions ---

    const jsonToCsv = (json: any[]): string => {
        if (!json || json.length === 0) return '';
        const headers = Object.keys(json[0]);
        const csvRows = [headers.join(',')];
        for (const row of json) {
            const values = headers.map(header => {
                let value = row[header];
                if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value); // Stringify objects/arrays
                }
                if (value === null || value === undefined) {
                    return '""';
                }
                const escaped = ('' + value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        return csvRows.join('\n');
    };
    
    const csvToJson = (csv: string): any[] => {
        const lines = csv.split(/\r\n|\n/);
        if (lines.length < 2) return [];
        const result = [];
        const headers = lines[0].trim().split(',').map(h => h.replace(/^"|"$/g, ''));
    
        for (let i = 1; i < lines.length; i++) {
            const currentline = lines[i].trim();
            if (!currentline) continue;
            
            const obj: { [key: string]: any } = {};
            const values = currentline.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            headers.forEach((header, index) => {
                let value = (values[index] || '').replace(/^"|"$/g, '').replace(/""/g, '"');
                
                // Attempt to parse JSON strings
                if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
                    try {
                        obj[header] = JSON.parse(value);
                        return; // Move to next header if parse is successful
                    } catch (e) {
                        // Not a valid JSON string, treat as regular string
                    }
                }
                
                // Attempt to convert to number or boolean if applicable
                if (!isNaN(Number(value)) && value.trim() !== '' && !isNaN(parseFloat(value))) {
                    obj[header] = Number(value);
                } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                    obj[header] = value.toLowerCase() === 'true';
                } else {
                    obj[header] = value;
                }
            });
            result.push(obj);
        }
        return result;
    };

    const downloadFile = (blob: Blob, filename: string) => {
         const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // --- Export Logic ---

    const handleExport = (type: DataType) => {
        const dataMap = { waiters, categories, menuItems, inventory, customers, orders, shifts };
        const data = dataMap[type];
        const csv = jsonToCsv(data);
        if (!csv) {
            alert('No hay datos para exportar.');
            return;
        }
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        downloadFile(blob, `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportAll = () => {
        const allData = { waiters, categories, menuItems, inventory, customers, orders, shifts };
        const jsonString = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        downloadFile(blob, `pos_backup_${new Date().toISOString().split('T')[0]}.json`);
    };
    
    // --- Import Logic ---

    const handleImportClick = (type: DataType | 'all') => {
        fileInputs[type].current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: DataType | 'all') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                let jsonData;
                if (type === 'all') {
                    jsonData = JSON.parse(text);
                    // Basic validation for the all-data object
                    if (!jsonData || typeof jsonData !== 'object' || !('waiters' in jsonData && 'categories' in jsonData)) {
                        throw new Error('El archivo JSON de copia de seguridad no tiene el formato correcto.');
                    }
                } else {
                    jsonData = csvToJson(text);
                    if (jsonData.length === 0 && text.trim().split(/\r\n|\n/).length > 1) {
                         // File has content but parsing resulted in empty array, might be a format issue.
                        throw new Error('El archivo CSV está vacío o tiene un formato incorrecto.');
                    }
                }
                
                setImportData({ type, data: jsonData });
                setConfirmModalOpen(true);

            } catch (error) {
                console.error("Error processing file:", error);
                alert(`Error al procesar el archivo. Por favor, verifique el formato. Detalles: ${error instanceof Error ? error.message : String(error)}`);
            }
        };
        reader.readAsText(file, 'UTF-8');
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const confirmImport = () => {
        if (!importData) return;

        if (importData.type === 'all') {
            setCategories(importData.data.categories || []);
            setMenuItems(importData.data.menuItems || []);
            setInventory(importData.data.inventory || []);
            setWaiters(importData.data.waiters || []);
            setCustomers(importData.data.customers || []);
            setOrders(importData.data.orders || []);
            setShifts(importData.data.shifts || []);
        } else {
            const setterMap = {
                waiters: setWaiters,
                categories: setCategories,
                menuItems: setMenuItems,
                inventory: setInventory,
                customers: setCustomers,
                orders: setOrders,
                shifts: setShifts,
            };
            setterMap[importData.type](importData.data);
        }
        
        setConfirmModalOpen(false);
        setImportData(null);
        alert('¡Datos importados con éxito!');
    };
    
    const getConfirmationMessage = () => {
        if (!importData) return '';
        if (importData.type === 'all') {
            return '¿Estás seguro de que quieres restaurar esta copia de seguridad? Se sobreescribirán TODOS los datos actuales (menú, clientes, camareros, pedidos, turnos, etc). Esta acción no se puede deshacer.';
        }
        const recordCount = Array.isArray(importData.data) ? importData.data.length : 'un número de';
        return `¿Estás seguro de que quieres importar ${recordCount} registros? Esto sobreescribirá todos los datos existentes de "${importData.type}". Esta acción no se puede deshacer.`;
    }

    const dataSections: { type: DataType; title: string, icon: React.ReactNode }[] = [
        { type: 'categories', title: 'Categorías', icon: <div/> },
        { type: 'menuItems', title: 'Artículos del Menú', icon: <div/> },
        { type: 'inventory', title: 'Inventario', icon: <div/> },
        { type: 'waiters', title: 'Camareros', icon: <div/> },
        { type: 'customers', title: 'Clientes', icon: <div/> },
        { type: 'orders', title: 'Pedidos (Historial)', icon: <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400"/> },
        { type: 'shifts', title: 'Turnos (Historial)', icon: <ClockIcon className="h-6 w-6 text-gray-400"/> },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Gestión de Datos (Importar/Exportar)</h2>
            
            <div className="bg-gray-900 p-8 rounded-lg mb-8">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Copia de Seguridad Completa</h3>
                <p className="text-gray-400 mb-4">Exporta o importa toda la configuración y el historial del sistema en un único archivo. Ideal para copias de seguridad o para migrar a otro dispositivo.</p>
                <div className="flex gap-4">
                     <input type="file" ref={fileInputs.all} className="hidden" accept=".json" onChange={(e) => handleFileChange(e, 'all')} />
                    <button onClick={handleExportAll} className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        <ArrowDownTrayIcon className="h-6 w-6" /> Exportar Todo (JSON)
                    </button>
                    <button onClick={() => handleImportClick('all')} className="w-full flex items-center justify-center gap-2 p-4 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                        <ArrowUpTrayIcon className="h-6 w-6" /> Importar Todo (JSON)
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-lg">
                 <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Gestión por Partes (CSV)</h3>
                <p className="text-yellow-400 bg-yellow-900 bg-opacity-25 p-4 rounded-lg mb-8">
                    <strong>¡Atención!</strong> La importación de un archivo CSV reemplazará por completo los datos existentes para esa categoría. Se recomienda exportar sus datos actuales como copia de seguridad antes de importar.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Export Column */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Exportar a CSV para Editar</h4>
                        <div className="space-y-3">
                            {dataSections.map(({ type, title }) => (
                                <button key={type} onClick={() => handleExport(type)} className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                                    <span className="font-semibold">{title}</span>
                                    <ArrowDownTrayIcon className="h-6 w-6 text-blue-400" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Import Column */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Importar desde CSV</h4>
                        <div className="space-y-3">
                            {dataSections.map(({ type, title }) => (
                                <div key={type}>
                                    <input
                                        type="file"
                                        ref={fileInputs[type]}
                                        className="hidden"
                                        accept=".csv"
                                        onChange={(e) => handleFileChange(e, type)}
                                    />
                                    <button onClick={() => handleImportClick(type)} className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                                        <span className="font-semibold">{title}</span>
                                        <ArrowUpTrayIcon className="h-6 w-6 text-green-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {isConfirmModalOpen && importData && (
                 <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    title={`Confirmar Importación`}
                    message={getConfirmationMessage()}
                    onConfirm={confirmImport}
                    confirmText='Sí, Importar'
                />
            )}
        </div>
    );
};

export default DataManagement;
