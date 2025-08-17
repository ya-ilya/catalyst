package org.catalyst.backend.requests

import jakarta.validation.constraints.Size
import org.catalyst.backend.entities.config.ConfigPart

class CreateConfigRequest(
    @Size(min = 4, max = 32)
    val name: String,
    val parts: List<ConfigPart>,
    val isPublic: Boolean
)