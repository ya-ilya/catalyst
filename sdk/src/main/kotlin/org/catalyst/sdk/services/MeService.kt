package org.catalyst.sdk.services

import okhttp3.ResponseBody
import org.catalyst.common.requests.ChangePasswordRequest
import org.catalyst.common.responses.AuthenticationResponse
import org.catalyst.common.responses.SubscriptionResponse
import org.catalyst.common.responses.UserResponse
import retrofit2.Call
import retrofit2.http.*

interface MeService {
    @GET("/api/me")
    fun getUser(): Call<UserResponse>

    @GET("/api/me/subscriptions")
    fun getSubscriptions(
        @Query("limit") limit: Int = 30,
        @Query("offset") offset: Int = 0,
        @Query("query") query: String? = null,
        @Query("author") author: String? = null,
        @Query("tags") tags: List<String>? = null,
        @Query("sortBy") sortBy: String? = "subscribedAt"
    ): Call<List<SubscriptionResponse>>

    @GET("/api/me/cape/image")
    @Streaming
    fun getCapeImage(): ResponseBody

    @POST("/api/me/cape/unselect")
    fun unselectCape(): Call<Unit>

    @POST("/api/me/change-password")
    fun changePassword(@Body request: ChangePasswordRequest): Call<AuthenticationResponse>
}