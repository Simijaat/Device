package com.personal.devicemanager.repository

import android.content.Context
import com.personal.devicemanager.data.AppDao
import com.personal.devicemanager.data.AppRecord
import com.personal.devicemanager.data.LocalState
import kotlinx.coroutines.flow.Flow

class AppInventoryRepository(
    private val context: Context,
    private val appDao: AppDao,
    private val localState: LocalState
) {
    fun getAllApps(): Flow<List<AppRecord>> {
        return appDao.getAllApps()
    }

    suspend fun syncApps() {
        // App inventory scanning removed to eliminate package visibility probing
        // and respect user privacy and Play Protect policies.
        return
    }

    suspend fun clearApps() {
        appDao.clearAll()
    }
}
