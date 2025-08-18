package org.catalyst.backend.entities.config

import jakarta.persistence.Embeddable
import org.catalyst.backend.responses.ConfigFileResponse

@Embeddable
class ConfigFile(
    val name: String,
    val data: String
) {
    fun toResponse() = ConfigFileResponse(name, data.length)
}