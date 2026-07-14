import { jsPDF } from "jspdf";
import "jspdf-autotable";

// ---- IMAGENES ----
import bg1 from "@/assets/main/catalog/example1.jpeg";
import bg2 from "@/assets/main/catalog/example2.png";
// ------------------

// ---- Utils ----
import {
  hexToRgb,
  getWatermarkTintRgb,
  getWatermarkImageBase64,
  getReadableSecondaryRgb,
  getLogoCardBackgroundRgb,
  getImageBase64,
  drawImagePlaceholder,
  cleanCatalogText,
  sortProductsForCatalog,
  drawProductAttributeChips,
  getFinalPrice,
  getDisplayPrice,
  drawDiscountPriceBlock,
} from "./utils/catalogUtils.js";
// ---------------

export const generateProductCatalogPDF = async (
  products,
  businessLogo = "",
  pdfOptions = {},
  // restaurantName = 'MI RESTAURANTE'
) => {
  const {
    restaurantName = "MI RESTAURANTE",
    template = "PROFESSIONAL",
    useBusinessLogoAsFallback = true,
    useBusinessLogoWatermark = false,
    backgroundColor = "#FFFFFF",
    textColor = "#111827",
    accentColor = "#F5B400",
    showImages = true,
    showDescription = true,
    showRewards = true,
    showDiscounts = true,
  } = pdfOptions;

  const activeProducts = sortProductsForCatalog(
    products.filter((product) => product.status === true),
  );

  if (!activeProducts.length || activeProducts.length === 0) {
    throw new Error("No hay productos activos para generar el catálogo");
  }

  const backgroundRgb = hexToRgb(backgroundColor, [255, 255, 255]);
  const textRgb = hexToRgb(textColor, [17, 24, 39]);
  const accentRgb = hexToRgb(accentColor, [245, 180, 0]);
  const secondaryTextRgb = getReadableSecondaryRgb(textRgb, backgroundRgb);

  const isSimpleTemplate = template === "SIMPLE";
  const isLocalMenuTemplate = template === "LOCAL_MENU";
  const isProfessionalTemplate = template === "PROFESSIONAL";

  // ---- Helpers ----
  const addBackgroundImages = async (doc) => {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    const watermarkTintRgb = getWatermarkTintRgb(textRgb, backgroundRgb);

    const drawWithOpacity = (opacity, drawFn) => {
      try {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity }));
        drawFn();
        doc.restoreGraphicsState();
      } catch (error) {
        console.warn("No se pudo aplicar opacidad en el PDF:", error);

        try {
          doc.restoreGraphicsState();
        } catch (error) {
          // Evita romper el PDF si jsPDF no puede restaurar el estado.
          console.error(error);
        }

        drawFn();
      }
    };

    if (useBusinessLogoWatermark && businessLogo) {
      const logoWatermark = await getWatermarkImageBase64(businessLogo, {
        tintRgb: watermarkTintRgb,
        autoRemoveWhiteBackground: true,
      });

      if (logoWatermark) {
        const watermarkSize = 100;

        drawWithOpacity(0.2, () => {
          doc.addImage(
            logoWatermark,
            "PNG",
            (width - watermarkSize) / 2,
            (height - watermarkSize) / 2,
            watermarkSize,
            watermarkSize,
          );
        });

        return;
      }
    }

    const bg1Watermark = await getWatermarkImageBase64(bg1, {
      tintRgb: watermarkTintRgb,
      autoRemoveWhiteBackground: true,
    });

    const bg2Watermark = await getWatermarkImageBase64(bg2, {
      tintRgb: watermarkTintRgb,
      autoRemoveWhiteBackground: true,
    });

    drawWithOpacity(0.22, () => {
      if (bg1Watermark) {
        doc.addImage(bg1Watermark, "PNG", width - 68, -12, 78, 78);
      }

      if (bg2Watermark) {
        doc.addImage(bg2Watermark, "PNG", -14, height - 70, 90, 90);
      }
    });
  };

  const paintPageBackground = (doc) => {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    doc.setFillColor(...backgroundRgb);
    doc.rect(0, 0, width, height, "F");
  };

  const getProductHeight = () => {
    let height = 42;

    if (template === "LOCAL_MENU") {
      height = Math.max(height, 34);
    }

    if (template === "SIMPLE") {
      height = Math.max(height, 28);
    }

    return height;
  };

  const businessLogoBase64 = businessLogo
    ? await getImageBase64(businessLogo, {
        preserveTransparency: true,
      })
    : null;

  const addCategoryHeader = (doc, categoryName, y) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(...accentRgb);
    doc.roundedRect(20, y - 5, pageWidth - 40, 12, 2, 2, "F");

    doc.setTextColor(...textRgb);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(cleanCatalogText(categoryName).toUpperCase(), 25, y + 3);

    return y + 15;
  };
  // ------------------

  const doc = new jsPDF();
  paintPageBackground(doc);
  await addBackgroundImages(doc);

  // Configuración de colores
  const colors = {
    title: textRgb,
    price: textRgb,
    secondary: secondaryTextRgb,
    bg: backgroundRgb,
    accent: accentRgb,
  };

  const primaryColor = textRgb;
  const secondaryColor = secondaryTextRgb;
  const headerBg = accentRgb;

  /* -------------------- PORTADA -------------------- */
  // Título del catálogo
  const today = new Date().toLocaleDateString("es-AR");

  if (businessLogoBase64) {
    const logoBoxX = 22;
    const logoBoxY = 11;
    const logoBoxSize = 24;
    const logoSize = 18;

    const logoBoxBg = getLogoCardBackgroundRgb(backgroundRgb, accentRgb);

    doc.setFillColor(...logoBoxBg);
    doc.roundedRect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, 4, 4, "F");

    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.5);
    doc.roundedRect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, 4, 4, "S");

    doc.addImage(
      businessLogoBase64,
      "PNG",
      logoBoxX + 3,
      logoBoxY + 3,
      logoSize,
      logoSize,
    );

    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(cleanCatalogText(restaurantName).toUpperCase(), 52, 20);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text(`Generado el: ${today}`, 52, 28);

    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.6);
    doc.line(20, 42, 190, 42);
  } else {
    doc.setFontSize(22);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(cleanCatalogText(restaurantName).toUpperCase(), 105, 20, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text(`Generado el: ${today}`, 105, 38, {
      align: "center",
    });

    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.6);
    doc.line(20, 42, 190, 42);
  }
  /* --------------------         -------------------- */

  /* -------------------- AGRUPAR POR CATEGORÍA -------------------- */
  const productsByCategory = activeProducts.reduce((acc, product) => {
    const categoryName = product?.category?.name || "SIN CATEGORÍA";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {});

  let yPosition = 50;

  const PAGE_BOTTOM_LIMIT = 280;

  for (const [categoryName, categoryProducts] of Object.entries(
    productsByCategory,
  )) {
    /* -------------------- TITULO DE CATEGORÍA -------------------- */

    const firstProductHeight = categoryProducts.length
      ? getProductHeight(categoryProducts[0])
      : 0;

    const categoryHeaderHeight = 15;
    const minCategoryBlockHeight = categoryHeaderHeight + firstProductHeight;

    if (yPosition + minCategoryBlockHeight > PAGE_BOTTOM_LIMIT) {
      doc.addPage();
      paintPageBackground(doc);
      yPosition = 20;
      await addBackgroundImages(doc);
    }

    yPosition = addCategoryHeader(doc, categoryName, yPosition);

    for (const product of categoryProducts) {
      const productHeight = getProductHeight();

      if (yPosition + productHeight > PAGE_BOTTOM_LIMIT) {
        doc.addPage();
        paintPageBackground(doc);
        yPosition = 20;
        await addBackgroundImages(doc);

        yPosition = addCategoryHeader(doc, categoryName, yPosition);
      }

      const startY = yPosition;

      let imageData = null;
      let imageSource = null;

      /* -------------------- IMAGEN DEL PRODUCTO -------------------- */
      // Intentar cargar la imagen del producto
      if (showImages) {
        if (product.image) {
          imageSource = product.image;
        } else if (useBusinessLogoAsFallback && businessLogo) {
          imageSource = businessLogo;
        }

        if (imageSource)
          imageData = await getImageBase64(imageSource, {
            preserveTransparency: false,
            backgroundRgb,
          });
      }

      const imageX = 25;
      const imageY = startY;
      const imageSize = 35;

      if (showImages) {
        if (imageData) {
          doc.addImage(imageData, "JPEG", imageX, imageY, imageSize, imageSize);
        } else {
          drawImagePlaceholder(doc, imageX, imageY, imageSize, imageSize, {
            accentRgb,
            textRgb,
          });
        }
      }

      /* -------------------- INFORMACIÓN DEL PRODUCTO -------------------- */
      // Información del producto (al lado de la imagen)
      const hasImageSlot = showImages;
      const textStartX = hasImageSlot ? 65 : 25;
      const textMaxWidth = hasImageSlot ? 120 : 160;

      // Nombre del producto
      doc.setFontSize(isLocalMenuTemplate ? 15 : 12);
      doc.setTextColor(...colors.title);
      doc.setFont("helvetica", "bold");

      const productName = cleanCatalogText(
        product.name || "PRODUCTO",
      ).toUpperCase();
      doc.text(productName, textStartX, startY + 5);

      let currentTextY = startY + 12;

      const hasAttributeChips = product.isVeggie || product.isSinTacc;

      if (hasAttributeChips) {
        const productNameWidth = doc.getTextWidth(productName);

        const estimatedChipsWidth =
          (product.isVeggie ? 30 : 0) + (product.isSinTacc ? 36 : 0);

        const chipsFitBesideTitle =
          productNameWidth + estimatedChipsWidth + 6 <= textMaxWidth;

        if (chipsFitBesideTitle) {
          drawProductAttributeChips(
            doc,
            product,
            textStartX + productNameWidth + 4,
            startY + 1,
          );
        } else {
          drawProductAttributeChips(doc, product, textStartX, startY + 8);
          currentTextY = startY + 17;
        }
      }

      // Descripción

      if (showDescription && !isLocalMenuTemplate && product.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...colors.secondary);

        const splitDescription = doc.splitTextToSize(
          cleanCatalogText(product.description),
          textMaxWidth,
        );

        doc.text(splitDescription.slice(0, 2), textStartX, currentTextY);

        currentTextY += Math.min(splitDescription.length, 2) * 4;
      }

      // Precio y descuento
      const priceY = Math.max(currentTextY + 5, startY + 27);
      const finalPrice = getFinalPrice(product);

      const hasDiscount =
        showDiscounts &&
        Number(product.discount || 0) > 0 &&
        Number(product.price || 0) > 0;

      const displayPrice = getDisplayPrice(product, finalPrice);
      const isRedeemOnly =
        Number(product.redeemPoints || 0) > 0 && Number(finalPrice || 0) === 0;

      let rewardsY = priceY;

      if (hasDiscount) {
        const discountResult = drawDiscountPriceBlock(
          doc,
          product,
          textStartX,
          priceY,
          {
            priceRgb: colors.price,
            accentRgb: colors.accent,
            bgRgb: colors.bg,
          },
        );

        rewardsY = discountResult.finalPriceY;
      } else if (displayPrice) {
        if (isRedeemOnly) {
          doc.setFillColor(...accentRgb);
          doc.roundedRect(textStartX, priceY - 5, 40, 8, 2, 2, "F");

          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text(displayPrice.toUpperCase(), textStartX + 20, priceY, {
            align: "center",
          });
        } else {
          doc.setTextColor(...colors.price);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(isLocalMenuTemplate ? 14 : 12);
          doc.text(displayPrice, textStartX, priceY);
        }
      }

      if (showRewards && !isLocalMenuTemplate) {
        const rewardPoints = Number(product.rewardPoints || 0);
        const redeemPoints = Number(product.redeemPoints || 0);

        let badgeX = textStartX + 75;

        if (rewardPoints > 0) {
          doc.setFillColor(...accentRgb);
          doc.roundedRect(badgeX, rewardsY - 5, 24, 7, 2, 2, "F");

          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.text(`+${rewardPoints} pts`, badgeX + 12, rewardsY, {
            align: "center",
          });

          badgeX += 28;
        }

        if (redeemPoints > 0 && !isRedeemOnly) {
          doc.setFillColor(31, 41, 55);
          doc.roundedRect(badgeX, rewardsY - 5, 28, 7, 2, 2, "F");

          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.text(`${redeemPoints} pts`, badgeX + 14, rewardsY, {
            align: "center",
          });
        }
      }

      // Línea separadora entre productos
      doc.setDrawColor(214, 204, 194);
      doc.line(20, startY + productHeight - 4, 190, startY + productHeight - 4);

      yPosition = startY + productHeight;
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
    doc.setTextColor(...textRgb);
    doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: "center" });
  }
  /* ---------------------------------------- */

  // Guardar el PDF
  const fileName = `catalogo_productos_${restaurantName
    .toLowerCase()
    .replace(/\s+/g, "_")}_${today.replace(/\//g, "-")}.pdf`;

  doc.save(fileName);
};
