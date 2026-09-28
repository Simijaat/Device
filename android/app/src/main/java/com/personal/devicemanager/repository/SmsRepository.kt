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
import java.util.Locale

class SmsRepository(
    private val context: Context,
    private val smsDao: SmsDao,
    private val localState: LocalState
) {
    fun getAllSms(): Flow<List<SmsRecord>> {
        return smsDao.getAllSms()
    }

    suspend fun syncSms() {
        if (!localState.masterCollectionEnabled || !localState.smsCollectionEnabled) {
            return
        }

        if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            return
        }

        withContext(Dispatchers.IO) {
            val smsList = mutableListOf<SmsRecord>()
            val cursor = context.contentResolver.query(
                Telephony.Sms.CONTENT_URI,
                arrayOf(Telephony.Sms._ID, Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE, Telephony.Sms.TYPE),
                null, null, Telephony.Sms.DEFAULT_SORT_ORDER + " LIMIT 500" // limit for performance
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

                    val classification = classifySms(body)

                    smsList.add(SmsRecord(id, sender, body, date, type, classification))
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

    private fun classifySms(body: String): String {
        val lowerBody = body.lowercase(Locale.getDefault())
        if (lowerBody.contains("otp") || lowerBody.contains("verification code") ||
            lowerBody.contains("verification pin") || lowerBody.contains("do not share")) {
            return "OTP"
        }
        return "NORMAL"
    }
}
