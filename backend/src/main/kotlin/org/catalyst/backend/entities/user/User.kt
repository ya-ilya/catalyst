package org.catalyst.backend.entities.user

import jakarta.persistence.*
import org.catalyst.backend.entities.config.Config
import org.catalyst.backend.entities.subscription.Subscription
import org.catalyst.backend.entities.user.role.Role
import org.catalyst.backend.responses.UserResponse
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.time.LocalDateTime
import java.util.*

@Entity
class User(
    @get:JvmName("usernameField")
    val username: String,
    // password is the key
    @get:JvmName("passwordField")
    var password: String,
    val createdAt: LocalDateTime,
    var isPasswordChangeRequired: Boolean = true,
    var refreshToken: String? = null,
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "role_id")]
    )
    var roles: Set<Role> = emptySet(),
    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], fetch = FetchType.EAGER)
    val subscriptions: List<Subscription> = emptyList(),
    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], fetch = FetchType.EAGER)
    val configs: MutableList<Config> = mutableListOf(),
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null
) : UserDetails {
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> =
        roles.map { SimpleGrantedAuthority(it.name) }.toMutableList()

    override fun getPassword(): String {
        return password
    }

    override fun getUsername(): String {
        return username
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
            id!!,
            username,
            isPasswordChangeRequired,
            createdAt
        )
    }
}