package org.catalyst.backend.configurations.filters

import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentMap

@Component
class RateLimitingFilter : OncePerRequestFilter() {
    @Value($$"${catalyst.rate-limiting.capacity}")
    private val capacity: Long? = null

    @Value($$"${catalyst.rate-limiting.refill-minutes}")
    private val refillMinutes: Long? = null

    private val buckets: ConcurrentMap<String?, Bucket> = ConcurrentHashMap<String?, Bucket>()

    private fun getBucket(clientId: String?): Bucket {
        return buckets.computeIfAbsent(clientId) { k: String? ->
            Bucket.builder()
                .addLimit(
                    Bandwidth
                        .builder()
                        .capacity(capacity!!)
                        .refillIntervally(capacity, Duration.ofMinutes(refillMinutes!!))
                        .build()
                )
                .build()
        }
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val httpRequest = request
        val clientIp = httpRequest.remoteAddr
        val bucket: Bucket = getBucket(clientIp)

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response)
        } else {
            response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(), "Too Many Requests")
        }
    }
}