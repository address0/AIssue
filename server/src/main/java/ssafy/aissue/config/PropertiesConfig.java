package ssafy.aissue.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import ssafy.aissue.common.properties.*;

@Configuration
@EnableConfigurationProperties({
        JwtProperties.class,
        S3Properties.class,
})
public class PropertiesConfig {
}

