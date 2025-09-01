package org.catalyst.backend.services

import org.catalyst.backend.entities.user.User
import org.catalyst.backend.entities.user.UserRepository
import org.catalyst.backend.entities.user.role.RoleRepository
import org.catalyst.backend.exceptions.FieldedResponseStatusException
import org.catalyst.backend.services.pagination.OffsetBasedPageRequest
import org.springframework.data.domain.Page
import org.springframework.data.jpa.domain.JpaSort
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

    fun getUsers(
        limit: Int,
        offset: Int,
        filter: String?
    ): Page<User> {
        return userRepository.findFilteredUsers(
            filter,
            OffsetBasedPageRequest(offset, limit, JpaSort.by("createdAt"))
        )
    }

    fun createUser(
        username: String,
        password: String
    ): User {
        if (findUserByUsername(username).isPresent) {
            throw FieldedResponseStatusException(
                HttpStatus.CONFLICT,
                "User with same name already exists",
                listOf("username")
            )
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