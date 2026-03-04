package org.catalyst.backend.serializers

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.ser.std.StdSerializer
import org.springframework.boot.jackson.JacksonComponent
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

@JacksonComponent
class LocalDateTimeSerializer : StdSerializer<LocalDateTime>(LocalDateTime::class.java) {
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