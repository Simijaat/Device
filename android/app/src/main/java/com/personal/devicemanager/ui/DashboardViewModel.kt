package com.personal.devicemanager.ui

import android.app.Application
import android.os.Build
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.personal.devicemanager.data.AppDatabase
import com.personal.devicemanager.data.EncryptedPrefsManager
import com.personal.devicemanager.data.LocalState
import com.personal.devicemanager.network.*
import com.personal.devicemanager.repository.AppInventoryRepository
import com.personal.devicemanager.repository.CallLogRepository
import com.personal.devicemanager.repository.ContactsRepository
import com.personal.devicemanager.repository.LocationRepository
import com.personal.devicemanager.repository.SmsRepository
import com.personal.devicemanager.utils.DeviceInfoUtils
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)
    private val localState = LocalState(application)
    private val encryptedPrefs = EncryptedPrefsManager(application)
    private val apiService = RetrofitClient.getApiService(application)

    private val locationRepo = LocationRepository(application, db.locationDao(), localState)
    private val contactsRepo = ContactsRepository(application, db.contactDao(), localState)
    private val smsRepo = SmsRepository(application, db.smsDao(), localState)
    private val callRepo = CallLogRepository(application, db.callLogDao(), localState)
    private val appRepo = AppInventoryRepository(application, db.appDao(), localState)

    val locationState = locationRepo.getLatestLocation()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val contactsCount = contactsRepo.getAllContacts().map { it.size }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val smsCount = smsRepo.getAllSms().map { it.size }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val callsCount = callRepo.getAllCallLogs().map { it.size }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val appsCount = appRepo.getAllApps().map { it.size }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    private fun formatIsoDate(timestampMs: Long): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        return sdf.format(Date(timestampMs))
    }

    fun syncAll() {
        viewModelScope.launch {
            val deviceId = encryptedPrefs.getOrCreateDeviceId()
            val deviceInfo = DeviceInfoUtils.getDeviceInfo(getApplication())

            // 1. Device Registration & Telemetry Status (Non-sensitive basic device heartbeat)
            try {
                apiService.registerDevice(
                    RegisterDeviceRequest(
                        id = deviceId,
                        name = "${Build.MANUFACTURER} ${Build.MODEL}",
                        model = Build.MODEL,
                        android_version = "Android ${Build.VERSION.RELEASE}",
                        app_version = deviceInfo.appVersion
                    )
                )

                apiService.updateDeviceStatus(
                    deviceId = deviceId,
                    status = DeviceStatusPayload(
                        battery_level = deviceInfo.batteryPercentage.coerceIn(0, 100),
                        is_charging = deviceInfo.isCharging,
                        network_type = deviceInfo.networkState
                    )
                )
            } catch (e: Exception) {
                Log.w("DashboardViewModel", "Device status sync failed: ${e.message}")
            }

            if (!localState.masterCollectionEnabled) {
                Log.d("DashboardViewModel", "Master collection is disabled; skipping sensitive telemetry sync")
                return@launch
            }

            // 2. Location Collection & Transmission (Double Gated)
            if (locationRepo.hasValidPermissionAndConsent()) {
                locationRepo.fetchAndSaveLocation()
                val latestLocation = locationState.value
                if (latestLocation != null) {
                    try {
                        apiService.uploadLocations(
                            IngestLocationsPayload(
                                device_id = deviceId,
                                locations = listOf(
                                    LocationUploadItem(
                                        latitude = latestLocation.latitude,
                                        longitude = latestLocation.longitude,
                                        accuracy = latestLocation.accuracy,
                                        timestamp = formatIsoDate(latestLocation.timestamp)
                                    )
                                )
                            )
                        )
                    } catch (e: Exception) {
                        Log.w("DashboardViewModel", "Location upload failed: ${e.message}")
                    }
                }
            } else {
                Log.d("DashboardViewModel", "Location sync skipped: permission or consent not granted")
            }

            // 3. Contacts Collection & Transmission (Double Gated)
            if (contactsRepo.hasValidPermissionAndConsent()) {
                contactsRepo.syncContacts()
                val contacts = contactsRepo.getAllContacts().first()
                if (contacts.isNotEmpty()) {
                    try {
                        apiService.uploadContacts(
                            IngestContactsPayload(
                                device_id = deviceId,
                                contacts = contacts.map { ContactUploadItem(it.name, it.phoneNumbers) }
                            )
                        )
                    } catch (e: Exception) {
                        Log.w("DashboardViewModel", "Contacts upload failed: ${e.message}")
                    }
                }
            } else {
                Log.d("DashboardViewModel", "Contacts sync skipped: permission or consent not granted")
            }

            // 4. SMS Collection & Transmission (Double Gated)
            if (smsRepo.hasValidPermissionAndConsent()) {
                smsRepo.syncSms()
                val smsList = smsRepo.getAllSms().first()
                if (smsList.isNotEmpty()) {
                    try {
                        apiService.uploadMessages(
                            IngestMessagesPayload(
                                device_id = deviceId,
                                messages = smsList.map {
                                    MessageUploadItem(
                                        sender = it.sender,
                                        content = it.body,
                                        type = if (it.type == 2) "sent" else "inbox",
                                        timestamp = formatIsoDate(it.timestamp)
                                    )
                                }
                            )
                        )
                    } catch (e: Exception) {
                        Log.w("DashboardViewModel", "SMS upload failed: ${e.message}")
                    }
                }
            } else {
                Log.d("DashboardViewModel", "SMS sync skipped: permission or consent not granted")
            }

            // 5. Call Logs Collection & Transmission (Double Gated)
            if (callRepo.hasValidPermissionAndConsent()) {
                callRepo.syncCallLogs()
                val callList = callRepo.getAllCallLogs().first()
                if (callList.isNotEmpty()) {
                    try {
                        apiService.uploadCalls(
                            IngestCallsPayload(
                                device_id = deviceId,
                                calls = callList.map {
                                    val callType = when (it.callType) {
                                        1 -> "incoming"
                                        2 -> "outgoing"
                                        3 -> "missed"
                                        else -> "incoming"
                                    }
                                    CallUploadItem(
                                        number = it.number,
                                        type = callType,
                                        duration = it.duration.toInt(),
                                        timestamp = formatIsoDate(it.date)
                                    )
                                }
                            )
                        )
                    } catch (e: Exception) {
                        Log.w("DashboardViewModel", "Call log upload failed: ${e.message}")
                    }
                }
            } else {
                Log.d("DashboardViewModel", "Call logs sync skipped: permission or consent not granted")
            }
        }
    }
}
