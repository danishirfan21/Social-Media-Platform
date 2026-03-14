package com.socialmedia.platform.service;

import com.socialmedia.platform.dto.PagedResponse;
import com.socialmedia.platform.dto.PostResponse;
import com.socialmedia.platform.entity.Post;
import com.socialmedia.platform.repository.FollowRepository;
import com.socialmedia.platform.repository.PostRepository;
import com.socialmedia.platform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedService {

    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final PostService postService;

    @Transactional(readOnly = true)
    @Cacheable(value = "userFeed", key = "#authentication.principal.id + '-' + #pageable.pageNumber")
    public PagedResponse<PostResponse> getPersonalizedFeed(Authentication authentication, Pageable pageable) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        log.info("Fetching personalized feed for user: {}", userPrincipal.getId());

        // Get IDs of users that the current user follows
        List<Long> followingIds = new ArrayList<>(followRepository.findFollowingIdsByFollowerId(userPrincipal.getId()));

        // Include the user's own posts
        followingIds.add(userPrincipal.getId());

        Page<Post> posts;
        if (followingIds.isEmpty()) {
            // If not following anyone, show all posts
            posts = postRepository.findAll(pageable);
        } else {
            posts = postRepository.findByUserIdInOrderByCreatedAtDesc(followingIds, pageable);
        }

        return createPagedResponse(posts, pageable, authentication);
    }

    private PagedResponse<PostResponse> createPagedResponse(Page<Post> posts, Pageable pageable, Authentication authentication) {
        List<PostResponse> postResponses = new ArrayList<>();

        for (Post post : posts.getContent()) {
            try {
                PostResponse postResponse = postService.mapToPostResponse(post, authentication);
                postResponses.add(postResponse);
            } catch (Exception e) {
                log.error("Error mapping post to response", e);
            }
        }

        return PagedResponse.<PostResponse>builder()
                .content(postResponses)
                .pageNumber(posts.getNumber())
                .pageSize(posts.getSize())
                .totalElements(posts.getTotalElements())
                .totalPages(posts.getTotalPages())
                .last(posts.isLast())
                .build();
    }
}
