package org.catalyst.common.requests

import jakarta.validation.constraints.Size
import org.catalyst.common.dto.ConfigFileDTO

data class CreateConfigRequest(
    @field:Size(min = 4, max = 32)
    val name: String,
    val files: List<ConfigFileDTO>,
    val isPublic: Boolean
)