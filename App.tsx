import React, { useState, useEffect, useCallback } from 'react';
import { Waiter, AppScreen, Order, MenuItem, OrderItem, Category, InventoryItem, Table, Area, RestaurantSettings, Customer, Shift, Payment, CashMovement, Addition, Role } from './types';
import { useLocalStorage } from './utils/hooks';
import { mockWaiters, mockCategories, mockMenuItems, mockInventory, mockTables, mockAreas, mockSettings, mockCustomers } from './data/mockData';
import WaiterSelectionScreen from './components/WaiterSelectionScreen';
import Header from './components/Header';
import TableSelectionScreen from './components/TableSelectionScreen';
import Menu from './components/Menu';
import CurrentOrder from './components/CurrentOrder';
import PaymentModal from './components/PaymentModal';
import OpeningBalanceModal from './components/OpeningBalanceModal';
import Sidebar from './components/Sidebar';
import AdminView from './components/admin/AdminView';
import ManagerDashboard from './components/admin/ManagerDashboard';
import CashMovementModal from './components/admin/CashMovementModal';
import ShiftSummaryModal from './components/admin/ShiftSummaryModal';
import OpenOrdersWarningModal from './components/OpenOrdersWarningModal';
import CustomerSelectionModal from './components/CustomerSelectionModal';
import CustomerFormModal from './components/admin/CustomerFormModal';
import DiscountModal from './components/DiscountModal';
import PostPaymentConfirmationModal from './components/PostPaymentConfirmationModal';
import ReceiptPreviewModal from './components/ReceiptPreviewModal';
import { generateKitchenTicketHTML } from './utils/helpers';
import { TAX_RATE } from './constants';
import CustomerManagement from './components/admin/CustomerManagement';
import CustomerCountModal from './components/CustomerCountModal';

const App: React.FC = () => {
    // Local storage state
    const [waiters, setWaiters] = useLocalStorage<Waiter[]>('pos_waiters', mockWaiters);
    const [categories, setCategories] = useLocalStorage<Category[]>('pos_categories', mockCategories);
    const [menuItems, setMenuItems] = useLocalStorage<MenuItem[]>('pos_menu_items', mockMenuItems);
    const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('pos_inventory', mockInventory);
    const [orders, setOrders] = useLocalStorage<Order[]>('pos_orders', []);
    const [tables, setTables] = useLocalStorage<Table[]>('pos_tables', mockTables);
    const [areas, setAreas] = useLocalStorage<Area[]>('pos_areas', mockAreas);
    const [settings, setSettings] = useLocalStorage<RestaurantSettings>('pos_settings', mockSettings);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('pos_customers', mockCustomers);
    const [shifts, setShifts] = useLocalStorage<Shift[]>('pos_shifts', []);
    const [orderNumber, setOrderNumber] = useLocalStorage<number>('pos_order_number', 1);

    // App state
    const [currentWaiter, setCurrentWaiter] = useState<Waiter | null>(null);
    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const [currentScreen, setCurrentScreen] = useState<AppScreen>('table-selection');
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isOpeningBalanceModalOpen, setOpeningBalanceModalOpen] = useState(false);
    const [isCashMovementModalOpen, setCashMovementModalOpen] = useState(false);
    const [cashMovementType, setCashMovementType] = useState<'in' | 'out'>('in');
    const [isShiftSummaryModalOpen, setShiftSummaryModalOpen] = useState(false);
    const [openOrdersForShift, setOpenOrdersForShift] = useState<Order[]>([]);
    const [isCustomerSelectionModalOpen, setCustomerSelectionModalOpen] = useState(false);
    const [isCustomerFormModalOpen, setCustomerFormModalOpen] = useState(false);
    const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
    const [isPostPaymentModalOpen, setPostPaymentModalOpen] = useState(false);
    const [isReceiptPreviewModalOpen, setReceiptPreviewModalOpen] = useState(false);
    const [orderForReceipt, setOrderForReceipt] = useState<Order | null>(null);
    const [isCustomerCountModalOpen, setIsCustomerCountModalOpen] = useState(false);

    const lowStockItems = inventory.filter(item => item.quantity <= item.lowStockThreshold);

    const calculateTotals = useCallback((items: OrderItem[], discount?: { type: 'percentage' | 'fixed', value: number }): { subtotal: number, tax: number, total: number, discountAmount: number } => {
        const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        
        let discountAmount = 0;
        if (discount) {
            if (discount.type === 'percentage') {
                discountAmount = subtotal * (discount.value / 100);
            } else { // fixed
                discountAmount = Math.min(subtotal, discount.value);
            }
        }

        const discountedSubtotal = subtotal - discountAmount;
        const tax = discountedSubtotal * TAX_RATE;
        const total = discountedSubtotal + tax;
        
        return { subtotal, tax, total, discountAmount };
    }, []);

    useEffect(() => {
        if (currentOrder) {
            const { subtotal, tax, total, discountAmount } = calculateTotals(currentOrder.items, currentOrder.discount);
            setCurrentOrder(o => o ? { ...o, subtotal, tax, total, discount: o.discount ? {...o.discount, amount: discountAmount } : undefined } : null);
        }
    }, [currentOrder?.items, currentOrder?.discount, calculateTotals]);

    const handleLogin = (waiter: Waiter) => {
        setCurrentWaiter(waiter);
        const existingShift = shifts.find(s => s.waiterId === waiter.id && !s.endTime);
        if (existingShift) {
            setActiveShift(existingShift);
        } else if (waiter.role === 'ADMIN' || waiter.role === 'MANAGER') {
            setOpeningBalanceModalOpen(true);
        } else {
            // Waiters might not manage cash, auto-start shift
            handleStartShift(0);
        }
    };

    const handleLogout = () => {
        setCurrentWaiter(null);
        setActiveShift(null);
        setCurrentScreen('table-selection');
        setSelectedTableId(null);
        setCurrentOrder(null);
    };

    const handleStartShift = (startingBalance: number) => {
        if (!currentWaiter) return;
        const newShift: Shift = {
            id: `shift-${Date.now()}`,
            waiterId: currentWaiter.id,
            waiterName: currentWaiter.name,
            startTime: Date.now(),
            startingBalance,
            cashSales: 0,
            cardSales: 0,
            totalSales: 0,
            totalDiscounts: 0,
            expectedCash: startingBalance,
            cashIn: [],
            cashOut: [],
            orders: [],
        };
        setShifts(prev => [...prev, newShift]);
        setActiveShift(newShift);
        setOpeningBalanceModalOpen(false);
    };

    const handleEndShift = () => {
        if (!activeShift) return;
        const openShiftOrders = orders.filter(o => activeShift.orders.includes(o.id) && o.status === 'open');
        if (openShiftOrders.length > 0) {
            setOpenOrdersForShift(openShiftOrders);
            return;
        }
        setShiftSummaryModalOpen(true);
    };
    
    const handleConfirmEndShift = (actualCash: number) => {
        if (!activeShift) return;
        const totalCashIn = activeShift.cashIn.reduce((s, m) => s + m.amount, 0);
        const totalCashOut = activeShift.cashOut.reduce((s, m) => s + m.amount, 0);
        const expectedCash = activeShift.startingBalance + activeShift.cashSales + totalCashIn - totalCashOut;

        setShifts(prev => prev.map(s => s.id === activeShift.id ? {
            ...s,
            endTime: Date.now(),
            endingBalance: actualCash,
            actualCash,
            expectedCash,
            difference: actualCash - expectedCash,
        } : s));
        setShiftSummaryModalOpen(false);
        handleLogout();
    };


    const handleSelectTable = (tableId: number) => {
        const existingOrder = orders.find(o => o.tableNumber === tableId && o.status === 'open');
        if (existingOrder) {
            setCurrentOrder(existingOrder);
        } else {
             setIsCustomerCountModalOpen(true);
        }
        setSelectedTableId(tableId);
        setCurrentScreen('order');
    };

    const handleCreateOrder = (customerCount: number) => {
        if (!currentWaiter || !selectedTableId) return;
        const newOrder: Order = {
            id: `order-${Date.now()}`,
            orderNumber: orderNumber,
            tableNumber: selectedTableId,
            waiterId: currentWaiter.id,
            waiterName: currentWaiter.name,
            items: [],
            status: 'open',
            createdAt: Date.now(),
            subtotal: 0,
            tax: 0,
            total: 0,
            customerId: 'cust-1', // Default 'Cliente de Paso'
        };
        setOrders(prev => [...prev, newOrder]);
        setCurrentOrder(newOrder);
        setOrderNumber(prev => prev + 1);
        setIsCustomerCountModalOpen(false);
    };

    const handleAddItemToOrder = (item: MenuItem) => {
        if (!currentOrder) return;
        
        const existingItem = currentOrder.items.find(i => i.id === item.id);
        const newItemAddition: Addition = { addedAt: Date.now() };

        if (existingItem) {
            setCurrentOrder({
                ...currentOrder,
                items: currentOrder.items.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1, additions: [...i.additions, newItemAddition] } : i
                )
            });
        } else {
            setCurrentOrder({
                ...currentOrder,
                items: [...currentOrder.items, { ...item, quantity: 1, additions: [newItemAddition] }]
            });
        }
    };
    
    const handleUpdateQuantity = (itemId: string, change: number) => {
        if (!currentOrder) return;
        const item = currentOrder.items.find(i => i.id === itemId);
        if (!item) return;

        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
            // Remove item
            setCurrentOrder({
                ...currentOrder,
                items: currentOrder.items.filter(i => i.id !== itemId)
            });
        } else {
             const newAddition: Addition = { addedAt: Date.now() };
            // Update quantity
            setCurrentOrder({
                ...currentOrder,
                items: currentOrder.items.map(i =>
                    i.id === itemId ? { ...i, quantity: newQuantity, additions: change > 0 ? [...i.additions, newAddition] : i.additions } : i
                )
            });
        }
    };

    const handleSaveAndCloseOrder = () => {
        if (currentOrder) {
            const itemsToPrint = currentOrder.items.filter(item => {
                const lastPrintedVersion = currentOrder.lastPrintedItems?.find(lp => lp.id === item.id);
                return !lastPrintedVersion || item.quantity > lastPrintedVersion.quantity;
            });
            
            if (itemsToPrint.length > 0) {
                printKitchenTicket(currentOrder, itemsToPrint);
            }

            setOrders(prev => prev.map(o => o.id === currentOrder.id ? {...currentOrder, lastPrintedItems: [...currentOrder.items]} : o));
        }
        setCurrentOrder(null);
        setSelectedTableId(null);
        setCurrentScreen('table-selection');
    };

    const handleCancelOrder = () => {
        if (!currentOrder || !window.confirm("¿Seguro que quieres cancelar este pedido? Esta acción no se puede deshacer.")) return;
        setOrders(prev => prev.map(o => o.id === currentOrder.id ? {...o, status: 'cancelled', closedAt: Date.now()} : o));
        setCurrentOrder(null);
        setSelectedTableId(null);
        setCurrentScreen('table-selection');
    };
    
     const handleOpenDiscountModal = () => {
        if (currentOrder) {
            setDiscountModalOpen(true);
        }
    };

    const handleApplyDiscount = (value: number) => {
        if (currentOrder) {
            const newDiscount = { type: 'fixed' as const, value, amount: 0 }; // amount will be recalculated by effect
            setCurrentOrder({ ...currentOrder, discount: newDiscount });
        }
        setDiscountModalOpen(false);
    };

    const handleRemoveDiscount = () => {
        if (currentOrder) {
            setCurrentOrder({ ...currentOrder, discount: undefined });
        }
        setDiscountModalOpen(false);
    };
    

    const handleFinalizePayment = (order: Order, payments: Payment[]) => {
        const totalPaidInThisTransaction = payments.reduce((sum, p) => sum + p.amount, 0);
        const finalTotalPaid = (order.totalPaid || 0) + totalPaidInThisTransaction;
        
        const finalPayments = [...(order.splitPayments || []), ...payments];

        const updatedOrder: Order = {
            ...order,
            status: 'closed',
            closedAt: Date.now(),
            totalPaid: finalTotalPaid,
            splitPayments: finalPayments,
        };
        setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));

        // Update shift data
        if (activeShift) {
            const cashPaid = payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0);
            const cardPaid = payments.filter(p => p.method === 'card').reduce((sum, p) => sum + p.amount, 0);
            
            setShifts(prev => prev.map(s => s.id === activeShift.id ? {
                ...s,
                cashSales: s.cashSales + cashPaid,
                cardSales: s.cardSales + cardPaid,
                totalSales: s.totalSales + order.total,
                totalDiscounts: s.totalDiscounts + (order.discount?.amount || 0),
                orders: [...s.orders, order.id],
            } : s));
        }
        
        // Update customer credit if paid from credit
        if (payments.some(p => p.method === 'credit')) {
            const creditPayment = payments.find(p => p.method === 'credit');
            if (creditPayment && order.customerId) {
                setCustomers(prev => prev.map(c => 
                    c.id === order.customerId 
                    ? { ...c, creditBalance: c.creditBalance + creditPayment.amount } 
                    : c
                ));
            }
        }
        
        setPaymentModalOpen(false);
        setPostPaymentModalOpen(true);
        setOrderForReceipt(updatedOrder);
    };

    const handlePostPaymentClose = () => {
        setPostPaymentModalOpen(false);
        setOrderForReceipt(null);
        setCurrentOrder(null);
        setSelectedTableId(null);
        setCurrentScreen('table-selection');
    };
    
    const handlePrintReceipt = () => {
        if (orderForReceipt) {
            setReceiptPreviewModalOpen(true);
        }
    };
    
    const handleCreditPayment = (customerId: string, payment: Payment) => {
        setCustomers(prev => prev.map(c => c.id === customerId ? {
            ...c, creditBalance: Math.max(0, c.creditBalance - payment.amount)
        } : c))
    };


    const handleCashMovement = (type: 'in' | 'out') => {
        setCashMovementType(type);
        setCashMovementModalOpen(true);
    };
    
    const handleConfirmCashMovement = (amount: number, reason: string) => {
        if (!activeShift) return;
        const movement: CashMovement = {
            id: `cash-${Date.now()}`,
            timestamp: Date.now(),
            type: cashMovementType,
            amount,
            reason
        };
        
        setShifts(prev => prev.map(s => {
            if (s.id !== activeShift.id) return s;
            const updatedShift = {...s};
            if (cashMovementType === 'in') {
                updatedShift.cashIn = [...s.cashIn, movement];
            } else {
                updatedShift.cashOut = [...s.cashOut, movement];
            }
            setActiveShift(updatedShift);
            return updatedShift;
        }));
        
        setCashMovementModalOpen(false);
    };
    
    const handleUpdateCustomer = (customerData: Omit<Customer, 'id' | 'creditBalance'>) => {
        setCustomers(prev => [...prev, { ...customerData, id: `cust-${Date.now()}`, creditBalance: 0 }]);
        setCustomerFormModalOpen(false);
    };


    const printWithIframe = (htmlContent: string) => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write('<html><head><title>Print</title></head><body>' + htmlContent + '</body></html>');
            doc.close();
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        }

        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000); // Wait a bit before removing
    };
    
    const printKitchenTicket = (order: Order, itemsToPrint: OrderItem[]) => {
        const ticketHtml = generateKitchenTicketHTML({ ...order, items: itemsToPrint }, settings);
        printWithIframe(ticketHtml);
    };

    const kickDrawer = () => {
        // This is a common way to trigger a drawer kick on POS printers
        // It prints a tiny, invisible character.
        printWithIframe(`<div style="font-size:1px;">.</div>`);
    }

    const renderContent = () => {
        switch (currentScreen) {
            case 'table-selection':
                return <TableSelectionScreen tables={tables} areas={areas} orders={orders} onSelectTable={handleSelectTable} />;
            case 'order':
                return currentOrder && (
                    <div className="flex-1 flex overflow-hidden">
                        <Menu categories={categories} menuItems={menuItems} inventory={inventory} onAddItem={handleAddItemToOrder} />
                        <CurrentOrder 
                            order={currentOrder}
                            customers={customers}
                            onUpdateQuantity={handleUpdateQuantity}
                            onPay={() => setPaymentModalOpen(true)}
                            onSave={handleSaveAndCloseOrder}
                            onPrint={() => { setOrderForReceipt(currentOrder); setReceiptPreviewModalOpen(true); }}
                            onCancel={handleCancelOrder}
                            onOpenCustomerModal={() => setCustomerSelectionModalOpen(true)}
                            onOpenDiscountModal={handleOpenDiscountModal}
                            waiterRole={currentWaiter!.role}
                        />
                    </div>
                );
            case 'admin':
                return <AdminView 
                    categories={categories} setCategories={setCategories}
                    menuItems={menuItems} setMenuItems={setMenuItems}
                    waiters={waiters} setWaiters={setWaiters}
                    inventory={inventory} setInventory={setInventory}
                    settings={settings} setSettings={setSettings}
                    tables={tables} setTables={setTables}
                    areas={areas} setAreas={setAreas}
                    shifts={shifts} setShifts={setShifts}
                    orders={orders} setOrders={setOrders}
                    customers={customers} setCustomers={setCustomers}
                    currentUserRole={currentWaiter!.role}
                    onCreditPayment={handleCreditPayment}
                />;
             case 'manager':
                return <ManagerDashboard
                    activeShift={activeShift}
                    onCashMovement={handleCashMovement}
                    inventory={inventory}
                    setInventory={setInventory}
                    menuItems={menuItems}
                    setMenuItems={setMenuItems}
                    currentUserRole={currentWaiter!.role}
                />;
             case 'customers':
                return <div className="p-8 flex-1 overflow-y-auto"><CustomerManagement customers={customers} onUpdateCustomers={setCustomers} onCreditPayment={handleCreditPayment} /></div>;
            default:
                return <TableSelectionScreen tables={tables} areas={areas} orders={orders} onSelectTable={handleSelectTable} />;
        }
    }

    if (!currentWaiter) {
        return <WaiterSelectionScreen waiters={waiters} onSelect={handleLogin} settings={settings} />;
    }

    return (
        <div className="w-screen h-screen bg-gray-800 text-white flex flex-col font-sans">
            <Header
                waiter={currentWaiter}
                tableNumber={selectedTableId ? (tables.find(t => t.id === selectedTableId)?.name ? parseInt(tables.find(t => t.id === selectedTableId)!.name.replace(/[^0-9]/g, ''), 10) : selectedTableId) : undefined}
                onLogout={handleLogout}
                onKickDrawer={kickDrawer}
                onNavigate={(view) => {setCurrentScreen(view); setCurrentOrder(null);}}
                currentView={currentScreen}
                onEndShift={handleEndShift}
                lowStockItems={lowStockItems}
            />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar onNavigate={(view) => {setCurrentScreen(view); setCurrentOrder(null);}} currentView={currentScreen} userRole={currentWaiter.role} />
                {renderContent()}
            </div>
            
            {/* Modals */}
            {isPaymentModalOpen && currentOrder &&
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    order={currentOrder}
                    customers={customers}
                    onFinalizePayment={handleFinalizePayment}
                    onPartialPayment={() => { /* Not implemented for now */ }}
                />
            }
             {isOpeningBalanceModalOpen && <OpeningBalanceModal onClose={handleLogout} onConfirm={handleStartShift} />}
             {isCashMovementModalOpen && <CashMovementModal isOpen={isCashMovementModalOpen} onClose={() => setCashMovementModalOpen(false)} type={cashMovementType} onConfirm={handleConfirmCashMovement} />}
             {isShiftSummaryModalOpen && activeShift && <ShiftSummaryModal isOpen={isShiftSummaryModalOpen} onClose={() => setShiftSummaryModalOpen(false)} shift={activeShift} onConfirm={handleConfirmEndShift} />}
             {openOrdersForShift.length > 0 && <OpenOrdersWarningModal isOpen={true} onClose={() => setOpenOrdersForShift([])} openOrders={openOrdersForShift} />}
             {isCustomerSelectionModalOpen && currentOrder && <CustomerSelectionModal isOpen={isCustomerSelectionModalOpen} onClose={() => setCustomerSelectionModalOpen(false)} customers={customers} onSelectCustomer={(id) => {setCurrentOrder(o => o ? {...o, customerId: id || 'cust-1'} : null); setCustomerSelectionModalOpen(false);}} onAddNewCustomer={() => { setCustomerSelectionModalOpen(false); setCustomerFormModalOpen(true); }} />}
             {isCustomerFormModalOpen && <CustomerFormModal isOpen={isCustomerFormModalOpen} onClose={() => {setCustomerFormModalOpen(false); setCustomerSelectionModalOpen(true);}} onSave={handleUpdateCustomer} customer={null}/>}
             {isDiscountModalOpen && currentOrder && <DiscountModal isOpen={isDiscountModalOpen} onClose={() => setDiscountModalOpen(false)} order={currentOrder} onApply={handleApplyDiscount} onRemove={handleRemoveDiscount} />}
             {isPostPaymentModalOpen && <PostPaymentConfirmationModal isOpen={isPostPaymentModalOpen} onClose={handlePostPaymentClose} onPrint={handlePrintReceipt} />}
             {isReceiptPreviewModalOpen && orderForReceipt && <ReceiptPreviewModal isOpen={isReceiptPreviewModalOpen} onClose={() => setReceiptPreviewModalOpen(false)} order={orderForReceipt} settings={settings} />}
             {isCustomerCountModalOpen && <CustomerCountModal isOpen={isCustomerCountModalOpen} onClose={() => {setIsCustomerCountModalOpen(false); setSelectedTableId(null); setCurrentScreen('table-selection');}} onConfirm={handleCreateOrder} />}
        </div>
    );
};

export default App;
