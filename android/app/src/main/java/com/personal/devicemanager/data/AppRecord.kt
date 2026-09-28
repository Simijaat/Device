package com.personal.devicemanager.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "apps")
data class AppRecord(
    @PrimaryKey val packageName: String,
    val appName: String,
    val versionName: String,
    val isSystemApp: Boolean
)
