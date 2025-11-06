package com.socialmedia.platform.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String FOLLOW_TOPIC = "follow-events";
    public static final String POST_TOPIC = "post-events";
    public static final String NOTIFICATION_TOPIC = "notification-events";

    @Bean
    public NewTopic followTopic() {
        return TopicBuilder.name(FOLLOW_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic postTopic() {
        return TopicBuilder.name(POST_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic notificationTopic() {
        return TopicBuilder.name(NOTIFICATION_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
