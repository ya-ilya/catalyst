package org.catalyst.backend.services.pagination

import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.io.Serializable

class OffsetBasedPageRequest(offset: Int, limit: Int, private val sort: Sort = Sort.unsorted()) :
    Pageable, Serializable {
    private val limit: Int
    private val offset: Int

    init {
        if (offset < 0 || limit < 1) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        }

        this.limit = limit
        this.offset = offset
    }

    override fun getPageNumber(): Int {
        return offset / limit
    }

    override fun getPageSize(): Int {
        return limit
    }

    override fun getOffset(): Long {
        return offset.toLong()
    }

    override fun getSort(): Sort {
        return sort
    }

    override fun next(): Pageable {
        return OffsetBasedPageRequest(offset + pageSize, pageSize, sort)
    }

    fun previous(): OffsetBasedPageRequest {
        return if (hasPrevious()) OffsetBasedPageRequest(offset - pageSize, pageSize, sort) else this
    }

    override fun previousOrFirst(): Pageable {
        return if (hasPrevious()) previous() else first()
    }

    override fun first(): Pageable {
        return OffsetBasedPageRequest(0, pageSize, sort)
    }

    override fun withPage(pageNumber: Int): Pageable {
        return OffsetBasedPageRequest(limit * pageNumber, limit, sort)
    }

    override fun hasPrevious(): Boolean {
        return offset > limit
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as OffsetBasedPageRequest

        if (limit != other.limit) return false
        if (offset != other.offset) return false
        if (sort != other.sort) return false

        return true
    }

    override fun hashCode(): Int {
        return javaClass.hashCode()
    }

    override fun toString(): String {
        return "OffsetBasedPageRequest(sort=$sort, limit=$limit, offset=$offset)"
    }
}