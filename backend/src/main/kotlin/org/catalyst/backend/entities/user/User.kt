package org.catalyst.backend.entities.user

import jakarta.persistence.*
import org.catalyst.backend.responses.UserResponse
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.time.LocalDateTime
import java.util.*

@Entity
class User(
    @get:JvmName("usernameField")
    val username: String,
    val email: String,
    @get:JvmName("passwordField")
    val password: String,
    val registeredOn: LocalDateTime,
    var refreshToken: String? = null,
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
) : UserDetails {
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return mutableSetOf()
    }

    override fun getPassword(): String {
        return password
    }

    override fun getUsername(): String {
        return email
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun isEnabled(): Boolean {
        return true
    }

    fun toResponse(): UserResponse {
        return UserResponse(
            username,
            registeredOn,
            id!!
        )
    }
}