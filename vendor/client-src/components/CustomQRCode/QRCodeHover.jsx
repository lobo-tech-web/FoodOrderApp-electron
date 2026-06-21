import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { CustomQRCode } from './CustomQRCode.jsx';

export const QRCodeHover = ({ url, logo, icon }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const qrRef = useRef();
  const buttonRef = useRef();
  const popoverRef = useRef();

  // Posición del popover
  const [popoverPosition, setPopoverPosition] = useState({
    bottom: 0,
    left: 0,
  });

  const calculatePopoverPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    if (isMobile) {
      // En móvil, centrar el popover horizontalmente
      const popoverWidth = qrSize - 100; // QR size + padding
      const leftPosition = Math.max(10, windowWidth / 2 - popoverWidth / 2);

      setPopoverPosition({
        bottom: -qrSize - 60, // Altura del QR + espacio para el botón
        left: leftPosition - rect.left, // Ajustar relativo al botón
      });
    } else {
      // En desktop, posicionar relativo al botón
      setPopoverPosition({
        bottom: -qrSize - 60,
        left: rect.width / 2 - qrSize,
      });
    }
  };

  const handleClick = () => {
    calculatePopoverPosition();
    setShowPopover(!showPopover);
  };

  const handleOutsideClick = (e) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(e.target) &&
      !buttonRef.current.contains(e.target)
    ) {
      setShowPopover(false);
    }
  };

  const handleDownloadQR = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!qrRef.current) return;

    const qrElement = qrRef.current.querySelector('div');

    if (qrElement) {
      toPng(qrElement)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'qr-code.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Error downloading QR code', err);
        });
      setShowPopover(false);
    } else {
      console.error('QR element not found');
    }
  };

  // Detectar si es móvil y actualizar tamaños
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 600);

      // Ajustar tamaño del QR según el ancho de pantalla
      if (width < 360) {
        setQrSize(100); // Pantallas muy pequeñas
      } else if (width < 600) {
        setQrSize(130); // Móviles
      } else if (width < 960) {
        setQrSize(220); // Tablets
      } else {
        setQrSize(256); // Desktop
      }
    };

    handleResize(); // Ejecutar inmediatamente
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (showPopover) {
      calculatePopoverPosition();
    }
  }, [isMobile, qrSize, showPopover]);

  // ---- STYLES ----
  const defaultButtonStyle = {
    backgroundColor: 'transparent',
    color: 'transparent',
    border: 'none',
    borderRadius: '50%',
    width: isMobile ? '28px' : '40px',
    height: isMobile ? '28px' : '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    padding: 0,
  };
  // ----------------

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button ref={buttonRef} style={defaultButtonStyle} onClick={handleClick}>
        {icon || 'QR'}
      </button>

      {showPopover && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            bottom: `${popoverPosition.bottom}px`,
            left: `${popoverPosition.left}px`,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            padding: '10px',
            zIndex: 2000,
            maxWidth: '90vw', // Evitar que se salga de la pantalla
            width: `${qrSize + 20}px`, // Ancho basado en el tamaño del QR + padding
          }}
        >
          <div ref={qrRef} style={{ textAlign: 'center' }}>
            <CustomQRCode url={url} logo={logo} size={qrSize} />
          </div>
          <button
            onClick={handleDownloadQR}
            style={{
              marginTop: '10px',
              backgroundColor: '#0194DC',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: isMobile ? '6px 10px' : '8px 12px',
              cursor: 'pointer',
              width: '100%',
              fontSize: isMobile ? '14px' : '16px',
            }}
          >
            Descargar QR
          </button>
        </div>
      )}
    </div>
  );
};
