package com.yourcompany.minecraft.sdk.api

import org.catalyst.common.requests.RefreshTokenRequest
import org.catalyst.common.requests.SignInRequest
import org.catalyst.common.responses.AuthenticationResponse
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthenticationService {
    @POST("/authentication/sign-in")
    fun signIn(
        @Body request: SignInRequest
    ): Call<AuthenticationResponse>

    @POST("/authentication/refreshToken")
    fun refreshToken(
        @Body request: RefreshTokenRequest
    ): Call<AuthenticationResponse>
}