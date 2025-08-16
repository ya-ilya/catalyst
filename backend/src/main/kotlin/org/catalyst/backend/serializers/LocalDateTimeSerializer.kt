package org.catalyst.backend.serializers

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

class LocalDateTimeSerializer : JsonSerializer<LocalDateTime>() {
    private companion object {
        val formatter: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
    }

    override fun serialize(value: LocalDateTime, generator: JsonGenerator, provider: SerializerProvider) {
        generator.writeString(
            value
                .atZone(ZoneOffset.UTC)
                .format(formatter)
        )
    }
}