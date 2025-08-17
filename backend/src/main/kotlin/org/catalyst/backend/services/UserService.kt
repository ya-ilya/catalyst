package org.catalyst.backend.services

import org.catalyst.backend.entities.user.User
import org.catalyst.backend.entities.user.UserRepository
import org.catalyst.backend.entities.user.role.RoleRepository
import org.springframework.http.HttpStatus
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val passwordEncoder: PasswordEncoder
) : UserDetailsService {
    fun getUserById(id: UUID): User {
        return userRepository
            .findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "User not found") }
    }

    fun findUserByUsername(username: String): Optional<User> {
        return userRepository.findByUsername(username)
    }

    fun getUsers(): List<User> {
        return userRepository.findAll()
    }

    fun createUser(
        username: String,
        password: String
    ): User {
        val defaultRole = roleRepository
            .findByName("ROLE_USER")
            .orElseThrow { IllegalStateException("Default role ROLE_USER not found!") }

        return userRepository.save(
            User(
                username,
                passwordEncoder.encode(password),
                LocalDateTime.now(ZoneOffset.UTC),
                roles = setOf(defaultRole)
            )
        )
    }

    fun updateUser(user: User): User {
        return userRepository.save(user)
    }

    fun changePassword(user: User, password: String) {
        updateUser(user.apply {
            this.password = password
            this.isPasswordChangeRequired = false
        })
    }

    fun checkPassword(user: User, password: String): Boolean {
        return passwordEncoder.matches(password, user.password)
    }

    fun deleteUser(user: User) {
        userRepository.delete(user)
    }

    fun deleteUserById(id: UUID) {
        userRepository.deleteById(id)
    }

    override fun loadUserByUsername(username: String): UserDetails {
        return userRepository
            .findByUsername(username)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "User not found") }
    }
}