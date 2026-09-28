package com.personal.devicemanager.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface AppDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(apps: List<AppRecord>)

    @Query("SELECT * FROM apps ORDER BY appName ASC")
    fun getAllApps(): Flow<List<AppRecord>>

    @Query("DELETE FROM apps")
    suspend fun clearAll()
}
