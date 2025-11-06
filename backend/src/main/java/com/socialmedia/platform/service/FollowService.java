package com.socialmedia.platform.service;

import com.socialmedia.platform.dto.PagedResponse;
import com.socialmedia.platform.dto.UserResponse;
import com.socialmedia.platform.entity.Follow;
import com.socialmedia.platform.entity.User;
import com.socialmedia.platform.event.FollowEvent;
import com.socialmedia.platform.event.NotificationEvent;
import com.socialmedia.platform.exception.BadRequestException;
import com.socialmedia.platform.exception.ResourceNotFoundException;
import com.socialmedia.platform.repository.FollowRepository;
import com.socialmedia.platform.repository.UserRepository;
import com.socialmedia.platform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.socialmedia.platform.config.KafkaConfig.FOLLOW_TOPIC;
import static com.socialmedia.platform.config.KafkaConfig.NOTIFICATION_TOPIC;

@Service
@RequiredArgsConstructor
@Slf4j
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final KafkaTemplate<String, FollowEvent> followKafkaTemplate;
    private final KafkaTemplate<String, NotificationEvent> notificationKafkaTemplate;

    @Transactional
    public void followUser(Long userIdToFollow, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (userIdToFollow.equals(userPrincipal.getId())) {
            throw new BadRequestException("You cannot follow yourself");
        }

        User follower = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        User following = userRepository.findById(userIdToFollow)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userIdToFollow));

        if (followRepository.existsByFollowerIdAndFollowingId(follower.getId(), following.getId())) {
            throw new BadRequestException("Already following this user");
        }

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();

        followRepository.save(follow);
        log.info("User {} followed user {}", follower.getUsername(), following.getUsername());

        // Publish follow event to Kafka
        FollowEvent followEvent = FollowEvent.builder()
                .followerId(follower.getId())
                .followingId(following.getId())
                .followerUsername(follower.getUsername())
                .eventType(FollowEvent.EventType.FOLLOWED)
                .build();

        followKafkaTemplate.send(FOLLOW_TOPIC, followEvent);

        // Send notification to the followed user
        NotificationEvent notificationEvent = NotificationEvent.builder()
                .userId(following.getId())
                .type("NEW_FOLLOWER")
                .message(follower.getUsername() + " started following you")
                .relatedUserId(follower.getId())
                .build();

        notificationKafkaTemplate.send(NOTIFICATION_TOPIC, notificationEvent);
    }

    @Transactional
    public void unfollowUser(Long userIdToUnfollow, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        if (!followRepository.existsByFollowerIdAndFollowingId(userPrincipal.getId(), userIdToUnfollow)) {
            throw new BadRequestException("Not following this user");
        }

        followRepository.deleteByFollowerIdAndFollowingId(userPrincipal.getId(), userIdToUnfollow);
        log.info("User {} unfollowed user {}", userPrincipal.getId(), userIdToUnfollow);

        // Publish unfollow event to Kafka
        FollowEvent followEvent = FollowEvent.builder()
                .followerId(userPrincipal.getId())
                .followingId(userIdToUnfollow)
                .followerUsername(userPrincipal.getUsername())
                .eventType(FollowEvent.EventType.UNFOLLOWED)
                .build();

        followKafkaTemplate.send(FOLLOW_TOPIC, followEvent);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getFollowers(Long userId, Pageable pageable, Authentication authentication) {
        Page<Follow> follows = followRepository.findByFollowingId(userId, pageable);

        return PagedResponse.<UserResponse>builder()
                .content(follows.getContent().stream()
                        .map(follow -> userService.mapToUserResponse(follow.getFollower(), authentication))
                        .toList())
                .pageNumber(follows.getNumber())
                .pageSize(follows.getSize())
                .totalElements(follows.getTotalElements())
                .totalPages(follows.getTotalPages())
                .last(follows.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getFollowing(Long userId, Pageable pageable, Authentication authentication) {
        Page<Follow> follows = followRepository.findByFollowerId(userId, pageable);

        return PagedResponse.<UserResponse>builder()
                .content(follows.getContent().stream()
                        .map(follow -> userService.mapToUserResponse(follow.getFollowing(), authentication))
                        .toList())
                .pageNumber(follows.getNumber())
                .pageSize(follows.getSize())
                .totalElements(follows.getTotalElements())
                .totalPages(follows.getTotalPages())
                .last(follows.isLast())
                .build();
    }
}
