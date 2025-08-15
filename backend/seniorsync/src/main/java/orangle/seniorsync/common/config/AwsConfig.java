package orangle.seniorsync.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;

@Configuration
public class AwsConfig {

    @Value("${cognito.region}")
    private String cognitoRegion;

    @Value("${aws.access-key-id:}")
    private String accessKeyId;

    @Value("${aws.secret-access-key:}")
    private String secretAccessKey;

    @Bean
    public AwsCredentialsProvider awsCredentialsProvider() {
        if (accessKeyId != null && !accessKeyId.trim().isEmpty() &&
            secretAccessKey != null && !secretAccessKey.trim().isEmpty()) {
            // Use explicit credentials
            return StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
            );
        }
        throw new IllegalStateException("AWS credentials not configured. " +
                "Please set aws.access-key-id and aws.secret-access-key properties.");
    }

    @Bean
    public CognitoIdentityProviderClient cognitoIdentityProviderClient(
            AwsCredentialsProvider credentialsProvider) {
        return CognitoIdentityProviderClient.builder()
                .region(Region.of(cognitoRegion))
                .credentialsProvider(credentialsProvider)
                .build();
    }
}
