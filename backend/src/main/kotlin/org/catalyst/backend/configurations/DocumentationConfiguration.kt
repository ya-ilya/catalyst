package org.catalyst.backend.configurations

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.media.ArraySchema
import io.swagger.v3.oas.models.media.IntegerSchema
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springdoc.core.utils.SpringDocUtils
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.LocalTime

@Configuration
class DocumentationConfiguration {
    @Bean
    fun openAPI(): OpenAPI {
        SpringDocUtils.getConfig().replaceWithSchema(
            LocalTime::class.java,
            ArraySchema().items(IntegerSchema()).example("[8, 45, 0]")
        )

        return OpenAPI()
            .addSecurityItem(SecurityRequirement().addList("BearerAuthentication"))
            .components(Components().addSecuritySchemes("BearerAuthentication", createAPIKeyScheme()))
    }

    private fun createAPIKeyScheme(): SecurityScheme {
        return SecurityScheme().type(SecurityScheme.Type.HTTP)
            .bearerFormat("JWT")
            .scheme("bearer")
    }
}