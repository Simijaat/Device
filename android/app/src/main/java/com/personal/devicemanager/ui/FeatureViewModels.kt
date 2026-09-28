package com.personal.devicemanager.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.personal.devicemanager.data.AppDatabase
import com.personal.devicemanager.data.LocalState
import com.personal.devicemanager.repository.SmsRepository
import com.personal.devicemanager.repository.ContactsRepository
import com.personal.devicemanager.repository.CallLogRepository
import com.personal.devicemanager.repository.AppInventoryRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SmsViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)
    private val localState = LocalState(application)
    private val repository = SmsRepository(application, db.smsDao(), localState)

    val allSms = repository.getAllSms().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun clearSms() = viewModelScope.launch { repository.clearSms() }
}

class ContactsViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)
    private val localState = LocalState(application)
    private val repository = ContactsRepository(application, db.contactDao(), localState)

    val allContacts = repository.getAllContacts().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun clearContacts() = viewModelScope.launch { repository.clearContacts() }
}

class CallLogViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)
    private val localState = LocalState(application)
    private val repository = CallLogRepository(application, db.callLogDao(), localState)

    val allCallLogs = repository.getAllCallLogs().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun clearCallLogs() = viewModelScope.launch { repository.clearCallLogs() }
}

class AppInventoryViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)
    private val localState = LocalState(application)
    private val repository = AppInventoryRepository(application, db.appDao(), localState)

    val allApps = repository.getAllApps().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun clearApps() = viewModelScope.launch { repository.clearApps() }
}
