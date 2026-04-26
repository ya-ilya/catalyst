package org.catalyst.sdk.services

import okhttp3.ResponseBody
import org.catalyst.common.responses.CapeResponse
import org.catalyst.common.responses.UserProfileResponse
import retrofit2.Call
import retrofit2.http.*
import java.util.*

interface CapeService {
    @GET("/api/capes")
    fun getCapes(
        @Query("limit") limit: Int = 10,
        @Query("offset") offset: Int = 0,
        @Query("filter") filter: String? = null,
        @Query("sortBy") sortBy: String? = null
    ): Call<List<CapeResponse>>

    @GET("/api/capes/{id}")
    fun getCapeById(
        @Path("id") id: UUID
    ): Call<CapeResponse>

    @POST("/api/capes/{id}/select")
    fun select(
        @Path("id") id: UUID
    ): Call<Unit>

    @GET("/api/users/{uuid}/profile")
    fun getUserProfile(
        @Path("uuid") uuid: UUID
    ): Call<UserProfileResponse>

    @GET("/api/capes/{id}/image")
    @Streaming
    fun getCapeImage(
        @Path("id") id: UUID
    ): Call<ResponseBody>
}