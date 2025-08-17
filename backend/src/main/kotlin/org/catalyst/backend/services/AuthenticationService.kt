package org.catalyst.backend.services

import io.jsonwebtoken.Claims
import io.jsonwebtoken.ExpiredJwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.catalyst.backend.entities.user.User
import org.catalyst.backend.responses.AuthenticationResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.*
import javax.crypto.SecretKey

@Service
class AuthenticationService(
    private val userService: UserService,
    private val passwordEncoder: PasswordEncoder
) {
    @Value("\${token.signing.key}")
    private val jwtSigningKey: String? = null

    fun signIn(username: String, password: String): AuthenticationResponse {
        val user = userService
            .findUserByUsername(username)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "User not found") }

        if (!passwordEncoder.matches(password, user.password)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password")
        }

        SecurityContextHolder.getContext().authentication = UsernamePasswordAuthenticationToken(
            user,
            user.password
        )

        return AuthenticationResponse(
            generateAccessToken(user)!!,
            generateRefreshToken(user)!!,
            user.id!!,
            user.username
        )
    }

    fun refreshToken(refreshToken: String): AuthenticationResponse {
        if (isTokenExpired(refreshToken)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Token expired")
        }

        val username = extractUsername(refreshToken)
        val user = userService
            .findUserByUsername(username)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND) }

        if (!isRefreshTokenValid(refreshToken, user)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        }

        return AuthenticationResponse(
            generateAccessToken(user)!!,
            generateRefreshToken(user)!!,
            user.id!!,
            user.username
        )
    }

    fun generateAccessToken(user: User): String? {
        return generateToken(
            1 * 1 * 15 * 60 * 1000, // 15 MINUTES
            mapOf("id" to user.id!!),
            user
        )
    }

    fun generateRefreshToken(user: User): String? {
        return generateToken(
            1 * 24 * 60 * 60 * 1000, // 1 DAY
            mapOf("id" to user.id!!),
            user
        )?.also {
            user.refreshToken = passwordEncoder.encode(it)
            userService.updateUser(user)
        }
    }

    fun isAccessTokenValid(accessToken: String, user: User): Boolean {
        val username = extractUsername(accessToken)
        if (username != user.username) return false
        if (isTokenExpired(accessToken)) {
            return false
        }
        return true
    }

    fun isRefreshTokenValid(refreshToken: String, user: User): Boolean {
        val username = extractUsername(refreshToken)
        if (username != user.username) return false
        if (!passwordEncoder.matches(refreshToken, user.refreshToken)) return false
        if (isTokenExpired(refreshToken)) {
            user.refreshToken = null
            return false
        }
        return true
    }

    fun extractUsername(token: String): String {
        return extractClaim<String>(token) { it.subject }
    }

    private fun <T> extractClaim(token: String, claimsResolvers: (Claims) -> T): T {
        val claims: Claims = extractAllClaims(token)
        return claimsResolvers(claims)
    }

    private fun generateToken(
        timeInMilliseconds: Long,
        extraClaims: Map<String, Any>,
        user: User
    ): String? {
        return Jwts.builder()
            .claims(extraClaims)
            .subject(user.username)
            .issuedAt(Date(System.currentTimeMillis()))
            .expiration(Date(System.currentTimeMillis() + timeInMilliseconds))
            .signWith(getSigningKey())
            .compact()
    }

    private fun isTokenExpired(token: String): Boolean {
        return extractExpiration(token).before(Date())
    }

    private fun extractExpiration(token: String): Date {
        return extractClaim<Date>(token) { it.expiration }
    }

    private fun extractAllClaims(token: String): Claims {
        return try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .payload
        } catch (ex: ExpiredJwtException) {
            ex.claims
        }
    }

    private fun getSigningKey(): SecretKey? {
        val keyBytes: ByteArray = Decoders.BASE64.decode(jwtSigningKey)
        return Keys.hmacShaKeyFor(keyBytes)
    }
}