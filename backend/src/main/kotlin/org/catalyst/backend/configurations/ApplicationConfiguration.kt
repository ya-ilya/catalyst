package org.catalyst.backend.configurations

import com.fasterxml.jackson.annotation.JsonInclude
import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
class ApplicationConfiguration {
    @Bean
    fun authenticationManager(config: AuthenticationConfiguration): AuthenticationManager {
        return config.authenticationManager
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return Argon2PasswordEncoder(
            16, 32, 1, 4096, 3
        )
    }

    @Bean
    fun jsonCustomizer(): JsonMapperBuilderCustomizer {
        return JsonMapperBuilderCustomizer { builder ->
            builder.changeDefaultPropertyInclusion { inclusion ->
                inclusion
                    .withValueInclusion(JsonInclude.Include.NON_NULL)
                    .withContentInclusion(JsonInclude.Include.NON_EMPTY)
            }
        }
    }
}