package com.personal.devicemanager.repository

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.provider.CallLog
import androidx.core.content.ContextCompat
import com.personal.devicemanager.data.CallLogDao
import com.personal.devicemanager.data.CallLogRecord
import com.personal.devicemanager.data.LocalState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class CallLogRepository(
    private val context: Context,
    private val callLogDao: CallLogDao,
    private val localState: LocalState
) {
    fun getAllCallLogs(): Flow<List<CallLogRecord>> {
        return callLogDao.getAllCallLogs()
    }

    suspend fun syncCallLogs() {
        if (!localState.masterCollectionEnabled || !localState.callLogCollectionEnabled) {
            return
        }

        if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED) {
            return
        }

        withContext(Dispatchers.IO) {
            val callList = mutableListOf<CallLogRecord>()
            val cursor = context.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                arrayOf(CallLog.Calls._ID, CallLog.Calls.NUMBER, CallLog.Calls.TYPE, CallLog.Calls.DATE, CallLog.Calls.DURATION),
                null, null, CallLog.Calls.DEFAULT_SORT_ORDER + " LIMIT 500"
            )

            cursor?.use {
                val idIndex = it.getColumnIndexOrThrow(CallLog.Calls._ID)
                val numberIndex = it.getColumnIndexOrThrow(CallLog.Calls.NUMBER)
                val typeIndex = it.getColumnIndexOrThrow(CallLog.Calls.TYPE)
                val dateIndex = it.getColumnIndexOrThrow(CallLog.Calls.DATE)
                val durationIndex = it.getColumnIndexOrThrow(CallLog.Calls.DURATION)

                while (it.moveToNext()) {
                    val id = it.getString(idIndex)
                    val number = it.getString(numberIndex) ?: "Unknown"
                    val type = it.getInt(typeIndex)
                    val date = it.getLong(dateIndex)
                    val duration = it.getLong(durationIndex)

                    callList.add(CallLogRecord(id, number, type, date, duration))
                }
            }

            if (callList.isNotEmpty()) {
                callLogDao.insertAll(callList)
            }
        }
    }

    suspend fun clearCallLogs() {
        callLogDao.clearAll()
    }
}
