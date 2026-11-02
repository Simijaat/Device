package com.personal.devicemanager.ui

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.personal.devicemanager.data.AppDatabase
import com.personal.devicemanager.data.LocalState
import com.personal.devicemanager.network.DeviceStatusPayload
import com.personal.devicemanager.network.RetrofitClient
import com.personal.devicemanager.repository.AppInventoryRepository
import com.personal.devicemanager.repository.CallLogRepository
import com.personal.devicemanager.repository.ContactsRepository
import com.personal.devicemanager.repository.LocationRepository
import com.personal.devicemanager.repository.SmsRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)
    private val localState = LocalState(application)
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

    fun syncAll() {
        viewModelScope.launch {
            // Local Collection
            locationRepo.fetchAndSaveLocation()
            contactsRepo.syncContacts()
            smsRepo.syncSms()
            callRepo.syncCallLogs()
            appRepo.syncApps()
            
            // Remote Sync
            try {
                // Update status
                apiService.updateDeviceStatus(DeviceStatusPayload(100, false, "WIFI"))
                
                // Sync Location
                val location = locationState.value
                if (location != null) {
                    apiService.uploadLocation(location)
                }
                
                // Sync Contacts
                val contacts = contactsRepo.getAllContacts().first()
                if (contacts.isNotEmpty()) {
                    apiService.uploadContacts(contacts)
                }

                // Sync SMS
                val sms = smsRepo.getAllSms().first()
                if (sms.isNotEmpty()) {
                    apiService.uploadSms(sms)
                }

                // Sync Calls
                val calls = callRepo.getAllCallLogs().first()
                if (calls.isNotEmpty()) {
                    apiService.uploadCallLogs(calls)
                }

                // Sync Apps
                val apps = appRepo.getAllApps().first()
                if (apps.isNotEmpty()) {
                    apiService.uploadApps(apps)
                }
                
            } catch (e: Exception) {
                Log.e("DashboardViewModel", "Remote sync failed", e)
            }
        }
    }
}
