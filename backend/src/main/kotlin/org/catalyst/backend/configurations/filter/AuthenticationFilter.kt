package org.catalyst.backend.configurations.filter

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.catalyst.backend.services.AuthenticationService
import org.catalyst.backend.services.UserService
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class AuthenticationFilter(
    private val authenticationService: AuthenticationService,
    private val userService: UserService
) : OncePerRequestFilter() {
    private companion object {
        const val BEARER_PREFIX = "Bearer "
        const val AUTHORIZATION_HEADER = "Authorization"
        const val API_PATH_PREFIX = "/api/"
    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        return !request.requestURI.startsWith(API_PATH_PREFIX)
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token = try {
            request.getHeader(AUTHORIZATION_HEADER).removePrefix(BEARER_PREFIX)
        } catch (ex: Exception) {
            null
        }

        if (token == null) {
            filterChain.doFilter(request, response)
            return
        }

        val email = try {
            authenticationService.extractEmail(token)
        } catch (ex: Exception) {
            ""
        }

        if (email.isNotEmpty() && SecurityContextHolder.getContext().authentication == null) {
            userService.findUserByEmail(email).ifPresent { user ->
                if (authenticationService.isAccessTokenValid(token, user)) {
                    val context = SecurityContextHolder.createEmptyContext()
                    val authToken = UsernamePasswordAuthenticationToken(
                        user,
                        user.password,
                        user.authorities
                    )
                    authToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                    context.authentication = authToken
                    SecurityContextHolder.setContext(context)
                }
            }
        }

        filterChain.doFilter(request, response)
    }
}