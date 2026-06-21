import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Configuración de colores y estilos
const PDF_CONFIG = {
    colors: {
        primary: [245, 166, 35], // #f5a623 - Color principal solicitado
        secondary: [52, 73, 94], // Gris oscuro
        accent: [231, 76, 60], // Rojo para destacar
        success: [39, 174, 96], // Verde para puntos positivos
        warning: [241, 196, 15], // Amarillo para advertencias
        light: [248, 249, 250], // Gris muy claro para fondos
        white: [255, 255, 255], // Blanco
        black: [0, 0, 0], // Negro para texto importante
        text: [0, 0, 0], // Texto principal en negro
        textLight: [150, 150, 150], // Gris claro para customOptions
        textSecondary: [100, 100, 100], // Gris medio
    },
    fonts: {
        title: 18,
        subtitle: 14,
        normal: 11,
        small: 9,
        tiny: 8,
    },
    margins: {
        left: 20,
        right: 20,
        top: 20,
    },
}

// Función para agregar el encabezado compacto
const addHeader = (doc, restaurantName, orderIndex, orderDate) => {
    const { colors, fonts, margins } = PDF_CONFIG

    // Fondo del encabezado más pequeño
    doc.setFillColor(...colors.primary)
    doc.rect(0, 0, 210, 15, "F")

    // Título del restaurante
    doc.setTextColor(...colors.black)
    doc.setFontSize(fonts.title)
    doc.setFont("helvetica", "bold")
    doc.text(restaurantName, margins.left, 10)

    // Número de pedido
    doc.setFontSize(fonts.subtitle)
    doc.text(`PEDIDO #${orderIndex}`, 150, 10)

    return 35 // Retorna la posición Y donde continuar
}

// Función para agregar información del cliente de forma compacta
const addClientInfo = (doc, order, startY) => {
    const { colors, fonts, margins } = PDF_CONFIG

    // Título de sección más pequeño
    doc.setFillColor(...colors.light)
    doc.rect(margins.left - 5, startY - 3, 170, 8, "F")

    doc.setTextColor(...colors.black)
    doc.setFontSize(fonts.subtitle)
    doc.setFont("helvetica", "bold")
    doc.text("INFORMACIÓN DEL CLIENTE", margins.left, startY + 2)

    let currentY = startY + 12

    // Información del cliente en formato compacto
    doc.setTextColor(...colors.black)
    doc.setFontSize(fonts.small)
    doc.setFont("helvetica", "normal")

    // Fecha y hora en la primera línea
    const formattedDate = `${order.orderDate.day}/${order.orderDate.month}/${order.orderDate.year}`
    const formattedTime = `${order.orderDate.hour}:${order.orderDate.minute}:${order.orderDate.second}`
    doc.setFont("helvetica", "bold")
    doc.text(`Fecha: ${formattedDate} - Hora: ${formattedTime}`, margins.left, currentY)
    currentY += 7

    // Cliente y contacto
    doc.text(`Cliente: ${order.clientName} | Tel: ${order.contactPhone}`, margins.left, currentY)
    currentY += 7

    // Email y tipo de entrega
    doc.text(`Email: ${order.clientEmail} | Entrega: ${order.orderType}`, margins.left, currentY)
    currentY += 7

    // Dirección (si es delivery) y método de pago
    if (order.orderType === "DELIVERY" && order.deliveryAddress) {
        doc.text(`Dirección: ${order.deliveryAddress}`, margins.left, currentY)
        currentY += 7
    }

    doc.text(`Pago: ${order.paymentMethod}`, margins.left, currentY)
    currentY += 7

    return currentY + 5
}

// Función para crear la tabla de productos compacta con customOptions
const addProductsTable = (doc, cartItems, startY) => {
    const { colors } = PDF_CONFIG

    // Preparar datos de la tabla incluyendo customOptions
    const tableData = []

    cartItems.forEach((item) => {
        // Fila principal del producto
        const mainRow = [
            item.quantity.toString(),
            item.name.toUpperCase(),
            `$${item.price}`,
            item.rewardPoints > 0 ? `+${item.rewardPoints}` : "-",
            item.redeemPoints > 0 ? `-${item.redeemPoints}` : "-",
            `$${(item.price * item.quantity).toFixed(2)}`,
        ]
        tableData.push(mainRow)

        // Agregar customOptions si existen
        if (item.customOptions && item.customOptions.length > 0) {
            item.customOptions.forEach((option) => {
                const optionRow = [
                    option.quantity > 1 ? `  +${option.quantity}` : "  +1",
                    `  • ${option.name.toUpperCase()}`,
                    option.extraCost > 0 ? `+$${option.extraCost}` : "$0",
                    "-",
                    "-",
                    "-",
                ]
                tableData.push(optionRow)
            })
        }
    })

    // Configurar y crear la tabla más compacta
    doc.autoTable({
        head: [["Cant.", "Producto / Opciones", "Precio", "Pts +", "Pts -", "Subtotal"]],
        body: tableData,
        startY: startY,
        margin: { left: 20, right: 20 },
        theme: "plain",
        headStyles: {
            fillColor: colors.primary,
            textColor: colors.black,
            fontSize: 10,
            fontStyle: "bold",
            halign: "center",
            cellPadding: 3,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: colors.black,
            cellPadding: 2,
        },
        alternateRowStyles: {
            fillColor: colors.light,
        },
        columnStyles: {
            0: { halign: "center", cellWidth: 18 },
            1: { halign: "left", cellWidth: 75 },
            2: { halign: "right", cellWidth: 22 },
            3: { halign: "center", cellWidth: 18 },
            4: { halign: "center", cellWidth: 18 },
            5: { halign: "right", cellWidth: 22 },
        },
        didParseCell: (data) => {
            // Estilo especial para las opciones (filas que empiezan con espacios)
            if (data.cell.text[0] && data.cell.text[0].startsWith("  ")) {
                data.cell.styles.textColor = colors.textLight
                data.cell.styles.fontSize = 8
                data.cell.styles.fontStyle = "italic"
            }
        },
    })

    return doc.lastAutoTable.finalY + 8
}

// Función para agregar el total en un row completo pequeño
const addTotalSummary = (doc, order, startY) => {
    const { colors, fonts, margins } = PDF_CONFIG

    // Row completo para el total
    doc.setFillColor(...colors.light)
    doc.rect(margins.left, startY, 170, 15, "F")

    // Total centrado y en negrita
    doc.setTextColor(...colors.black)
    doc.setFontSize(fonts.subtitle)
    doc.setFont("helvetica", "bold")
    doc.text(`TOTAL: $${order.totalAmount}`, 105, startY + 10, { align: "center" })

    let currentY = startY + 20

    // Información de puntos si existe (más compacta)
    if (order.totalRewardPoints > 0 || order.totalRedeemPoints > 0) {
        if (order.totalRewardPoints > 0) {
            doc.setFillColor(...colors.white)
            doc.rect(margins.left, currentY, 80, 10, "F")
            doc.setTextColor(...colors.success)
            doc.setFontSize(fonts.small)
            doc.setFont("helvetica", "bold")
            doc.text(`PUNTOS A GANAR: +${order.totalRewardPoints}`, margins.left + 5, currentY + 6)
            currentY += 12
        }

        if (order.totalRedeemPoints > 0) {
            doc.setFillColor(...colors.white)
            doc.rect(margins.left, currentY, 80, 10, "F")
            doc.setTextColor(...colors.accent)
            doc.setFontSize(fonts.small)
            doc.setFont("helvetica", "bold")
            doc.text(`PUNTOS CANJEADOS: -${order.totalRedeemPoints}`, margins.left + 5, currentY + 6)
            currentY += 12
        }
    }

    return currentY + 5
}

// Función para agregar comentarios de forma compacta
const addComments = (doc, comentary, startY) => {
    if (!comentary || comentary === "SIN COMENTARIOS") {
        return startY
    }

    const { colors, fonts, margins } = PDF_CONFIG

    // Título de comentarios compacto
    doc.setFillColor(...colors.light)
    doc.rect(margins.left - 5, startY - 3, 170, 8, "F")

    doc.setTextColor(...colors.black)
    doc.setFontSize(fonts.subtitle)
    doc.setFont("helvetica", "bold")
    doc.text("COMENTARIOS", margins.left, startY + 2)

    // Contenido del comentario
    doc.setTextColor(...colors.text)
    doc.setFontSize(fonts.small)
    doc.setFont("helvetica", "normal")

    const commentLines = doc.splitTextToSize(comentary, 170)
    doc.text(commentLines, margins.left, startY + 12)

    return startY + 12 + commentLines.length * 5 + 8
}

// Función principal para generar PDF compacto
export const generateOrderPDF = (order, orderIndex = order.id) => {
    try {
        const doc = new jsPDF()

        // Agregar todas las secciones de forma compacta
        let currentY = addHeader(doc, order.restaurantName || "Mi Restaurante", orderIndex, order.orderDate)
        currentY = addClientInfo(doc, order, currentY)
        currentY = addProductsTable(doc, order.cartItems, currentY)
        currentY = addTotalSummary(doc, order, currentY)
        currentY = addComments(doc, order.comentary, currentY)

        // Guardar el PDF
        const fileName = `Pedido_${orderIndex}_${order.clientName.replace(/\s+/g, "_")}.pdf`
        doc.save(fileName)

        return {
            success: true,
            fileName: fileName,
        }
    } catch (error) {
        console.error("Error generando PDF:", error)
        return {
            success: false,
            error: error.message,
        }
    }
}

// Función para previsualizar PDF compacto
export const previewOrderPDF = (order, orderIndex = order.id) => {
    try {
        const doc = new jsPDF()

        // Agregar todas las secciones (mismo código que generateOrderPDF)
        let currentY = addHeader(doc, order.restaurantName || "Mi Restaurante", orderIndex, order.orderDate)
        currentY = addClientInfo(doc, order, currentY)
        currentY = addProductsTable(doc, order.cartItems, currentY)
        currentY = addTotalSummary(doc, order, currentY)
        currentY = addComments(doc, order.comentary, currentY)

        // Abrir en nueva ventana para previsualizar
        const pdfBlob = doc.output("blob")
        const pdfUrl = URL.createObjectURL(pdfBlob)
        window.open(pdfUrl, "_blank")

        return {
            success: true,
        }
    } catch (error) {
        console.error("Error previsualizando PDF:", error)
        return {
            success: false,
            error: error.message,
        }
    }
}

// Función para obtener el PDF como blob (útil para envío por email)
export const getPDFBlob = (order, orderIndex = order.id) => {
    try {
        const doc = new jsPDF()

        // Agregar todas las secciones
        let currentY = addHeader(doc, order.restaurantName || "Mi Restaurante", orderIndex, order.orderDate)
        currentY = addClientInfo(doc, order, currentY)
        currentY = addProductsTable(doc, order.cartItems, currentY)
        currentY = addTotalSummary(doc, order, currentY)
        currentY = addComments(doc, order.comentary, currentY)

        const fileName = `Pedido_${orderIndex}_${order.clientName.replace(/\s+/g, "_")}.pdf`
        const blob = doc.output("blob")

        return {
            success: true,
            blob: blob,
            fileName: fileName,
        }
    } catch (error) {
        console.error("Error generando PDF blob:", error)
        return {
            success: false,
            error: error.message,
        }
    }
}
