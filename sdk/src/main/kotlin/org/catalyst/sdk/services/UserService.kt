package org.catalyst.sdk.services

import org.catalyst.common.responses.UserProfileResponse
import retrofit2.Call
import retrofit2.http.GET
import retrofit2.http.Path
import java.util.UUID

interface UserService {
    @GET("/api/users/{uuid}/profile")
    fun getUserProfile(
        @Path("uuid") uuid: UUID
    ): Call<UserProfileResponse>
}