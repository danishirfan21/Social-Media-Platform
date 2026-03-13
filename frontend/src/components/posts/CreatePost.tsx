import { useState } from 'react';
import {
  Paper,
  Avatar,
  TextField,
  Button,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ImageOutlined as ImageIcon,
  EmojiEmotionsOutlined as EmojiIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    console.log('Post content:', content);
    setContent('');
  };

  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar src={user?.avatarUrl} alt={user?.username} />
        <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder={`What's on your mind, ${user?.username}?`}
            variant="standard"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: '1.1rem' },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 2,
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Tooltip title="Add Image">
                <IconButton size="small" color="primary">
                  <ImageIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Emoji">
                <IconButton size="small" color="primary">
                  <EmojiIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="contained"
              disabled={!content.trim()}
              endIcon={<SendIcon />}
              type="submit"
              sx={{ borderRadius: 20, px: 3 }}
            >
              Post
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CreatePost;
