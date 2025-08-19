package org.catalyst.backend.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

class FieldedResponseStatusException(
    status: HttpStatus,
    reason: String,
    val fields: List<String>
) : ResponseStatusException(status, reason)