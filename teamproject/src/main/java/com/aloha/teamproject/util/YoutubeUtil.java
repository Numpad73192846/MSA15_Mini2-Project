package com.aloha.teamproject.util;

import org.springframework.stereotype.Component;

@Component
public class YoutubeUtil {

    public String toEmbedUrl(String url) {
        if (url == null || url.isBlank()) return null;

        if (url.contains("youtu.be/")) {
            String id = url.substring(url.lastIndexOf("/") + 1);
            return "https://www.youtube.com/embed/" + id;
        }

        if (url.contains("watch?v=")) {
            String id = url.substring(url.indexOf("watch?v=") + 8);
            int amp = id.indexOf("&");
            if (amp != -1) {
                id = id.substring(0, amp);
            }
            return "https://www.youtube.com/embed/" + id;
        }

        if (url.contains("/embed/")) {
            return url;
        }

        throw new IllegalArgumentException("유효하지 않은 유튜브 URL");
    }
    
}
