package org.catalyst.sdk.services

import org.catalyst.common.requests.CreateConfigRequest
import org.catalyst.common.requests.UpdateConfigRequest
import org.catalyst.common.responses.ConfigFileResponse
import org.catalyst.common.responses.ConfigResponse
import org.catalyst.common.responses.SubscriptionResponse
import retrofit2.Call
import retrofit2.http.*
import java.util.*

interface ConfigService {
    @GET("/api/configs")
    suspend fun getPublicConfigs(
        @Query("limit") limit: Int = 30,
        @Query("offset") offset: Int = 0,
        @Query("query") query: String? = null,
        @Query("author") author: String? = null,
        @Query("tags") tags: List<String>? = null,
        @Query("sortBy") sortBy: String? = "createdAt"
    ): Call<List<ConfigResponse>>

    @GET("/api/configs/{id}")
    fun getConfigById(
        @Path("id") id: UUID
    ): Call<ConfigResponse>

    @GET("/api/configs/{id}/files")
    fun getConfigFiles(
        @Path("id") id: UUID
    ): Call<List<ConfigFileResponse>>

    @GET("/api/configs/{id}/files/{name}")
    fun getConfigFile(
        @Path("id") id: UUID,
        @Path("name") name: String
    ): Call<String>

    @POST("/api/configs/{id}/subscribe")
    fun subscribe(
        @Path("id") id: UUID
    ): Call<SubscriptionResponse>

    @DELETE("/api/configs/{id}/unsubscribe")
    fun unsubscribe(
        @Path("id") id: UUID
    ): Call<Unit>

    @POST("/api/configs")
    fun createConfig(
        @Body request: CreateConfigRequest
    ): Call<ConfigResponse>

    @PATCH("/api/configs/{id}")
    fun updateConfig(
        @Path("id") id: UUID,
        @Body request: UpdateConfigRequest
    ): Call<ConfigResponse>

    @DELETE("/api/configs/{id}")
    fun deleteConfig(
        @Path("id") id: UUID
    ): Call<Unit>
}