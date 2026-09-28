package com.personal.devicemanager.repository

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import androidx.core.content.ContextCompat
import com.personal.devicemanager.data.LocalState
import com.personal.devicemanager.data.LocationDao
import com.personal.devicemanager.data.LocationRecord
import kotlinx.coroutines.flow.Flow

class LocationRepository(
    private val context: Context,
    private val locationDao: LocationDao,
    private val localState: LocalState
) {
    fun getLatestLocation(): Flow<LocationRecord?> {
        return locationDao.getLatestLocation()
    }

    suspend fun fetchAndSaveLocation(): Boolean {
        if (!localState.masterCollectionEnabled || !localState.locationCollectionEnabled) {
            return false
        }

        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return false
        }

        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

        // Try getting last known location from GPS or Network
        var location: Location? = null
        try {
            val isGpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)
            val isNetworkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)

            if (isGpsEnabled) {
                location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
            }
            if (location == null && isNetworkEnabled) {
                location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
            }
        } catch (e: SecurityException) {
            return false
        } catch (e: Exception) {
            return false
        }

        if (location != null) {
            val record = LocationRecord(
                latitude = location.latitude,
                longitude = location.longitude,
                accuracy = location.accuracy,
                timestamp = System.currentTimeMillis()
            )
            locationDao.insert(record)
            return true
        }
        return false
    }

    suspend fun clearLocations() {
        locationDao.clearAll()
    }
}
