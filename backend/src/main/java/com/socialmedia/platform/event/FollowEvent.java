package com.socialmedia.platform.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FollowEvent {

    private Long followerId;
    private Long followingId;
    private String followerUsername;
    private EventType eventType;

    public enum EventType {
        FOLLOWED,
        UNFOLLOWED
    }
}
