package com.personal.devicemanager.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface SmsDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(messages: List<SmsRecord>)

    @Query("SELECT * FROM sms_messages ORDER BY timestamp DESC")
    fun getAllSms(): Flow<List<SmsRecord>>

    @Query("DELETE FROM sms_messages")
    suspend fun clearAll()
}
