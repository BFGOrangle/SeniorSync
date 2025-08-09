package orangle.seniorsync.crm.aifeatures.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.apache.http.impl.client.CloseableHttpClient;

import lombok.extern.slf4j.Slf4j;

@Component
@Qualifier("claude")
@Slf4j
public class ClaudeLLMClient implements LLMClient{
    @Value("${llm.api.key}")
    private String apiKey;

    @Value("${llm.api.base-url}")
    private String baseUrl;

    @Value("${llm.api.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String callLLM(String prompt) {
        try(CloseableHttpClient client = HttpClients.createDefault()) {
            log.info("Calling claude LLM");
            HttpPost post = new HttpPost(baseUrl);
            post.setHeader("x-api-key", apiKey);
            post.setHeader("Content-Type", "application/json");
            post.setHeader("anthropic-version", "2023-06-01");

            // Create a JSON request body
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("max_tokens", 1024);
            requestBody.put("model", model);
            requestBody.putArray("messages")
                    .addObject()
                    .put("role", "user")
                    .put("content", prompt);

            String body = objectMapper.writeValueAsString(requestBody);
            post.setEntity(new StringEntity(body));

            try (CloseableHttpResponse response = client.execute(post)) {
                String responseBody = EntityUtils.toString(response.getEntity());
                // Parse response and extract content
                ObjectNode responseJson = (ObjectNode) objectMapper.readTree(responseBody);
                log.info("Response body:" + responseJson.toString());
                return responseJson.path("content").path(0).path("text").asText();
            } catch (Exception e) {
                log.error(e.getMessage(), e);
                return null;
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to call LLM", e);
        }
    }
}
