package com.personal.devicemanager.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.personal.devicemanager.R
import com.personal.devicemanager.utils.DeviceInfoUtils

class DeviceInfoFragment : Fragment() {
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_device_info, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val tvDeviceInfo = view.findViewById<TextView>(R.id.tvDeviceInfo)

        try {
            val info = DeviceInfoUtils.getDeviceInfo(requireContext())
            val text = """
                Model: ${info.model}
                Manufacturer: ${info.manufacturer}
                Android Version: ${info.androidVersion}
                SDK Version: ${info.sdkVersion}
                App Version: ${info.appVersion}
                Battery: ${info.batteryPercentage}% ${if (info.isCharging) "(Charging)" else ""}
                Network: ${info.networkState}
            """.trimIndent()
            tvDeviceInfo.text = text
        } catch (e: Exception) {
            tvDeviceInfo.text = "Error loading device info: ${e.message}"
        }
    }
}
