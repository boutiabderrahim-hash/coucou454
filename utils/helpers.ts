import { Order, RestaurantSettings } from "../types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const textToThermal = (text: string) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
const generateDashedLine = (width = 32) => '-'.repeat(width) + '\n';
const padLine = (left: string, right: string, width = 32): string => {
    const spaceCount = Math.max(1, width - left.length - right.length);
    return left + ' '.repeat(spaceCount) + right + '\n';
};
const centerText = (text: string, width = 32): string => {
    const padding = Math.floor((width - text.length) / 2);
    return ' '.repeat(padding > 0 ? padding : 0) + text + '\n';
}

export const generateReceiptHTML = (order: Order, settings: RestaurantSettings): string => {
    const width = 32;
    let content = '';

    // Header
    if(settings.name) content += centerText(settings.name, width);
    if(settings.address) content += centerText(settings.address, width);
    if(settings.phone) content += centerText(settings.phone, width);
    content += generateDashedLine(width);

    // Order Info
    const date = new Date(order.closedAt || order.createdAt);
    content += `Fecha: ${date.toLocaleString('es-ES')}\n`;
    content += `Mesa: ${order.tableNumber} | Cam: ${textToThermal(order.waiterName)}\n`;
    content += `Pedido No: ${order.orderNumber}\n`;
    content += generateDashedLine(width);

    // Items
    order.items.forEach(item => {
        const itemTotal = formatCurrency(item.price * item.quantity);
        content += `${item.quantity}x ${textToThermal(item.name)}\n`;
        content += padLine(`  (${formatCurrency(item.price)})`, itemTotal, width);
    });
    content += generateDashedLine(width);

    // Totals
    const subtotalText = order.total / (1 + 0.21); // Recalculate pre-tax subtotal for display
    content += padLine('Base Imponible:', formatCurrency(subtotalText), width);
    if (order.discount && order.discount.amount > 0) {
        content += padLine('DESCUENTO:', `-${formatCurrency(order.discount.amount)}`, width);
    }
    content += padLine('IVA (21%):', formatCurrency(order.tax), width);
    content += generateDashedLine(width);
    content += padLine('TOTAL:', formatCurrency(order.total), width);
    content += generateDashedLine(width);

    // Payments
    if (order.splitPayments && order.splitPayments.length > 0) {
        order.splitPayments.forEach(p => {
            const method = p.method === 'cash' ? 'Efectivo' : p.method === 'card' ? 'Tarjeta' : 'Credito';
            content += padLine(`${method}:`, formatCurrency(p.amount), width);
        });
        const totalPaid = order.splitPayments.reduce((sum, p) => sum + p.amount, 0);
        const change = totalPaid - order.total;
        if (change > 0.005) {
             content += padLine('CAMBIO:', formatCurrency(change), width);
        }
        content += generateDashedLine(width);
    }

    // Footer
    if (settings.footer) {
        content += centerText(settings.footer, width);
    }

    return `<pre style="font-family: 'Courier New', monospace; font-size: 10pt; color: black; margin: 0; padding: 5px; width: 300px; line-height: 1.2;">${textToThermal(content)}</pre>`;
};


export const generateKitchenTicketHTML = (order: Order, settings: RestaurantSettings): string => {
    const { kitchenTicket } = settings;
    let html = `<div style="font-family: 'Courier New', monospace; font-size: 14px; font-weight: bold; color: black; max-width: 300px; padding: 5px;">`;
    
    html += `<div style="text-align: center; font-size: 18px; margin-bottom: 5px;">${textToThermal(kitchenTicket.title)}</div>`;
    
    if (kitchenTicket.showTable) html += `<p style="margin: 2px 0; font-size: 16px;">MESA: ${order.tableNumber}</p>`;
    if (kitchenTicket.showWaiter) html += `<p style="margin: 2px 0;">CAMARERO: ${textToThermal(order.waiterName)}</p>`;
    if (kitchenTicket.showTime) html += `<p style="margin: 2px 0;">HORA: ${new Date(order.createdAt).toLocaleTimeString('es-ES')}</p>`;
    
    html += '<div style="border-top: 1px dashed black; margin: 4px 0;"></div>';
    
    order.items.forEach(item => {
        html += `<p style="margin: 5px 0; font-size: 18px;">${item.quantity}x ${textToThermal(item.name)}</p>`;
    });

    html += '<div style="border-top: 1px dashed black; margin: 4px 0;"></div>';
    
    if (kitchenTicket.footer) {
        html += `<div style="text-align: center; margin-top: 5px;">${textToThermal(kitchenTicket.footer)}</div>`;
    }
    
    html += `</div>`;
    return html;
};


export const generateCashDrawerKickHTML = (): string => {
    // This minimal content is enough to trigger most POS printer drivers to open the drawer.
    // It's designed to be as small and fast as possible, often printing nothing visible.
    return `<div style="font-size:1px;">.</div>`;
};