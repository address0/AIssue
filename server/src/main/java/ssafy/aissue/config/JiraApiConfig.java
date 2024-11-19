package ssafy.aissue.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class JiraApiConfig {

    @Bean
    public RestTemplate JiraApiUtil() {
        return new RestTemplate();
    }
}
