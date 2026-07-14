export const hexToRgb = (hex, fallback = [0, 0, 0]) => {
    if (!hex || typeof hex !== 'string') return fallback;

    const cleanHex = hex.replace('#', '');

    if (cleanHex.length !== 6) return fallback;

    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);

    if ([r, g, b].some(Number.isNaN)) return fallback;

    return [r, g, b];
};

const getRgbLuminance = ([r, g, b]) => {
    const normalize = (value) => {
        const channel = value / 255;

        return channel <= 0.03928
            ? channel / 12.92
            : Math.pow((channel + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
};

const isLightRgb = (rgb = [255, 255, 255]) => {
    return getRgbLuminance(rgb) > 0.65;
};

const mixRgb = (rgbA, rgbB, amount = 0.35) => {
    return rgbA.map((value, index) =>
        Math.round(value * (1 - amount) + rgbB[index] * amount)
    );
};

export const getWatermarkTintRgb = (accentRgb, backgroundRgb) => {
    const backgroundIsLight = isLightRgb(backgroundRgb);

    if (backgroundIsLight) {
        return mixRgb(accentRgb, [0, 0, 0], 0.35);
    }

    return mixRgb(accentRgb, [255, 255, 255], 0.25);
};

const isWhitePixel = (r, g, b, a, threshold = 245) => {
    return a > 220 && r >= threshold && g >= threshold && b >= threshold;
};

const shouldRemoveWhiteBackground = (imageData, width, height) => {
    const data = imageData.data;

    const points = [
        [0, 0],
        [width - 1, 0],
        [0, height - 1],
        [width - 1, height - 1],
        [Math.floor(width / 2), 0],
        [Math.floor(width / 2), height - 1],
        [0, Math.floor(height / 2)],
        [width - 1, Math.floor(height / 2)],
    ];

    let whiteCount = 0;

    points.forEach(([x, y]) => {
        const index = (y * width + x) * 4;

        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        if (isWhitePixel(r, g, b, a)) {
            whiteCount += 1;
        }
    });

    return whiteCount >= 5;
};

export const getWatermarkImageBase64 = (
    imageUrl,
    {
        tintRgb = [180, 120, 0],
        autoRemoveWhiteBackground = true,
    } = {}
) => {
    return new Promise((resolve) => {
        if (!imageUrl || typeof imageUrl !== 'string') {
            resolve(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                const removeWhiteBackground =
                    autoRemoveWhiteBackground &&
                    shouldRemoveWhiteBackground(imageData, canvas.width, canvas.height);

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    if (a < 10) {
                        data[i + 3] = 0;
                        continue;
                    }

                    if (removeWhiteBackground && isWhitePixel(r, g, b, a)) {
                        data[i + 3] = 0;
                        continue;
                    }

                    data[i] = tintRgb[0];
                    data[i + 1] = tintRgb[1];
                    data[i + 2] = tintRgb[2];
                }

                ctx.putImageData(imageData, 0, 0);

                resolve(canvas.toDataURL('image/png'));
            } catch (error) {
                console.warn('Error al generar marca de agua:', error);
                resolve(null);
            }
        };

        img.onerror = () => {
            console.warn('Error al cargar imagen para marca de agua:', imageUrl);
            resolve(null);
        };

        img.src = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}cacheBust=${Date.now()}`;
    });
};

export const getReadableSecondaryRgb = (textRgb, backgroundRgb) => {
    const backgroundIsLight = isLightRgb(backgroundRgb);

    if (backgroundIsLight) {
        return mixRgb(textRgb, [0, 0, 0], 0.18);
    }

    return mixRgb(textRgb, [255, 255, 255], 0.28);
};

export const getLogoCardBackgroundRgb = (backgroundRgb, accentRgb) => {
    if (isLightRgb(backgroundRgb)) {
        return accentRgb;
    }

    return [255, 255, 255];
};

export const getImageBase64 = (
    imageUrl,
    {
        preserveTransparency = false,
        backgroundRgb = [255, 255, 255],
        quality = 0.9,
    } = {}
) => {
    return new Promise((resolve) => {
        if (!imageUrl || typeof imageUrl !== 'string') {
            resolve(null);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');

            if (!preserveTransparency) {
                ctx.fillStyle = `rgb(${backgroundRgb.join(',')})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);

            try {
                const mimeType = preserveTransparency ? 'image/png' : 'image/jpeg';
                const dataURL = canvas.toDataURL(mimeType, quality);
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

        img.src = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}cacheBust=${Date.now()}`;
    });
};

export const drawImagePlaceholder = (doc, x, y, width, height, theme) => {
    const { accentRgb, textRgb } = theme;

    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, y, width, height, 2, 2, 'F');

    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 2, 2, 'S');

    doc.setTextColor(...textRgb);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('SIN', x + width / 2, y + height / 2 - 2, { align: 'center' });
    doc.text('IMAGEN', x + width / 2, y + height / 2 + 4, { align: 'center' });
};

const decodeHtmlEntities = (value = '') => {
    const text = String(value || '');

    if (typeof document === 'undefined') return text;

    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;

    return textarea.value;
};

export const cleanCatalogText = (value = '') => {
    return decodeHtmlEntities(value)
        .normalize('NFKC')
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/[^\p{L}\p{N}\s.,:;()+\-_$%/&]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const FALLBACK_POSITION = 999999;

const getCategoryPosition = (product) => {
    const rawPosition =
        product?.category?.position ??
        product?.Category?.position ??
        FALLBACK_POSITION;

    const position = Number(rawPosition);

    return Number.isFinite(position) ? position : FALLBACK_POSITION;
};

export const sortProductsForCatalog = (products = []) => {
    return [...products].sort((a, b) => {
        const categoryPositionA = getCategoryPosition(a);
        const categoryPositionB = getCategoryPosition(b);

        if (categoryPositionA !== categoryPositionB) {
            return categoryPositionA - categoryPositionB;
        }

        const categoryNameA = cleanCatalogText(a?.category?.name || 'SIN CATEGORÍA');
        const categoryNameB = cleanCatalogText(b?.category?.name || 'SIN CATEGORÍA');

        if (categoryNameA !== categoryNameB) {
            return categoryNameA.localeCompare(categoryNameB);
        }

        const productPositionA = Number(a?.position ?? a?.priority ?? FALLBACK_POSITION);
        const productPositionB = Number(b?.position ?? b?.priority ?? FALLBACK_POSITION);

        if (productPositionA !== productPositionB) {
            return productPositionA - productPositionB;
        }

        return cleanCatalogText(a?.name).localeCompare(cleanCatalogText(b?.name));
    });
};

const drawCatalogChip = (
    doc,
    text,
    x,
    y,
    {
        fillRgb = [245, 180, 0],
        textRgb = [0, 0, 0],
        borderRgb = null,
        maxWidth = 35,
        fontSize = 6.2,
    } = {}
) => {
    const cleanText = cleanCatalogText(text);

    if (!cleanText) return 0;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSize);

    const textWidth = doc.getTextWidth(cleanText);
    const chipWidth = Math.min(textWidth + 5, maxWidth);
    const chipHeight = 6;

    doc.setFillColor(...fillRgb);
    doc.roundedRect(x, y, chipWidth, chipHeight, 2, 2, 'F');

    if (borderRgb) {
        doc.setDrawColor(...borderRgb);
        doc.setLineWidth(0.2);
        doc.roundedRect(x, y, chipWidth, chipHeight, 2, 2, 'S');
    }

    doc.setTextColor(...textRgb);
    doc.text(cleanText, x + chipWidth / 2, y + 4.2, {
        align: 'center',
    });

    return chipWidth + 2;
};

export const drawProductAttributeChips = (doc, product, x, y) => {
    let currentX = x;

    if (product?.isVeggie) {
        currentX += drawCatalogChip(doc, 'VEGETARIANO', currentX, y, {
            fillRgb: [220, 252, 231],
            textRgb: [22, 101, 52],
            borderRgb: [134, 239, 172],
            maxWidth: 28,
        });
    }

    if (product?.isSinTacc) {
        currentX += drawCatalogChip(doc, 'SIN TACC', currentX, y, {
            fillRgb: [254, 243, 199],
            textRgb: [146, 64, 14],
            borderRgb: [252, 211, 77],
            maxWidth: 34,
        });
    }

    return currentX - x;
};

const formatCurrency = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
};

export const getFinalPrice = (product) => {
    const price = Number(product.price || 0);
    const discount = Number(product.discount || 0);

    if (price <= 0) return 0;
    if (discount <= 0) return price;

    return price - (price * discount) / 100;
};

export const getDisplayPrice = (product, finalPrice = null) => {
    const redeemPoints = Number(product.redeemPoints || 0);
    const price = Number(product.price || 0);
    const priceToShow = finalPrice !== null ? Number(finalPrice || 0) : price;

    if (redeemPoints > 0 && priceToShow === 0) {
        return `${redeemPoints.toLocaleString('es-AR')} puntos`;
    }

    if (priceToShow === 0) {
        return '';
    }

    return formatCurrency(priceToShow);
};

export const drawDiscountPriceBlock = (
    doc,
    product,
    x,
    y,
    {
        priceRgb = [17, 24, 39],
        accentRgb = [185, 28, 28],
        bgRgb = [254, 226, 226],
    } = {}
) => {
    const discount = Number(product?.discount || 0);
    const originalPrice = Number(product?.price || 0);
    const finalPrice = getFinalPrice(product);

    const oldPriceText = `${formatCurrency(originalPrice)}`;
    const finalPriceText = formatCurrency(finalPrice);

    const oldPriceY = y - 4;
    const finalPriceY = y + 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(oldPriceText, x, oldPriceY);

    const oldPriceWidth = doc.getTextWidth(oldPriceText);

    doc.setDrawColor(...priceRgb);
    doc.setLineWidth(0.65);
    doc.line(x, oldPriceY - 1.3, x + oldPriceWidth, oldPriceY - 1.3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...priceRgb);
    doc.text(finalPriceText, x, finalPriceY);

    const finalPriceWidth = doc.getTextWidth(finalPriceText);

    drawCatalogChip(doc, `Descuento -${discount}%`, x + finalPriceWidth + 5, finalPriceY - 5, {
        fillRgb: bgRgb,
        textRgb: priceRgb,
        borderRgb: accentRgb,
        maxWidth: 26,
        fontSize: 6.5,
    });

    return {
        oldPriceY,
        finalPriceY,
        nextY: finalPriceY + 4,
    };
};