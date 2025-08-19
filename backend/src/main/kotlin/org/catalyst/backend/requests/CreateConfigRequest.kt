package org.catalyst.backend.requests

import jakarta.validation.constraints.Size
import org.catalyst.backend.entities.config.ConfigFile

class CreateConfigRequest(
    @field:Size(min = 4, max = 32)
    val name: String,
    val files: List<ConfigFile>,
    val isPublic: Boolean
)