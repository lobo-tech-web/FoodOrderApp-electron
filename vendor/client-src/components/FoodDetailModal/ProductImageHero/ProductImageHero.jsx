import { Box, Skeleton } from '@mui/material';
import { useState } from 'react';

export const ProductImageHero = ({
  src,
  fallbackSrc,
  alt,
  isAdding = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const finalSrc = !src || imageError ? fallbackSrc : src;
  const showBlurBackground = Boolean(src) && !imageError;

  return (
    <Box
      sx={{
        width: '100%',
        height: {
          xs: 250,
          sm: 300,
          md: 330,
        },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: {
          xs: 0,
          sm: 3,
        },
      }}
    >
      {!imageLoaded && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'background.paper',
          }}
        />
      )}

      {showBlurBackground && (
        <Box
          component="img"
          src={finalSrc}
          alt=""
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            opacity: imageLoaded ? 0.22 : 0,
            transition: 'opacity 250ms ease',
          }}
        />
      )}

      <Box
        component="img"
        src={finalSrc}
        alt={alt}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: 'auto',
          height: 'auto',
          maxWidth: {
            xs: '94%',
            sm: '90%',
            md: '88%',
          },
          maxHeight: {
            xs: 230,
            sm: 275,
            md: 305,
          },
          objectFit: 'contain',
          objectPosition: 'center',
          display: imageLoaded ? 'block' : 'none',
          userSelect: 'none',
          pointerEvents: isAdding ? 'none' : 'auto',
          transform: imageLoaded ? 'scale(1)' : 'scale(0.98)',
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 250ms ease, transform 250ms ease',
        }}
      />
    </Box>
  );
};
