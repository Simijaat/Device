package com.personal.devicemanager.data

import android.content.Context
import android.content.SharedPreferences

class LocalState(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("DeviceManagerPrefs", Context.MODE_PRIVATE)

    var masterCollectionEnabled: Boolean
        get() = prefs.getBoolean("masterCollectionEnabled", false)
        set(value) = prefs.edit().putBoolean("masterCollectionEnabled", value).apply()

    var syncInterval: Int
        get() = prefs.getInt("syncInterval", 60)
        set(value) = prefs.edit().putInt("syncInterval", value).apply()

    var wifiOnly: Boolean
        get() = prefs.getBoolean("wifiOnly", true)
        set(value) = prefs.edit().putBoolean("wifiOnly", value).apply()

    var autoDeleteEnabled: Boolean
        get() = prefs.getBoolean("autoDeleteEnabled", false)
        set(value) = prefs.edit().putBoolean("autoDeleteEnabled", value).apply()
}
