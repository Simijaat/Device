package com.personal.devicemanager.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.personal.devicemanager.data.AppDatabase
import com.personal.devicemanager.data.LocalState
import com.personal.devicemanager.repository.AppInventoryRepository
import com.personal.devicemanager.repository.CallLogRepository
import com.personal.devicemanager.repository.ContactsRepository
import com.personal.devicemanager.repository.LocationRepository
import com.personal.devicemanager.repository.SmsRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)
    private val localState = LocalState(application)

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
            locationRepo.fetchAndSaveLocation()
            contactsRepo.syncContacts()
            smsRepo.syncSms()
            callRepo.syncCallLogs()
            appRepo.syncApps()
        }
    }
}
