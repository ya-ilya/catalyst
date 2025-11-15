package org.catalyst.common.requests

import jakarta.validation.constraints.Size
import org.catalyst.common.dto.ConfigFileDTO

data class UpdateConfigRequest(
    @field:Size(min = 4, max = 32)
    val name: String? = null,
    val files: List<ConfigFileDTO>? = null,
    val tags: List<String>? = null,
    val isPublic: Boolean? = null
)