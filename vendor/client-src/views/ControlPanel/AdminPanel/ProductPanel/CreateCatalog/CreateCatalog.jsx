import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ---- IMAGENES ----
import bg1 from '@/assets/main/catalog/example1.jpeg';
import bg2 from '@/assets/main/catalog/example2.png';
// ------------------

const getImageBase64 = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      // 🔥 Fondo blanco antes de dibujar la imagen
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

      try {
        const dataURL = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataURL);
      } catch (error) {
        console.warn('Error al convertir imagen:', error);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.warn('Error al cargar imagen:', imageUrl);
      resolve(null);
    };

    img.src = imageUrl;
  });
};

export const generateProductCatalogPDF = async (
  products,
  restaurantName = 'MI RESTAURANTE'
) => {
  const activeProducts = products.filter((product) => product.status === true);

  if (!activeProducts.length || activeProducts.length === 0) {
    throw new Error('No hay productos activos para generar el catálogo');
  }

  // ----------- FUNCIÓN PARA EL FONDO (Dibuja 2 imágenes) --------------
  const addBackgroundImages = async (doc) => {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // 1. Cargar imágenes (pueden ser logos o formas abstractas)
    const img1 = await getImageBase64(bg1);
    const img2 = await getImageBase64(bg2);

    // Guardar estado actual y aplicar opacidad
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.05 })); // 5% de opacidad para no molestar

    if (img1) {
      // Imagen arriba a la derecha
      doc.addImage(img1, 'PNG', width - 60, -10, 70, 70);
    }
    if (img2) {
      // Imagen abajo a la izquierda
      doc.addImage(img2, 'PNG', -10, height - 60, 80, 80);
    }

    // Restaurar opacidad al 100% para el resto del texto
    doc.restoreGraphicsState();
  };
  // -------------------------------

  const doc = new jsPDF();
  await addBackgroundImages(doc);

  // Configuración de colores

  const colors = {
    title: [31, 41, 55], // Gris casi negro
    price: [0, 0, 0], // Negro
    secondary: [0, 0, 0], // Gris suave para "Sin impuestos"
    bg: [255, 255, 255],
  };

  const primaryColor = [0, 0, 0];
  const secondaryColor = [120, 120, 120];
  // const secondaryColor = [100, 100, 100];
  const headerBg = [240, 240, 240];

  /* -------------------- PORTADA -------------------- */
  // Título del catálogo
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.setFont('courier', 'bold');
  doc.text(restaurantName.toUpperCase(), 105, 20, { align: 'center' });

  // Fecha de generación
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  const today = new Date().toLocaleDateString('es-AR');
  doc.text(`Generado el: ${today}`, 105, 38, { align: 'center' });

  // Línea separadora
  doc.setDrawColor(...primaryColor);
  doc.line(20, 42, 190, 42);
  /* --------------------         -------------------- */

  /* -------------------- AGRUPAR POR CATEGORÍA -------------------- */
  const productsByCategory = activeProducts.reduce((acc, product) => {
    const categoryName = product?.category?.name || 'SIN CATEGORÍA';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  let yPosition = 50;

  const PAGE_BOTTOM_LIMIT = 280;
  const CATEGORY_TITLE_HEIGHT = 12;
  const PRODUCT_HEIGHT = 42;
  const CATEGORY_BLOCK_HEIGHT = CATEGORY_TITLE_HEIGHT + PRODUCT_HEIGHT;

  for (const [categoryName, categoryProducts] of Object.entries(
    productsByCategory
  )) {
    // Verificar si necesitamos una nueva página
    if (yPosition + CATEGORY_BLOCK_HEIGHT > PAGE_BOTTOM_LIMIT) {
      doc.addPage();
      yPosition = 20;
      await addBackgroundImages(doc);
    }
    /* --------------------         -------------------- */

    /* -------------------- TITULO DE CATEGORÍA -------------------- */
    doc.setFillColor(...headerBg);
    doc.rect(20, yPosition - 5, 170, 10, 'F');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('courier', 'bold');
    doc.text(categoryName.toUpperCase(), 25, yPosition + 2);

    yPosition += 12;

    for (const product of categoryProducts) {
      // Verificar espacio disponible (imagen + info necesita ~50mm)
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
        await addBackgroundImages(doc);
      }

      const startY = yPosition;
      let imageData = null;
      /* --------------------         -------------------- */

      /* -------------------- IMAGEN DEL PRODUCTO -------------------- */
      // Intentar cargar la imagen del producto
      if (product.image) {
        try {
          imageData = await getImageBase64(product.image);
        } catch (error) {
          console.warn(
            'No se pudo cargar la imagen del producto:',
            product.name
          );
        }
      }

      // Dibujar imagen si existe
      if (imageData) {
        const imgWidth = 35;
        const imgHeight = 35;
        doc.addImage(imageData, 'JPEG', 25, startY, imgWidth, imgHeight);
      }
      /* --------------------         -------------------- */

      /* -------------------- INFORMACIÓN DEL PRODUCTO -------------------- */
      // Información del producto (al lado de la imagen)
      const textStartX = imageData ? 65 : 25;

      // Nombre del producto
      doc.setFontSize(14);
      doc.setTextColor(...colors.title);
      doc.setFont('courier', 'bold');
      doc.text(product.name.toUpperCase(), textStartX, startY + 5);

      // Descripción
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      doc.setTextColor(...colors.secondary);
      const description = product.description || '';
      const splitDescription = doc.splitTextToSize(description, 120);
      doc.text(splitDescription.slice(0, 3), textStartX, startY + 12);

      // Precio y descuento
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');

      const priceY = startY + 27;
      if (product.discount > 0) {
        const finalPrice = (
          product.price -
          (product.price * product.discount) / 100
        ).toFixed(2);

        // Precio original tachado
        doc.setTextColor('#333');
        doc.setFont('helvetica', 'normal');
        doc.text(
          `$${product.price.toLocaleString('es-AR')}`,
          textStartX,
          priceY
        );
        doc.setLineWidth(0.5);
        doc.line(textStartX, priceY - 1, textStartX + 15, priceY - 1);

        // Precio con descuento
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(
          `$${finalPrice.toLocaleString('es-AR')}`,
          textStartX + 20,
          priceY
        );

        // Badge de descuento
        doc.setTextColor('#EF4444');
        doc.setFillColor('#fff');
        doc.roundedRect(textStartX + 45, priceY - 5, 18, 6, 2, 2, 'F');
        doc.setFontSize(10);
        doc.text(`-${product.discount} %`, textStartX + 47, priceY);
      } else {
        doc.setTextColor(...colors.price);
        doc.setFontSize(12);
        doc.text(
          `$${product.price.toLocaleString('es-AR')}`,
          textStartX,
          priceY
        );
      }

      // Línea separadora entre productos
      doc.setDrawColor('#d6ccc2');
      doc.line(20, startY + 38, 190, startY + 38);

      yPosition = startY + 42;
    }

    // Espacio extra entre categorías
    yPosition += 5;
  }

  /* -------------------- FOOTER -------------------- */
  // Pie de página en todas las páginas
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor('#000');
    doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
  }
  /* ---------------------------------------- */

  // Guardar el PDF
  const fileName = `catalogo_productos_${restaurantName
    .toLowerCase()
    .replace(/\s+/g, '_')}_${today.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
