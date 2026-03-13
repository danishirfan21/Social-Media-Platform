import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Button,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { User, Post, PagedResponse } from '@/types';
import PostCard from '@/components/posts/PostCard';
import { useState } from 'react';

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [tabValue, setTabValue] = useState(0);

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await axiosInstance.get<User>(`/users/${userId}`);
      return response.data;
    },
  });

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      const response = await axiosInstance.get<PagedResponse<Post>>(`/posts/user/${userId}`);
      return response.data;
    },
  });

  if (isUserLoading) return <Typography>Loading profile...</Typography>;
  if (!user) return <Typography>User not found</Typography>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', mb: 3 }}>
        {/* Cover Image Placeholder */}
        <Box
          sx={{
            height: 200,
            background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
          }}
        />

        <Box sx={{ p: 4, mt: -8 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              mb: 3,
            }}
          >
            <Avatar
              src={user.avatarUrl}
              alt={user.username}
              sx={{
                width: 128,
                height: 128,
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Button variant="contained" sx={{ borderRadius: 20, px: 4, mb: 1 }}>
              {user.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </Box>

          <Typography variant="h4" fontWeight={800}>
            {user.username}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {user.bio || 'No bio available'}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item>
              <Typography variant="h6" fontWeight={700} display="inline">
                {user.followersCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" display="inline" sx={{ ml: 1 }}>
                Followers
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h6" fontWeight={700} display="inline">
                {user.followingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" display="inline" sx={{ ml: 1 }}>
                Following
              </Typography>
            </Grid>
          </Grid>

          <Divider />

          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{ mt: 1 }}
          >
            <Tab label="Posts" sx={{ fontWeight: 600 }} />
            <Tab label="Media" sx={{ fontWeight: 600 }} />
            <Tab label="Likes" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>
      </Paper>

      {tabValue === 0 && (
        <Box>
          {isPostsLoading ? (
            <Typography>Loading posts...</Typography>
          ) : posts?.content.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography color="text.secondary">No posts yet</Typography>
            </Paper>
          ) : (
            posts?.content.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProfilePage;
