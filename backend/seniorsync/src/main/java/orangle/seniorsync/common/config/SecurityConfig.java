package orangle.seniorsync.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.core.authority.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfig {

    @Value("${cognito.region}")
    private String cognitoRegion;

    @Value("${cognito.app-client-id}")
    private String cognitoAppClientId;

    @Value("${cognito.user-pool-id}")
    private String cognitoUserPoolId;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/health").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/**").permitAll() // Spring Boot Actuator endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Allow preflight requests
                        .requestMatchers("/api/auth/**").permitAll() // Public auth endpoints
                        .requestMatchers("/api/test/**").permitAll() // Test endpoints
                        .requestMatchers("/swagger", "/swagger-ui/**", "/api-docs/**").permitAll() // Swagger UI
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                )
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",  // Local next.js server
                "https://senior-sync.vercel.app",
                "https://seniorsync.sg"
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight response for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // Cognito publishes JWKS at: {ISSUER}/.well-known/jwks.json
        String issuer = getIssuer();
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withJwkSetUri(issuer + "/.well-known/jwks.json")
                .build();

        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);

        // token_use must be "access", not "id"
        OAuth2TokenValidator<Jwt> tokenUseValidator = token -> {
            String tokenUse = token.getClaimAsString("token_use");
            return "access".equals(tokenUse)
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN, "token_use must be 'access'", null));
        };

        // Optional: bind tokens to your app client
        OAuth2TokenValidator<Jwt> clientValidator = token -> {
            String clientId = token.getClaimAsString("client_id");
            return cognitoAppClientId.equals(clientId)
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error(OAuth2ErrorCodes.INVALID_TOKEN, "client_id mismatch", null));
        };

        // Validate JWT timestamps (exp, nbf claims)
        JwtTimestampValidator timestampValidator = new JwtTimestampValidator();

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                withIssuer,
                timestampValidator,
                tokenUseValidator,
                clientValidator
        ));
        return decoder;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        // Map OAuth scopes → authorities (SCOPE_xxx)
        JwtGrantedAuthoritiesConverter scopes = new JwtGrantedAuthoritiesConverter();
        scopes.setAuthoritiesClaimName("scope"); // Cognito puts space-delimited scopes in "scope"
        scopes.setAuthorityPrefix("SCOPE_");

        // Custom authorities converter that includes both scopes and Cognito groups
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> authorities = new HashSet<>(scopes.convert(jwt));

            // Map Cognito groups → ROLE_xxx
            List<String> groups = jwt.getClaimAsStringList("cognito:groups");
            if (groups != null) {
                for (String group : groups) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + group.toUpperCase()));
                }
            }

            // Also map custom attributes if needed
            String customRole = jwt.getClaimAsString("custom:role");
            if (customRole != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + customRole.toUpperCase()));
            }

            return authorities;
        });

        return converter;
    }

    private String getIssuer() {
        return String.format("https://cognito-idp.%s.amazonaws.com/%s", cognitoRegion, cognitoUserPoolId);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
