package com.personal.devicemanager.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface LocationDao {
    @Insert
    suspend fun insert(location: LocationRecord)

    @Query("SELECT * FROM locations ORDER BY timestamp DESC")
    fun getAllLocations(): Flow<List<LocationRecord>>

    @Query("SELECT * FROM locations ORDER BY timestamp DESC LIMIT 1")
    fun getLatestLocation(): Flow<LocationRecord?>

    @Query("DELETE FROM locations")
    suspend fun clearAll()
}
