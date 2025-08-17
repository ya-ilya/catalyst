package org.catalyst.backend.requests

import jakarta.validation.constraints.Size

class CreateConfigRequest(
    @Size(min = 4, max = 32)
    val name: String,
    val data: String,
    val isPublic: Boolean
)