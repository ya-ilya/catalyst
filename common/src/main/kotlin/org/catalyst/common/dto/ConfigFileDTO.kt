package org.catalyst.common.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class ConfigFileDTO(
    @field:JsonProperty("name")
    val name: String? = null,
    @field:JsonProperty("data")
    val data: String? = null
)