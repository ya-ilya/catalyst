package org.catalyst.backend.responses

class ErrorResponse(
    val status: Int,
    val message: String? = null,
    val fields: List<String>? = null
)