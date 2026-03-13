import { Box, Typography, Paper } from '@mui/material';

const NotificationsPage = () => {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
        Notifications
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography color="text.secondary">No new notifications</Typography>
      </Paper>
    </Box>
  );
};

export default NotificationsPage;
