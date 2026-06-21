import React from 'react';

// ---- GENERADOR DE QR ----
import { QRCodeSVG } from 'qrcode.react';

export const CustomQRCode = ({ url, logo, size = 256 }) => {
  const logoContainerSize = Math.round(size * 0.23); // ~23% del tamaño del QR
  const logoSize = Math.round(size * 0.2); // ~20% del tamaño del QR

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        padding: Math.round(size * 0.04),
        backgroundColor: '#FFFF',
        borderRadius: Math.round(size * 0.03),
      }}
    >
      <QRCodeSVG
        value={url}
        size={size}
        bgColor="#FFFF"
        fgColor="#000000"
        level="H" // Alto nivel de corrección para que el logo no afecte la lectura
        includeMargin={true}
      />
      {logo && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${logoContainerSize}px`,
            height: `${logoContainerSize}px`,
            backgroundColor: '#FFFF',
            borderRadius: Math.round(logoContainerSize * 0.2), // o '50%' si querés circular
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1, // asegurarse que está sobre el QR
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${logoSize}px`, // Ajusta el tamaño según tu logo
              height: `${logoSize}px`,
              borderRadius: Math.round(logoSize * 0.1),
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </div>
  );
};
