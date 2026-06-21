const normalizeMultilineText = (text, fallback = 'SIN COMENTARIOS') => {
    const value = String(text || '').trim();

    if (!value) return fallback;

    return value
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n');
};

export const sendWhatsAppOrder = (info, whatsAppNumber) => {
    if (!whatsAppNumber || !/^\d+$/.test(whatsAppNumber)) return;

    const itemsText = info.cartItems
        .map((item) => {
            let itemText = `*${item.name.toUpperCase()}* ${item.quantity > 1 ? `x${item.quantity}` : ''} - $${item.price * item.quantity}`;
            // Agregar opciones personalizadas si existen
            if (item.customOptions && Array.isArray(item.customOptions) && item.customOptions.length > 0) {
                const optionsText = item.customOptions
                    .map(opt => {
                        let optText = `    - ${opt.name}`;
                        if (opt.quantity > 1) optText += ` (x${opt.quantity})`;
                        return optText;
                    })
                    .join("\n");
                itemText += `\n${optionsText}`;
            }
            if (item.productComment && item.productComment.trim() !== '') {
                itemText += `\n    📝 Nota: ${item.productComment.trim()}`;
            }
            return itemText;
        })
        .join("\n");

    const commentText = normalizeMultilineText(info.comentary);

    const message = ` *Nuevo Pedido para ${info.restaurantName}* \n\n` +
        ` *Cliente:* ${info.clientName}\n` +
        ` *Dirección:* ${info.deliveryAddress || "No especificada"}\n` +
        ` *Teléfono:* ${info.contactPhone}\n` +
        ` *Entrega:* ${info.orderType}\n` +
        ` *Método de Pago:* ${info.paymentMethod}\n\n` +
        ` *Detalles del Pedido:*\n\n${itemsText}\n\n` +
        ` *Comentarios:*\n${commentText}\n\n` +
        ` *Total:* $${info.totalAmount} ${info.orderType === 'DELIVERY' ? `+ *ENVIO*` : ''}\n` +
        ` *Puntos acumulados:* ${info.totalRewardPoints} (a confirmar dentro de las 24 hs)\n` +
        ` *Puntos canjeados:* ${info.totalRedeemPoints}\n\n` +
        ` *Por favor, no modificar el detalle del pedido*\n` +
        ` *GRACIAS POR UTILIZAR EL SISTEMA DE PEDIDOS DE LOBOTECH*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/54${whatsAppNumber}?text=${encodedMessage}`;

    window.location.href = whatsappURL;
};
