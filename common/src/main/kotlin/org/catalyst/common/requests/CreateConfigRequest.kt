package org.catalyst.common.requests

import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.Size
import org.catalyst.common.dto.ConfigFileDTO

data class CreateConfigRequest(
    @field:JsonProperty("name")
    @field:Size(min = 4, max = 32)
    val name: String? = null,
    @field:JsonProperty("files")
    val files: List<ConfigFileDTO>? = null,
    @field:JsonProperty("isPublic")
    val isPublic: Boolean? = null
)