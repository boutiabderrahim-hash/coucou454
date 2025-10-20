import React, { useState, useEffect, useMemo } from 'react';
import { AppScreen, Waiter, Table, Order, Category, MenuItem, InventoryItem, RestaurantSettings, Area, Shift, CashMovement, Customer, OrderItem, Payment, Discount } from './types';
import { useLocalStorage } from './utils/hooks';
import { mockWaiters, mockCategories, mockMenuItems, mockInventory, mockTables, mockAreas, mockCustomers, mockSettings } from './data/mockData';
import { TAX_RATE } from './constants';
import WaiterSelectionScreen from './components/WaiterSelectionScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TableSelectionScreen from './components/TableSelectionScreen';
import Menu from './components/Menu';
import CurrentOrder from './components/CurrentOrder';
import AdminView from './components/admin/AdminView';
import OpeningBalanceModal from './components/OpeningBalanceModal';
import ManagerDashboard from './components/admin/ManagerDashboard';
import CashMovementModal from './components/admin/CashMovementModal';
import OpenOrdersWarningModal from './components/OpenOrdersWarningModal';
import ShiftSummaryModal from './components/admin/ShiftSummaryModal';
import PaymentModal from './components/PaymentModal';
import CustomerSelectionModal from './components/CustomerSelectionModal';
import CustomerManagement from './components/admin/CustomerManagement';
import CustomerFormModal from './components/admin/CustomerFormModal';
import PostPaymentConfirmationModal from './components/PostPaymentConfirmationModal';
import ReceiptPreviewModal from './components/ReceiptPreviewModal';
import DiscountModal from './components/DiscountModal';
import ConfirmationModal from './components/ConfirmationModal';
import { generateKitchenTicketHTML, generateCashDrawerKickHTML } from './utils/helpers';

const App: React.FC = () => {
    // State management using local storage for persistence
    const [waiters, setWaiters] = useLocalStorage<Waiter[]>('pos-waiters', mockWaiters);
    const [categories, setCategories] = useLocalStorage<Category[]>('pos-categories', mockCategories);
    const [menuItems, setMenuItems] = useLocalStorage<MenuItem[]>('pos-menuItems', mockMenuItems);
    const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('pos-inventory', mockInventory);
    const [tables, setTables] = useLocalStorage<Table[]>('pos-tables', mockTables);
    const [areas, setAreas] = useLocalStorage<Area[]>('pos-areas', mockAreas);
    const [settings, setSettings] = useLocalStorage<RestaurantSettings>('pos-settings', mockSettings);
    const [orders, setOrders] = useLocalStorage<Order[]>('pos-orders', []);
    const [shifts, setShifts] = useLocalStorage<Shift[]>('pos-shifts', []);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('pos-customers', mockCustomers);
    const [orderNumber, setOrderNumber] = useLocalStorage<number>('pos-orderNumber', 1);
    
    // Application runtime state
    const [loggedInWaiter, setLoggedInWaiter] = useState<Waiter | null>(null);
    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const [currentView, setCurrentView] = useState<AppScreen>('table-selection');
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    
    // Modal visibility state
    const [isOpeningBalanceModalOpen, setOpeningBalanceModalOpen] = useState(false);
    const [isCashMovementModalOpen, setCashMovementModalOpen] = useState(false);
    const [cashMovementType, setCashMovementType] = useState<'in' | 'out'>('in');
    const [isShiftSummaryModalOpen, setShiftSummaryModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [isCustomerFormModalOpen, setCustomerFormModalOpen] = useState(false);
    const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
    const [isPostPaymentModalOpen, setPostPaymentModalOpen] = useState(false);
    const [isDiscountModalOpen, setDiscountModalOpen] = useState(false);
    const [isCancelConfirmModalOpen, setCancelConfirmModalOpen] = useState(false);
    const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
    const [isEndShiftWarningOpen, setEndShiftWarningOpen] = useState(false);

    const lowStockItems = useMemo(() => {
        return inventory.filter(item => item.quantity <= item.lowStockThreshold);
    }, [inventory]);

    // Derived State
    const openOrders = useMemo(() => orders.filter(o => o.status === 'open'), [orders]);

    // Effects
    useEffect(() => {
        if (!loggedInWaiter) {
            setActiveShift(null);
            setCurrentView('table-selection');
            setSelectedTableId(null);
            setCurrentOrder(null);
        } else {
             // Find the single active shift for the day, not per waiter
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const activeShiftForDay = shifts.find(s => s.startTime >= todayStart.getTime() && !s.endTime);

            if (activeShiftForDay) {
                setActiveShift(activeShiftForDay);
            } else {
                setOpeningBalanceModalOpen(true);
            }
        }
    }, [loggedInWaiter, shifts]);

    useEffect(() => {
        if(selectedTableId) {
            const existingOrder = orders.find(o => o.tableNumber === selectedTableId && o.status === 'open');
            if (existingOrder) {
                setCurrentOrder(existingOrder);
            } else {
                const newOrder: Order = {
                    id: `order-${Date.now()}`,
                    orderNumber: orderNumber,
                    tableNumber: selectedTableId,
                    waiterId: loggedInWaiter!.id,
                    waiterName: loggedInWaiter!.name,
                    items: [],
                    status: 'open',
                    createdAt: Date.now(),
                    subtotal: 0,
                    tax: 0,
                    total: 0,
                    lastPrintedItems: [],
                };
                setCurrentOrder(newOrder);
                setOrders(prev => [...prev, newOrder]);
                setOrderNumber(prev => prev + 1);
            }
            setCurrentView('order');
        } else {
            setCurrentOrder(null);
        }
    }, [selectedTableId, orders, loggedInWaiter, orderNumber, setOrderNumber, setOrders]);

    // -- Printing Logic --
    const printContent = (htmlContent: string, containerId: string) => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = htmlContent;
            window.print();
            container.innerHTML = '';
        } else {
            console.error(`Print container with id "${containerId}" not found.`);
        }
    };
    
    const handleKickDrawer = () => {
        const kickHTML = generateCashDrawerKickHTML();
        printContent(kickHTML, 'cash-drawer-kick-container');
    };

    // Handlers
    const handleLogin = (waiter: Waiter) => {
        setLoggedInWaiter(waiter);
    };

    const handleLogout = () => {
        setLoggedInWaiter(null);
    };

    const handleStartShift = (startingBalance: number) => {
        if (!loggedInWaiter) return;
        const newShift: Shift = {
            id: `shift-${Date.now()}`,
            waiterId: loggedInWaiter.id,
            waiterName: loggedInWaiter.name,
            startTime: Date.now(),
            startingBalance,
            cashSales: 0,
            cardSales: 0,
            totalSales: 0,
            totalDiscounts: 0,
            expectedCash: startingBalance,
            cashIn: [],
            cashOut: [],
            orders: []
        };
        setShifts(prev => [...prev, newShift]);
        setActiveShift(newShift);
        setOpeningBalanceModalOpen(false);
    };

    const handleEndShift = () => {
        if (openOrders.length > 0) {
            setEndShiftWarningOpen(true);
            return;
        }
        setShiftSummaryModalOpen(true);
    };

    const handleConfirmEndShift = (actualCash: number) => {
        if (!activeShift) return;
        const shiftToEnd = {
            ...activeShift,
            endTime: Date.now(),
            actualCash: actualCash,
            difference: actualCash - activeShift.expectedCash,
        };
        setActiveShift(null);
        setShifts(prev => prev.map(s => s.id === shiftToEnd.id ? shiftToEnd : s));
        setShiftSummaryModalOpen(false);
        handleLogout();
    };

    // Fix: Corrected discount logic to handle different discount types, ensure values are numeric, and recalculate tax correctly after applying a discount. This resolves the arithmetic error and fixes accounting inaccuracies.
    const updateOrderTotals = (order: Order): Order => {
        const subtotalBeforeDiscount = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        let discountAmount = 0;
        if (order.discount) {
            const discountValue = Number(order.discount.value) || 0;
            if (order.discount.type === 'percentage') {
                discountAmount = subtotalBeforeDiscount * (discountValue / 100);
            } else { // 'fixed'
                discountAmount = discountValue;
            }
        }
        
        // Ensure discount doesn't exceed the total
        discountAmount = Math.min(subtotalBeforeDiscount, discountAmount);
        
        const finalTotal = subtotalBeforeDiscount - discountAmount;
        
        // Recalculate tax based on the new total
        const finalTax = finalTotal > 0 ? finalTotal - (finalTotal / (1 + TAX_RATE)) : 0;
        const finalSubtotal = finalTotal - finalTax;
        
        return { 
            ...order, 
            subtotal: finalSubtotal,
            tax: finalTax, 
            total: finalTotal, 
            discount: order.discount ? {...order.discount, amount: discountAmount} : undefined 
        };
    };

    const handleAddItemToOrder = (item: MenuItem) => {
        if (!currentOrder) return;
        const existingItem = currentOrder.items.find(i => i.id === item.id);
        let updatedItems;
        if (existingItem) {
            updatedItems = currentOrder.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1, additions: [...i.additions, { addedAt: Date.now() }] } : i);
        } else {
            updatedItems = [...currentOrder.items, { ...item, quantity: 1, additions: [{ addedAt: Date.now() }] }];
        }
        const updatedOrder = updateOrderTotals({ ...currentOrder, items: updatedItems });
        setCurrentOrder(updatedOrder);
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    };

    const handleUpdateQuantity = (itemId: string, change: number) => {
        if (!currentOrder) return;
        const item = currentOrder.items.find(i => i.id === itemId);
        if (!item) return;

        let updatedItems;
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
            updatedItems = currentOrder.items.filter(i => i.id !== itemId);
        } else {
            updatedItems = currentOrder.items.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i);
        }

        const updatedOrder = updateOrderTotals({ ...currentOrder, items: updatedItems });
        setCurrentOrder(updatedOrder);
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    };

    const handleSaveAndCloseOrderView = () => {
        if (!currentOrder) {
            setSelectedTableId(null);
            setCurrentView('table-selection');
            return;
        }

        // --- Smart Kitchen Ticket Logic ---
        // Compare current items with the last printed items to find what's new.
        const lastItemsMap = new Map((currentOrder.lastPrintedItems || []).map(item => [item.id, item.quantity]));
        const itemsToPrint: OrderItem[] = [];

        currentOrder.items.forEach(currentItem => {
            const lastQuantity = lastItemsMap.get(currentItem.id) || 0;
            if (currentItem.quantity > lastQuantity) {
                // Only print new additions, not cancellations
                itemsToPrint.push({
                    ...currentItem,
                    quantity: currentItem.quantity - lastQuantity,
                });
            }
        });

        // If there are new items, generate and print the ticket
        if (itemsToPrint.length > 0) {
            const ticketOrder: Order = {
                ...currentOrder,
                items: itemsToPrint,
            };
            const kitchenTicketHTML = generateKitchenTicketHTML(ticketOrder, settings);
            printContent(kitchenTicketHTML, 'kitchen-ticket-print-container');
        }

        // After printing, update the order's state to reflect the new "last printed" state.
        const updatedOrderWithPrintState = {
            ...currentOrder,
            // Deep copy to prevent reference issues
            lastPrintedItems: JSON.parse(JSON.stringify(currentOrder.items)),
        };
        
        setCurrentOrder(updatedOrderWithPrintState);
        setOrders(prev => prev.map(o => o.id === updatedOrderWithPrintState.id ? updatedOrderWithPrintState : o));
        
        setSelectedTableId(null);
        setCurrentView('table-selection');
    };

    const handleFinalizePayment = (order: Order, payments: Payment[]) => {
        const closedOrder = {
            ...order,
            status: 'closed' as const,
            closedAt: Date.now(),
            totalPaid: (order.totalPaid || 0) + payments.reduce((sum, p) => sum + p.amount, 0),
            splitPayments: [...(order.splitPayments || []), ...payments]
        };
        setOrders(prev => prev.map(o => o.id === closedOrder.id ? closedOrder : o));

        if (activeShift) {
            const cashPayment = payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0);
            const cardPayment = payments.filter(p => p.method === 'card').reduce((sum, p) => sum + p.amount, 0);
            const creditPayment = payments.filter(p => p.method === 'credit').reduce((sum, p) => sum + p.amount, 0);
            
            if (cashPayment > 0) {
                handleKickDrawer();
            }

            setActiveShift(prev => {
                if (!prev) return null;
                const newShift: Shift = {
                    ...prev,
                    cashSales: prev.cashSales + cashPayment,
                    cardSales: prev.cardSales + cardPayment,
                    totalSales: prev.totalSales + cashPayment + cardPayment + creditPayment,
                    totalDiscounts: prev.totalDiscounts + (closedOrder.discount?.amount || 0),
                    expectedCash: prev.expectedCash + cashPayment,
                    orders: [...prev.orders, closedOrder.id],
                };
                setShifts(shifts.map(s => s.id === newShift.id ? newShift : s));
                return newShift;
            });
            
            if (creditPayment > 0 && closedOrder.customerId) {
                handleCreditPayment(closedOrder.customerId, {method: 'credit', amount: creditPayment});
            }
        }
        
        setOrderToPrint(closedOrder);
        setPaymentModalOpen(false);
        setPostPaymentModalOpen(true);
    };

    const handleCancelOrder = () => {
        if (!currentOrder) return;
        const cancelledOrder = { ...currentOrder, status: 'cancelled' as const, closedAt: Date.now() };
        setOrders(prev => prev.map(o => o.id === cancelledOrder.id ? cancelledOrder : o));
        setSelectedTableId(null);
        setCurrentView('table-selection');
        setCancelConfirmModalOpen(false);
    };
    
    const handleCreditPayment = (customerId: string, payment: Payment) => {
        setCustomers(prev => prev.map(c => {
            if (c.id === customerId) {
                return {
                    ...c,
                    creditBalance: c.creditBalance + (payment.method === 'credit' ? payment.amount : -payment.amount)
                }
            }
            return c;
        }))
    };
    
    const handleApplyDiscount = (type: 'fixed', value: number) => {
        if (!currentOrder) return;
        const discount: Discount = { type, value, amount: 0 };
        const orderWithDiscount = { ...currentOrder, discount };
        const updatedOrder = updateOrderTotals(orderWithDiscount);
        setCurrentOrder(updatedOrder);
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setDiscountModalOpen(false);
    };

    const handleRemoveDiscount = () => {
        if (!currentOrder) return;
        const { discount, ...orderWithoutDiscount } = currentOrder;
        const updatedOrder = updateOrderTotals(orderWithoutDiscount);
        setCurrentOrder(updatedOrder);
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setDiscountModalOpen(false);
    }
    
    const handleCashMovement = (amount: number, reason: string) => {
        if (!activeShift) return;
        const movement: CashMovement = { id: `mov-${Date.now()}`, timestamp: Date.now(), type: cashMovementType, amount, reason };
        
        setActiveShift(prev => {
            if (!prev) return null;
            const newShift: Shift = {
                ...prev,
                cashIn: cashMovementType === 'in' ? [...prev.cashIn, movement] : prev.cashIn,
                cashOut: cashMovementType === 'out' ? [...prev.cashOut, movement] : prev.cashOut,
                expectedCash: cashMovementType === 'in' ? prev.expectedCash + amount : prev.expectedCash - amount,
            };
            setShifts(shifts.map(s => s.id === newShift.id ? newShift : s));
            return newShift;
        });
        setCashMovementModalOpen(false);
    };

    // Render logic
    if (!loggedInWaiter) {
        return <WaiterSelectionScreen waiters={waiters} onSelect={handleLogin} settings={settings} />;
    }

    const renderScreen = () => {
        switch (currentView) {
            case 'table-selection':
                return <TableSelectionScreen tables={tables} areas={areas} orders={orders} onSelectTable={setSelectedTableId} />;
            case 'order':
                if (currentOrder) {
                    return (
                        <div className="flex-1 flex min-h-0">
                            <Menu categories={categories} menuItems={menuItems} inventory={inventory} onAddItem={handleAddItemToOrder} />
                            <CurrentOrder 
                                order={currentOrder} 
                                customers={customers}
                                onUpdateQuantity={handleUpdateQuantity}
                                onPay={() => {
                                    if(currentOrder.total <= 0 && currentOrder.items.length > 0) {
                                        handleFinalizePayment(currentOrder, []);
                                    } else {
                                        setPaymentModalOpen(true);
                                    }
                                }}
                                onSave={handleSaveAndCloseOrderView}
                                onPrint={() => {setOrderToPrint(currentOrder); setReceiptModalOpen(true)}}
                                onCancel={() => setCancelConfirmModalOpen(true)}
                                onOpenCustomerModal={() => setCustomerModalOpen(true)}
                                onOpenDiscountModal={() => setDiscountModalOpen(true)}
                                waiterRole={loggedInWaiter.role}
                            />
                        </div>
                    );
                }
                return null;
            case 'admin':
            case 'manager':
                const ViewComponent = currentView === 'admin' ? AdminView : ManagerDashboard;
                 return (
                    <ViewComponent
                        // AdminView & ManagerDashboard props
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
                        currentUserRole={loggedInWaiter.role}
                        onCreditPayment={handleCreditPayment}
                        // ManagerDashboard specific props
                        activeShift={activeShift}
                        onCashMovement={(type) => {setCashMovementType(type); setCashMovementModalOpen(true);}}
                    />
                );
            case 'customers':
                return <CustomerManagement customers={customers} onUpdateCustomers={setCustomers} onCreditPayment={handleCreditPayment} />;
            default:
                return <TableSelectionScreen tables={tables} areas={areas} orders={orders} onSelectTable={setSelectedTableId} />;
        }
    };

    return (
        <div className="bg-gray-800 text-white h-screen flex flex-col font-sans">
            <Header 
                waiter={loggedInWaiter} 
                tableNumber={selectedTableId || undefined}
                onLogout={handleLogout}
                onKickDrawer={handleKickDrawer}
                onNavigate={setCurrentView}
                currentView={currentView}
                onEndShift={handleEndShift}
                lowStockItems={lowStockItems}
            />
            <main className="flex-1 flex min-h-0">
                <Sidebar onNavigate={setCurrentView} currentView={currentView} userRole={loggedInWaiter.role} />
                {renderScreen()}
            </main>
            {isOpeningBalanceModalOpen && loggedInWaiter && (
                <OpeningBalanceModal 
                    onClose={() => setLoggedInWaiter(null)} 
                    onConfirm={handleStartShift}
                />
            )}
            {isCashMovementModalOpen && (
                <CashMovementModal 
                    isOpen={isCashMovementModalOpen}
                    onClose={() => setCashMovementModalOpen(false)}
                    type={cashMovementType}
                    onConfirm={handleCashMovement}
                />
            )}
            {isEndShiftWarningOpen && (
                <OpenOrdersWarningModal
                    isOpen={isEndShiftWarningOpen}
                    onClose={() => setEndShiftWarningOpen(false)}
                    openOrders={openOrders}
                />
            )}
            {isShiftSummaryModalOpen && activeShift && (
                <ShiftSummaryModal 
                    isOpen={isShiftSummaryModalOpen}
                    onClose={() => setShiftSummaryModalOpen(false)}
                    shift={activeShift}
                    onConfirm={handleConfirmEndShift}
                />
            )}
            {isPaymentModalOpen && currentOrder && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    order={currentOrder}
                    customers={customers}
                    onFinalizePayment={handleFinalizePayment}
                    onPartialPayment={handleFinalizePayment} // Treat partial as final for now
                />
            )}
            {isCustomerModalOpen && currentOrder && (
                <CustomerSelectionModal
                    isOpen={isCustomerModalOpen}
                    onClose={() => setCustomerModalOpen(false)}
                    customers={customers}
                    onSelectCustomer={(customerId) => {
                        const updatedOrder = {...currentOrder, customerId: customerId || undefined };
                        setCurrentOrder(updatedOrder);
                        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                        setCustomerModalOpen(false);
                    }}
                    onAddNewCustomer={() => { setCustomerModalOpen(false); setCustomerFormModalOpen(true); }}
                />
            )}
             {isCustomerFormModalOpen && (
                <CustomerFormModal
                    isOpen={isCustomerFormModalOpen}
                    onClose={() => setCustomerFormModalOpen(false)}
                    onSave={(customerData) => {
                        const newCustomer = { ...customerData, id: `cust-${Date.now()}`, creditBalance: 0 };
                        setCustomers(prev => [...prev, newCustomer]);
                        if(currentOrder) {
                            const updatedOrder = {...currentOrder, customerId: newCustomer.id };
                            setCurrentOrder(updatedOrder);
                            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
                        }
                        setCustomerFormModalOpen(false);
                    }}
                    customer={null}
                />
            )}
            {isReceiptModalOpen && orderToPrint && (
                <ReceiptPreviewModal
                    isOpen={isReceiptModalOpen}
                    onClose={() => setReceiptModalOpen(false)}
                    order={orderToPrint}
                    settings={settings}
                />
            )}
            {isPostPaymentModalOpen && (
                <PostPaymentConfirmationModal 
                    isOpen={isPostPaymentModalOpen}
                    onClose={() => {
                        setPostPaymentModalOpen(false);
                        setSelectedTableId(null);
                        setCurrentView('table-selection');
                    }}
                    onPrint={() => {
                        setPostPaymentModalOpen(false);
                        setReceiptModalOpen(true);
                    }}
                />
            )}
            {isDiscountModalOpen && currentOrder && (
                <DiscountModal
                    isOpen={isDiscountModalOpen}
                    onClose={() => setDiscountModalOpen(false)}
                    onApply={(value) => handleApplyDiscount('fixed', value)}
                    onRemove={handleRemoveDiscount}
                    order={currentOrder}
                />
            )}
             {isCancelConfirmModalOpen && (
                <ConfirmationModal
                    isOpen={isCancelConfirmModalOpen}
                    onClose={() => setCancelConfirmModalOpen(false)}
                    title="Cancelar Pedido"
                    message="¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer."
                    onConfirm={handleCancelOrder}
                    confirmText="Sí, Cancelar Pedido"
                />
            )}
        </div>
    );
};

export default App;