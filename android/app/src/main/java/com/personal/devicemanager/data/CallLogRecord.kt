package com.personal.devicemanager.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "call_logs")
data class CallLogRecord(
    @PrimaryKey val id: String,
    val number: String,
    val callType: Int, // e.g. INCOMING, OUTGOING, MISSED
    val date: Long,
    val duration: Long
)
