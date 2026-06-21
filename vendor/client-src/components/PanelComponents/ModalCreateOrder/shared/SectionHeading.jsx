import { Box, Typography } from '@mui/material';

export const SectionHeading = ({ icon, title, action }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      gap: 1.5,
      mb: 2,
      flexDirection: { xs: 'column', sm: 'row' },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
      <Box
        sx={{
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          '& .MuiSvgIcon-root': { fontSize: 22 },
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontFamily: 'fontFamily.primary',
          color: 'text.primary',
          fontSize: { xs: '18px', sm: '16px' },
          lineHeight: 1,
        }}
      >
        {title}
      </Typography>
    </Box>
    {action}
  </Box>
);
