import {
  Box,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { User } from '@/types';

const FollowersPage = () => {
  const { userId } = useParams<{ userId: string }>();

  const { data: followers, isLoading } = useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const response = await axiosInstance.get<User[]>(`/users/${userId}/followers`);
      return response.data;
    },
  });

  if (isLoading) return <Typography>Loading followers...</Typography>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
        Followers
      </Typography>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <List sx={{ p: 0 }}>
          {followers?.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No followers yet</Typography>
            </Box>
          ) : (
            followers?.map((user, index) => (
              <Box key={user.id}>
                <ListItem
                  sx={{ py: 2, px: 3 }}
                  secondaryAction={
                    <Button variant="outlined" size="small" sx={{ borderRadius: 20 }}>
                      Follow
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      component={Link}
                      to={`/profile/${user.id}`}
                      src={user.avatarUrl}
                      alt={user.username}
                      sx={{ width: 48, height: 48, textDecoration: 'none' }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        component={Link}
                        to={`/profile/${user.id}`}
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ textDecoration: 'none', color: 'text.primary' }}
                      >
                        {user.username}
                      </Typography>
                    }
                    secondary={user.bio || 'No bio'}
                  />
                </ListItem>
                {index < followers.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default FollowersPage;
