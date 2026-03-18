import React, { useState, useRef } from 'react';
import {
  Paper,
  Avatar,
  TextField,
  Button,
  Box,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ImageOutlined as ImageIcon,
  EmojiEmotionsOutlined as EmojiIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '@/api/postApi';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const createPostMutation = useMutation({
    mutationFn: (formData: FormData) => {
      console.log('Mutation function triggered with FormData');
      return postApi.createPost(formData);
    },
    onSuccess: (data) => {
      console.log('Post created successfully:', data);
      handleReset();
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-posts', user.id.toString()] });
      }
    },
    onError: (error) => {
      console.error('Post creation failed:', error);
    }
  });

  const handleReset = () => {
    setContent('');
    setImage(null);
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('Image size should be less than 5MB');
        return;
      }
      setError(null);
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log('handleSubmit triggered');
    e.preventDefault();
    if (!content.trim() && !image) {
      console.log('Content and image are empty, skipping mutate');
      return;
    }

    const formData = new FormData();
    const postRequest = {
      content: content,
    };

    formData.append('post', new Blob([JSON.stringify(postRequest)], {
      type: 'application/json'
    }));

    if (image) {
      formData.append('image', image);
    }

    console.log('Calling mutate with FormData');
    createPostMutation.mutate(formData);
  };

  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar src={user?.avatarUrl} alt={user?.username} />
        <form 
          onSubmit={handleSubmit} 
          style={{ flexGrow: 1 }}
        >
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

          {imagePreview && (
            <Box sx={{ position: 'relative', mt: 2, mb: 1 }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {error && (
            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
              {error}
            </Typography>
          )}

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
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <Tooltip title="Add Image">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => fileInputRef.current?.click()}
                >
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
              disabled={(!content.trim() && !image) || createPostMutation.isPending}
              endIcon={<SendIcon />}
              type="submit"
              sx={{ borderRadius: 20, px: 3 }}
            >
              {createPostMutation.isPending ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

export default CreatePost;
