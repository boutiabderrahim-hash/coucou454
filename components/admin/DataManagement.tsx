import React from 'react';
import { Waiter, Category, MenuItem, InventoryItem, Customer, Order, Shift } from '../../types';
import { mockWaiters, mockCategories, mockMenuItems, mockInventory, mockCustomers } from '../../data/mockData';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ExclamationTriangleIcon } from '../icons';

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

const DataManagement: React.FC<DataManagementProps> = (props) => {
    
    const handleExport = () => {
        const dataToExport = {
            waiters: props.waiters,
            categories: props.categories,
            menuItems: props.menuItems,
            inventory: props.inventory,
            customers: props.customers,
            orders: props.orders,
            shifts: props.shifts,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const importedData = JSON.parse(text);

                if (window.confirm("¿Seguro que quieres importar estos datos? Se sobrescribirá toda la información actual.")) {
                    if (importedData.waiters) props.setWaiters(importedData.waiters);
                    if (importedData.categories) props.setCategories(importedData.categories);
                    if (importedData.menuItems) props.setMenuItems(importedData.menuItems);
                    if (importedData.inventory) props.setInventory(importedData.inventory);
                    if (importedData.customers) props.setCustomers(importedData.customers);
                    if (importedData.orders) props.setOrders(importedData.orders);
                    if (importedData.shifts) props.setShifts(importedData.shifts);
                    alert("¡Datos importados con éxito!");
                }
            } catch (error) {
                console.error("Error al importar el archivo:", error);
                alert("Hubo un error al procesar el archivo. Asegúrate de que es un archivo de respaldo válido.");
            }
        };
        reader.readAsText(file);
        // Reset file input to allow importing the same file again
        event.target.value = '';
    };

    const handleResetData = () => {
        if (window.confirm("¡ADVERTENCIA! Esta acción es irreversible y eliminará TODOS los datos (pedidos, turnos, clientes, etc.), restaurando la configuración de demostración. ¿Estás absolutamente seguro de que quieres continuar?")) {
            props.setWaiters(mockWaiters);
            props.setCategories(mockCategories);
            props.setMenuItems(mockMenuItems);
            props.setInventory(mockInventory);
            props.setCustomers(mockCustomers);
            props.setOrders([]);
            props.setShifts([]);
            alert("Los datos han sido restaurados a la configuración de demostración.");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Gestión de Datos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ArrowDownTrayIcon className="h-6 w-6"/> Exportar Datos</h3>
                    <p className="text-gray-400 mb-4">Guarda una copia de seguridad de todos los datos de tu aplicación en un archivo JSON.</p>
                    <button onClick={handleExport} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        Exportar a Archivo
                    </button>
                </div>

                <div className="bg-gray-900 rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ArrowUpTrayIcon className="h-6 w-6"/> Importar Datos</h3>
                    <p className="text-gray-400 mb-4">Carga datos desde un archivo de respaldo JSON. Esto sobrescribirá los datos actuales.</p>
                     <label className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer flex items-center justify-center">
                        <span>Seleccionar Archivo para Importar</span>
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                </div>
            </div>

            <div className="mt-8 bg-red-900 bg-opacity-25 border border-red-500 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400"><ExclamationTriangleIcon className="h-6 w-6"/> Zona de Peligro</h3>
                <p className="text-red-300 mb-4">Esta acción eliminará todos los pedidos, turnos y clientes, y restaurará los datos de demostración (menú, categorías, camareros, etc.). Úsalo con precaución.</p>
                 <button onClick={handleResetData} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                    Restaurar Datos de Demostración
                </button>
            </div>
        </div>
    );
};

export default DataManagement;
