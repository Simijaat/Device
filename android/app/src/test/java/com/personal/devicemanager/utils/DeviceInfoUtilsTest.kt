package com.personal.devicemanager.utils

import android.content.Context
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.os.BatteryManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Before
import org.junit.Test
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`

class DeviceInfoUtilsTest {

    private lateinit var mockContext: Context
    private lateinit var mockPackageManager: PackageManager
    private lateinit var mockPackageInfo: PackageInfo
    private lateinit var mockConnectivityManager: ConnectivityManager
    private lateinit var mockNetwork: Network
    private lateinit var mockCapabilities: NetworkCapabilities

    @Before
    fun setUp() {
        mockContext = mock(Context::class.java)
        mockPackageManager = mock(PackageManager::class.java)
        mockPackageInfo = PackageInfo().apply { versionName = "1.0.0" }
        mockConnectivityManager = mock(ConnectivityManager::class.java)
        mockNetwork = mock(Network::class.java)
        mockCapabilities = mock(NetworkCapabilities::class.java)

        `when`(mockContext.packageManager).thenReturn(mockPackageManager)
        `when`(mockContext.packageName).thenReturn("com.test")

        try {
            `when`(mockPackageManager.getPackageInfo(anyString(), anyInt())).thenReturn(mockPackageInfo)
        } catch (e: Exception) {
            // Ignored
        }

        `when`(mockContext.getSystemService(Context.CONNECTIVITY_SERVICE)).thenReturn(mockConnectivityManager)
        `when`(mockConnectivityManager.activeNetwork).thenReturn(mockNetwork)
        `when`(mockConnectivityManager.getNetworkCapabilities(mockNetwork)).thenReturn(mockCapabilities)
        `when`(mockCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)).thenReturn(true)
    }

    @Test
    fun getDeviceInfo_returnsValidInfo() {
        // Battery intent is null in unit test, so we expect defaults
        val info = DeviceInfoUtils.getDeviceInfo(mockContext)

        assertNotNull(info.model)
        assertNotNull(info.manufacturer)
        assertEquals("1.0.0", info.appVersion)
        assertEquals("WiFi", info.networkState)
        assertEquals(-1, info.batteryPercentage)
        assertEquals(false, info.isCharging)
    }
}
