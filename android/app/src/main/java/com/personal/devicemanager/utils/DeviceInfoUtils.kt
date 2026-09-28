package com.personal.devicemanager.utils

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.BatteryManager
import android.os.Build
import android.content.pm.PackageManager

data class DeviceInfo(
    val model: String,
    val manufacturer: String,
    val androidVersion: String,
    val sdkVersion: Int,
    val appVersion: String,
    val batteryPercentage: Int,
    val isCharging: Boolean,
    val networkState: String
)

object DeviceInfoUtils {
    fun getDeviceInfo(context: Context): DeviceInfo {
        val model = Build.MODEL ?: "Unknown"
        val manufacturer = Build.MANUFACTURER ?: "Unknown"
        val androidVersion = Build.VERSION.RELEASE ?: "Unknown"
        val sdkVersion = Build.VERSION.SDK_INT

        var appVersion = "Unknown"
        try {
            val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            appVersion = pInfo.versionName ?: "Unknown"
        } catch (e: PackageManager.NameNotFoundException) {
            e.printStackTrace()
        }

        val batteryStatus: Intent? = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { ifilter ->
            context.registerReceiver(null, ifilter)
        }
        val batteryPercentage = batteryStatus?.let { intent ->
            val level: Int = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
            val scale: Int = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
            (level * 100 / scale.toFloat()).toInt()
        } ?: -1

        val status: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

        var networkState = "Disconnected"
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val capabilities = cm.getNetworkCapabilities(cm.activeNetwork)
        if (capabilities != null) {
            if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
                networkState = "WiFi"
            } else if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) {
                networkState = "Cellular"
            } else if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) {
                networkState = "Ethernet"
            }
        }

        return DeviceInfo(
            model, manufacturer, androidVersion, sdkVersion, appVersion,
            batteryPercentage, isCharging, networkState
        )
    }
}
