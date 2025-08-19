package org.catalyst.backend.requests

import jakarta.validation.constraints.Size
import org.catalyst.backend.entities.config.ConfigFile

class UpdateConfigRequest(
    @field:Size(min = 4, max = 32)
    val name: String? = null,
    val files: List<ConfigFile>? = null
)