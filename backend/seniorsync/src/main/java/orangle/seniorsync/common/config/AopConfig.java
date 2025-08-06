package orangle.seniorsync.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

/**
 * Configuration to enable AspectJ auto-proxying for multi-tenancy support
 */
@Configuration
@EnableAspectJAutoProxy
public class AopConfig {
    // AOP configuration is handled by the @EnableAspectJAutoProxy annotation
}
