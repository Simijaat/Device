package com.personal.devicemanager.repository

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import com.personal.devicemanager.data.AppDao
import com.personal.devicemanager.data.AppRecord
import com.personal.devicemanager.data.LocalState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class AppInventoryRepository(
    private val context: Context,
    private val appDao: AppDao,
    private val localState: LocalState
) {
    fun getAllApps(): Flow<List<AppRecord>> {
        return appDao.getAllApps()
    }

    suspend fun syncApps() {
        if (!localState.masterCollectionEnabled || !localState.appInventoryCollectionEnabled) {
            return
        }

        withContext(Dispatchers.IO) {
            val pm = context.packageManager
            val packages = pm.getInstalledPackages(0)
            val appList = mutableListOf<AppRecord>()

            for (pack in packages) {
                val appInfo = pack.applicationInfo ?: continue
                val appName = pm.getApplicationLabel(appInfo).toString()
                val isSystemApp = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                val versionName = pack.versionName ?: "Unknown"

                appList.add(AppRecord(pack.packageName, appName, versionName, isSystemApp))
            }

            if (appList.isNotEmpty()) {
                appDao.insertAll(appList)
            }
        }
    }

    suspend fun clearApps() {
        appDao.clearAll()
    }
}
