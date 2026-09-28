package com.personal.devicemanager.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "contacts")
data class ContactRecord(
    @PrimaryKey val contactId: String,
    val name: String,
    val phoneNumbers: String // Comma separated list of phone numbers
)
