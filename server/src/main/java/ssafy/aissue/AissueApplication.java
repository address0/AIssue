package ssafy.aissue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing  // 이 어노테이션을 추가하여 Auditing 활성화
@EnableScheduling
public class AissueApplication {

    public static void main(String[] args) {
        SpringApplication.run(AissueApplication.class, args);
    }

}
