package com.personal.devicemanager.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Switch
import androidx.fragment.app.Fragment
import com.personal.devicemanager.R
import com.personal.devicemanager.data.LocalState

class SettingsFragment : Fragment() {
    private lateinit var localState: LocalState

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_settings, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        localState = LocalState(requireContext())

        val switchMaster = view.findViewById<Switch>(R.id.switchMasterCollection)
        val switchWifi = view.findViewById<Switch>(R.id.switchWifiOnly)
        val switchAutoDelete = view.findViewById<Switch>(R.id.switchAutoDelete)

        switchMaster.isChecked = localState.masterCollectionEnabled
        switchWifi.isChecked = localState.wifiOnly
        switchAutoDelete.isChecked = localState.autoDeleteEnabled

        switchMaster.setOnCheckedChangeListener { _, isChecked ->
            localState.masterCollectionEnabled = isChecked
        }

        switchWifi.setOnCheckedChangeListener { _, isChecked ->
            localState.wifiOnly = isChecked
        }

        switchAutoDelete.setOnCheckedChangeListener { _, isChecked ->
            localState.autoDeleteEnabled = isChecked
        }
    }
}
