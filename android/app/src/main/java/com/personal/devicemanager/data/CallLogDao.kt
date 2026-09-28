package com.personal.devicemanager.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface CallLogDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(calls: List<CallLogRecord>)

    @Query("SELECT * FROM call_logs ORDER BY date DESC")
    fun getAllCallLogs(): Flow<List<CallLogRecord>>

    @Query("DELETE FROM call_logs")
    suspend fun clearAll()
}
