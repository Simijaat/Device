package com.personal.devicemanager.repository

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.provider.Telephony
import androidx.core.content.ContextCompat
import com.personal.devicemanager.data.LocalState
import com.personal.devicemanager.data.SmsDao
import com.personal.devicemanager.data.SmsRecord
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class SmsRepository(
    private val context: Context,
    private val smsDao: SmsDao,
    private val localState: LocalState
) {
    fun getAllSms(): Flow<List<SmsRecord>> {
        return smsDao.getAllSms()
    }

    fun hasValidPermissionAndConsent(): Boolean {
        val hasPermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_SMS
        ) == PackageManager.PERMISSION_GRANTED
        return hasPermission && localState.masterCollectionEnabled && localState.smsCollectionEnabled
    }

    suspend fun syncSms() {
        if (!hasValidPermissionAndConsent()) {
            return
        }

        withContext(Dispatchers.IO) {
            val smsList = mutableListOf<SmsRecord>()
            val cursor = context.contentResolver.query(
                Telephony.Sms.CONTENT_URI,
                arrayOf(Telephony.Sms._ID, Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE, Telephony.Sms.TYPE),
                null, null, Telephony.Sms.DEFAULT_SORT_ORDER + " LIMIT 100"
            )

            cursor?.use {
                val idIndex = it.getColumnIndexOrThrow(Telephony.Sms._ID)
                val addressIndex = it.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
                val bodyIndex = it.getColumnIndexOrThrow(Telephony.Sms.BODY)
                val dateIndex = it.getColumnIndexOrThrow(Telephony.Sms.DATE)
                val typeIndex = it.getColumnIndexOrThrow(Telephony.Sms.TYPE)

                while (it.moveToNext()) {
                    val id = it.getString(idIndex)
                    val sender = it.getString(addressIndex) ?: "Unknown"
                    val body = it.getString(bodyIndex) ?: ""
                    val date = it.getLong(dateIndex)
                    val type = it.getInt(typeIndex)

                    smsList.add(SmsRecord(id, sender, body, date, type, "GENERAL"))
                }
            }

            if (smsList.isNotEmpty()) {
                smsDao.insertAll(smsList)
            }
        }
    }

    suspend fun clearSms() {
        smsDao.clearAll()
    }
}
