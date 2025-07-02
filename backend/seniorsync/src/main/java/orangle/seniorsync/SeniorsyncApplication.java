package orangle.seniorsync;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SeniorsyncApplication {

	public static void main(String[] args) {
		SpringApplication.run(SeniorsyncApplication.class, args);
	}

}
