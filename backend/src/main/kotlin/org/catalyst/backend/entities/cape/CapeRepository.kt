package org.catalyst.backend.entities.cape

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.*

interface CapeRepository : JpaRepository<Cape, UUID> {
    @Query(
        """
        SELECT c FROM Cape c
        WHERE (:filter IS NULL) OR 
        (LOWER(c.name) LIKE LOWER(CONCAT('%', :filter, '%')))
    """
    )
    fun findFilteredCapes(
        filter: String?,
        pageable: Pageable
    ): Page<Cape>
}