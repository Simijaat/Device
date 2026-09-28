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

    // Feature Toggles
    var locationCollectionEnabled: Boolean
        get() = prefs.getBoolean("locationCollectionEnabled", false)
        set(value) = prefs.edit().putBoolean("locationCollectionEnabled", value).apply()

    var smsCollectionEnabled: Boolean
        get() = prefs.getBoolean("smsCollectionEnabled", false)
        set(value) = prefs.edit().putBoolean("smsCollectionEnabled", value).apply()

    var callLogCollectionEnabled: Boolean
        get() = prefs.getBoolean("callLogCollectionEnabled", false)
        set(value) = prefs.edit().putBoolean("callLogCollectionEnabled", value).apply()

    var contactsCollectionEnabled: Boolean
        get() = prefs.getBoolean("contactsCollectionEnabled", false)
        set(value) = prefs.edit().putBoolean("contactsCollectionEnabled", value).apply()

    var appInventoryCollectionEnabled: Boolean
        get() = prefs.getBoolean("appInventoryCollectionEnabled", false)
        set(value) = prefs.edit().putBoolean("appInventoryCollectionEnabled", value).apply()
}
