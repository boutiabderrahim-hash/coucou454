import React, { useState } from 'react';
import { Category, MenuItem, Waiter, InventoryItem, RestaurantSettings, Table, Area, Shift, Order, Role, Customer, Payment } from '../../types';
import CategoryManagement from './CategoryManagement';
import MenuManagement from './MenuManagement';
import WaiterManagement from './WaiterManagement';
import InventoryManagement from './InventoryManagement';
import RestaurantSettingsComponent from './RestaurantSettings';
import TableLayoutEditor from './TableLayoutEditor';
import DailyReport from './DailyReport';
import { BookOpenIcon, UsersIcon, CubeIcon, Cog6ToothIcon, Squares2X2Icon, DocumentTextIcon, TagIcon, CurrencyEuroIcon, UserGroupIcon, ArchiveBoxIcon, ClockIcon, ClipboardDocumentListIcon, SparklesIcon } from '../icons';
import FinancialReport from './FinancialReport';
import CustomerManagement from './CustomerManagement';
import DataManagement from './DataManagement';
import AIAssistant from './AIAssistant';

interface AdminViewProps {
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    menuItems: MenuItem[];
    setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    waiters: Waiter[];
    setWaiters: React.Dispatch<React.SetStateAction<Waiter[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    settings: RestaurantSettings;
    setSettings: React.Dispatch<React.SetStateAction<RestaurantSettings>>;
    tables: Table[];
    setTables: React.Dispatch<React.SetStateAction<Table[]>>;
    areas: Area[];
    setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
    shifts: Shift[];
    setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    currentUserRole: Role;
    onCreditPayment: (customerId: string, payment: Payment) => void;
}

type AdminTab = 'report' | 'financials' | 'menu' | 'categories' | 'waiters' | 'customers' | 'inventory' | 'tables' | 'settings' | 'data' | 'ai_assistant';

const AdminView: React.FC<AdminViewProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('customers');
    
    const TabButton: React.FC<{tab: AdminTab, label: string, icon: React.ReactNode}> = ({tab, label, icon}) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold w-full text-left transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'financials':
                return <FinancialReport orders={props.orders} shifts={props.shifts} />;
            case 'report':
                return <DailyReport orders={props.orders} shifts={props.shifts} />;
            case 'menu':
                return <MenuManagement 
                    menuItems={props.menuItems} 
                    categories={props.categories} 
                    inventory={props.inventory}
                    onUpdateMenuItems={props.setMenuItems} />;
            case 'categories':
                return <CategoryManagement 
                    categories={props.categories} 
                    onUpdateCategories={props.setCategories}
                    menuItems={props.menuItems} 
                    />;
            case 'waiters':
                return <WaiterManagement waiters={props.waiters} onUpdateWaiters={props.setWaiters} />;
            case 'customers':
                return <CustomerManagement 
                    customers={props.customers} 
                    onUpdateCustomers={props.setCustomers}
                    onCreditPayment={props.onCreditPayment} 
                    />;
            case 'inventory':
                return <InventoryManagement 
                    inventory={props.inventory} 
                    setInventory={props.setInventory}
                    menuItems={props.menuItems}
                    setMenuItems={props.setMenuItems}
                    userRole={props.currentUserRole}
                     />;
            case 'tables':
                return <TableLayoutEditor 
                    tables={props.tables} 
                    setTables={props.setTables}
                    areas={props.areas}
                    setAreas={props.setAreas}
                />;
            case 'settings':
                return <RestaurantSettingsComponent settings={props.settings} onUpdateSettings={props.setSettings} />;
            case 'data':
                return <DataManagement 
                    waiters={props.waiters} setWaiters={props.setWaiters}
                    categories={props.categories} setCategories={props.setCategories}
                    menuItems={props.menuItems} setMenuItems={props.setMenuItems}
                    inventory={props.inventory} setInventory={props.setInventory}
                    customers={props.customers} setCustomers={props.setCustomers}
                    orders={props.orders} setOrders={props.setOrders}
                    shifts={props.shifts} setShifts={props.setShifts}
                />;
            case 'ai_assistant':
                return <AIAssistant {...props} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 flex bg-gray-800">
            <aside className="w-64 bg-gray-900 p-4 flex flex-col space-y-2">
                {props.currentUserRole === 'ADMIN' && (
                    <TabButton tab="ai_assistant" label="Asistente IA" icon={<SparklesIcon className="h-6 w-6"/>} />
                )}
                <TabButton tab="customers" label="Clientes" icon={<UserGroupIcon className="h-6 w-6"/>} />
                <TabButton tab="inventory" label="Inventario" icon={<CubeIcon className="h-6 w-6"/>} />
                <TabButton tab="menu" label="Menú" icon={<BookOpenIcon className="h-6 w-6"/>} />
                <TabButton tab="categories" label="Categorías" icon={<TagIcon className="h-6 w-6"/>} />
                <TabButton tab="waiters" label="Camareros" icon={<UsersIcon className="h-6 w-6"/>} />
                <TabButton tab="tables" label="Diseño de Mesas" icon={<Squares2X2Icon className="h-6 w-6"/>} />
                <TabButton tab="financials" label="Informes Financieros" icon={<CurrencyEuroIcon className="h-6 w-6"/>} />
                <TabButton tab="report" label="Informe Diario" icon={<DocumentTextIcon className="h-6 w-6"/>} />
                <TabButton tab="data" label="Gestión de Datos" icon={<ArchiveBoxIcon className="h-6 w-6"/>} />
                <TabButton tab="settings" label="Ajustes" icon={<Cog6ToothIcon className="h-6 w-6"/>} />
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminView;