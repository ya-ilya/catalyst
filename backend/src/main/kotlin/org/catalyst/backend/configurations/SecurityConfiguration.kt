package org.catalyst.backend.configurations

import org.catalyst.backend.configurations.filter.AuthenticationFilter
import org.catalyst.backend.configurations.filter.RateLimitingFilter
import org.catalyst.backend.services.UserService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configurers.CorsConfigurer
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer
import org.springframework.security.config.annotation.web.configurers.SessionManagementConfigurer
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true, prePostEnabled = true)
class SecurityConfiguration(
    private val userService: UserService,
    private val authenticationFilter: AuthenticationFilter,
    private val rateLimitingFilter: RateLimitingFilter,
    private val passwordEncoder: PasswordEncoder
) {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain? {
        http.csrf { obj: CsrfConfigurer<HttpSecurity> -> obj.disable() }
            .cors { cors: CorsConfigurer<HttpSecurity?> ->
                cors.configurationSource {
                    val corsConfiguration = CorsConfiguration()
                    corsConfiguration.allowedOriginPatterns = listOf("*")
                    corsConfiguration.allowedMethods = listOf(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                    )
                    corsConfiguration.allowedHeaders = listOf("*")
                    corsConfiguration.allowCredentials = true
                    corsConfiguration
                }
            }
            .authorizeHttpRequests { request ->
                request
                    .requestMatchers(HttpMethod.GET, "/api/capes/{id}/image").permitAll()
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().permitAll()
            }
            .sessionManagement { manager: SessionManagementConfigurer<HttpSecurity?> ->
                manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
            .addFilterBefore(rateLimitingFilter, AuthenticationFilter::class.java)
        return http.build()
    }

    @Bean
    fun authenticationProvider(): AuthenticationProvider {
        val authenticationProvider = DaoAuthenticationProvider(userService)
        authenticationProvider.passwordEncoder = passwordEncoder
        return authenticationProvider
    }
}