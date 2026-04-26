package org.catalyst.sdk

import com.google.gson.GsonBuilder
import com.yourcompany.minecraft.sdk.api.AuthenticationService
import okhttp3.OkHttpClient
import org.catalyst.sdk.adapters.LocalDateTimeTypeAdapter
import org.catalyst.sdk.services.AdminService
import org.catalyst.sdk.services.CapeService
import org.catalyst.sdk.services.ConfigService
import org.catalyst.sdk.services.MeService
import org.catalyst.sdk.services.UserService
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.time.LocalDateTime

class CatalystApi(
    val baseUrl: String,
    var apiKey: String? = null
) {
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val originalRequest = chain.request()
            val builder = originalRequest.newBuilder()
                .header("Authorization", "Bearer $apiKey")
            chain.proceed(builder.build())
        }
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .client(okHttpClient)
        .addConverterFactory(
            GsonConverterFactory.create(
                GsonBuilder()
                    .registerTypeAdapter(LocalDateTime::class.java, LocalDateTimeTypeAdapter)
                    .create()
            )
        )
        .build()

    val adminService: AdminService = retrofit.create(AdminService::class.java)
    val authenticationService: AuthenticationService = retrofit.create(AuthenticationService::class.java)
    val capeService: CapeService = retrofit.create(CapeService::class.java)
    val configService: ConfigService = retrofit.create(ConfigService::class.java)
    val meService: MeService = retrofit.create(MeService::class.java)
    val userService: UserService = retrofit.create(UserService::class.java)
}