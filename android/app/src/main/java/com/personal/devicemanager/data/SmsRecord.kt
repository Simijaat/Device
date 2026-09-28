package com.personal.devicemanager.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sms_messages")
data class SmsRecord(
    @PrimaryKey val id: String,
    val sender: String,
    val body: String,
    val timestamp: Long,
    val type: Int, // 1 = Inbox, 2 = Sent
    val classification: String // OTP, NORMAL, UNKNOWN
)
