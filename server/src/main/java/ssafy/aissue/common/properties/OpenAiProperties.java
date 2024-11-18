package ssafy.aissue.common.properties;


import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "openai")
public record OpenAiProperties(
        String apiKey,
        String apiUrl,
        String apiModel,
         String systemPrompt
) {
}
