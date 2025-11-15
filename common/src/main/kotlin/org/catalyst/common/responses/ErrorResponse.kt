package org.catalyst.common.responses

data class ErrorResponse(
    val status: Int,
    val message: String? = null,
    val fields: List<String>? = null
)