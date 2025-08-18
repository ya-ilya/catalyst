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
        if (findUserByUsername(username).isPresent) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "User with same name already exists")
        }

        val userRole = roleRepository
            .findByName("ROLE_USER")
            .orElseThrow { IllegalStateException("Role ROLE_USER not found!") }

        return userRepository.save(
            User(
                username,
                passwordEncoder.encode(password),
                LocalDateTime.now(ZoneOffset.UTC),
                roles = setOf(userRole),
                isPasswordChangeRequired = true
            )
        )
    }

    fun createAdmin(
        username: String,
        password: String
    ): User {
        val userRole = roleRepository
            .findByName("ROLE_USER")
            .orElseThrow { IllegalStateException("Role ROLE_USER not found!") }

        val adminRole = roleRepository
            .findByName("ROLE_ADMIN")
            .orElseThrow { IllegalStateException("Role ROLE_ADMIN not found!") }

        return userRepository.save(
            User(
                username,
                passwordEncoder.encode(password),
                LocalDateTime.now(ZoneOffset.UTC),
                roles = setOf(userRole, adminRole),
                isPasswordChangeRequired = false
            )
        )
    }

    fun updateUser(user: User): User {
        return userRepository.save(user)
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