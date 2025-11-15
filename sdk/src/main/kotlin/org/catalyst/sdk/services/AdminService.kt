package org.catalyst.sdk.services

import okhttp3.MultipartBody
import okhttp3.RequestBody
import org.catalyst.common.requests.CreateUserRequest
import org.catalyst.common.responses.CapeResponse
import org.catalyst.common.responses.UserCreatedResponse
import org.catalyst.common.responses.UserResponse
import retrofit2.Call
import retrofit2.http.*
import java.util.*

interface AdminService {
    @GET("/api/admin/users")
    fun getUsers(
        @Query("limit") limit: Int = 10,
        @Query("offset") offset: Int = 0,
        @Query("filter") filter: String? = null,
        @Query("sortBy") sortBy: String? = "createdAt"
    ): Call<List<UserResponse>>

    @GET("/api/admin/users/{id}")
    fun getUserById(
        @Path("id") id: UUID
    ): Call<UserResponse>

    @POST("/api/admin/users")
    fun createUser(
        @Body request: CreateUserRequest
    ): Call<UserCreatedResponse>

    @DELETE("/api/admin/users/{id}")
    fun deleteUser(
        @Path("id") id: UUID
    ): Call<Unit>

    @Multipart
    @POST("/api/admin/capes")
    fun createCape(
        @Part("name") name: RequestBody,
        @Part("description") description: RequestBody,
        @Part image: MultipartBody.Part
    ): Call<CapeResponse>

    @DELETE("/api/admin/capes/{id}")
    fun deleteCape(
        @Path("id") id: UUID
    ): Call<Unit>
}