import { Box, Container, Typography } from '@mui/material';

export const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'rgba(0,0,0,0.5)',
        py: 3,
        mt: 'auto',
      }}
    >
      <Container>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: '#f5a623',
            textAlign: 'center',
          }}
        >
          © 2025 LOBOTECH
        </Typography>
      </Container>
    </Box>
  );
};
