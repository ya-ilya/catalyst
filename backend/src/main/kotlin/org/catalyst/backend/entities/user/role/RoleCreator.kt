package org.catalyst.backend.entities.user.role

import org.springframework.boot.CommandLineRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

@Component
@Order(1)
class RoleCreator(private val roleRepository: RoleRepository) : CommandLineRunner {
    override fun run(vararg args: String?) {
        createRoleIfNotFound("ROLE_USER")
        createRoleIfNotFound("ROLE_ADMIN")
    }

    private fun createRoleIfNotFound(roleName: String) {
        val roleOptional = roleRepository.findByName(roleName)
        if (roleOptional.isEmpty) {
            val newRole = Role(name = roleName)
            roleRepository.save(newRole)
            println("Created default role: $roleName")
        }
    }
}