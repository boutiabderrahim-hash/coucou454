import { Order, RestaurantSettings } from "../types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

const textToThermal = (text: string) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

const generateDashedLine = () => '<div style="border-top: 1px dashed black; margin: 4px 0;"></div>';

export const generateReceiptHTML = (order: Order, settings: RestaurantSettings): string => {
    let html = `<div style="font-family: 'Courier New', monospace; font-size: 12px; color: black; max-width: 300px; padding: 5px;">`;
    
    html += `<div style="text-align: center;">`;
    if (settings.logoUrl) {
      // Note: Most thermal printers don't render images well from URLs. A base64 encoded, dithered image would be better if needed.
      // For simplicity, we omit it, but a text-based logo could be an option.
    }
    html += `<h1 style="font-size: 16px; font-weight: bold; margin: 0;">${textToThermal(settings.name)}</h1>`;
    html += `<p style="margin: 2px 0;">${textToThermal(settings.address)}</p>`;
    html += `<p style="margin: 2px 0;">${textToThermal(settings.phone)}</p>`;
    html += `</div>`;
    
    html += generateDashedLine();
    
    const date = new Date(order.closedAt || order.createdAt);
    html += `<p style="margin: 2px 0;">Fecha: ${date.toLocaleDateString('es-ES')} ${date.toLocaleTimeString('es-ES')}</p>`;
    html += `<p style="margin: 2px 0;">Mesa: ${order.tableNumber} | Camarero: ${textToThermal(order.waiterName)}</p>`;
    html += `<p style="margin: 2px 0;">Pedido Nº: ${order.orderNumber}</p>`;
    
    html += generateDashedLine();
    
    html += `<table><tbody>`;
    order.items.forEach(item => {
        html += `<tr>
            <td colspan="3" style="padding-top: 4px;">${item.quantity}x ${textToThermal(item.name)}</td>
            <td style="text-align: right; padding-top: 4px;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
    
    html += generateDashedLine();
    
    html += `<div style="display: flex; justify-content: space-between;"><span>SUBTOTAL:</span> <strong>${formatCurrency(order.subtotal)}</strong></div>`;
    if (order.discount && order.discount.amount > 0) {
        html += `<div style="display: flex; justify-content: space-between;"><span>DESCUENTO:</span> <strong>-${formatCurrency(order.discount.amount)}</strong></div>`;
    }
    html += `<div style="display: flex; justify-content: space-between;"><span>IVA (21%):</span> <strong>${formatCurrency(order.tax)}</strong></div>`;
    html += `<div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 4px;"><span>TOTAL:</span> <strong>${formatCurrency(order.total)}</strong></div>`;

    if (order.splitPayments && order.splitPayments.length > 0) {
        html += generateDashedLine();
        order.splitPayments.forEach(p => {
            const method = p.method === 'cash' ? 'Efectivo' : p.method === 'card' ? 'Tarjeta' : 'Crédito';
            html += `<div style="display: flex; justify-content: space-between;"><span>${method}:</span> <span>${formatCurrency(p.amount)}</span></div>`;
        });
    }

    html += generateDashedLine();

    html += `<div style="text-align: center; margin-top: 5px;">`;
    if (settings.footer) {
        html += `<p style="margin: 0;">${textToThermal(settings.footer)}</p>`;
    }
    html += `</div>`;
    
    html += `</div>`;
    return html;
};

export const generateKitchenTicketHTML = (order: Order, settings: RestaurantSettings): string => {
    const { kitchenTicket } = settings;
    let html = `<div style="font-family: 'Courier New', monospace; font-size: 14px; font-weight: bold; color: black; max-width: 300px; padding: 5px;">`;
    
    html += `<div style="text-align: center; font-size: 18px; margin-bottom: 5px;">${textToThermal(kitchenTicket.title)}</div>`;
    
    if (kitchenTicket.showTable) html += `<p style="margin: 2px 0; font-size: 16px;">MESA: ${order.tableNumber}</p>`;
    if (kitchenTicket.showWaiter) html += `<p style="margin: 2px 0;">CAMARERO: ${textToThermal(order.waiterName)}</p>`;
    if (kitchenTicket.showTime) html += `<p style="margin: 2px 0;">HORA: ${new Date(order.createdAt).toLocaleTimeString('es-ES')}</p>`;
    
    html += generateDashedLine();
    
    order.items.forEach(item => {
        html += `<p style="margin: 5px 0; font-size: 18px;">${item.quantity}x ${textToThermal(item.name)}</p>`;
    });

    html += generateDashedLine();
    
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