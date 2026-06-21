// ---- MATERIAL UI ----
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
//<--------------------

export const VacationCard = ({ info, image }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Card sx={{ maxWidth: '100%', maxHeight: '100%' }}>
      <CardMedia
        sx={{ height: isMobile ? 150 : 400 }}
        image={image}
        title={info.title}
      />
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          sx={{
            fontSize: isMobile ? '16px' : '34px',
            fontWeight: 'bold',
            color: '#000',
          }}
        >
          {info.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontSize: isMobile ? '12px' : '18px', color: '#000' }}
        >
          {info.description}
        </Typography>
      </CardContent>
    </Card>
  );
};
