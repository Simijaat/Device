package com.personal.devicemanager.ui

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Switch
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.personal.devicemanager.R
import com.personal.devicemanager.data.AppDatabase
import com.personal.devicemanager.data.LocalState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

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
        val switchLocation = view.findViewById<Switch>(R.id.switchLocation)
        val switchSms = view.findViewById<Switch>(R.id.switchSms)
        val switchCalls = view.findViewById<Switch>(R.id.switchCalls)
        val switchContacts = view.findViewById<Switch>(R.id.switchContacts)
        val switchApps = view.findViewById<Switch>(R.id.switchApps)
        val btnClearAll = view.findViewById<Button>(R.id.btnClearAll)

        switchMaster.isChecked = localState.masterCollectionEnabled
        switchLocation.isChecked = localState.locationCollectionEnabled
        switchSms.isChecked = localState.smsCollectionEnabled
        switchCalls.isChecked = localState.callLogCollectionEnabled
        switchContacts.isChecked = localState.contactsCollectionEnabled
        switchApps.isChecked = localState.appInventoryCollectionEnabled

        switchMaster.setOnCheckedChangeListener { _, isChecked ->
            localState.masterCollectionEnabled = isChecked
        }
        switchLocation.setOnCheckedChangeListener { _, isChecked ->
            localState.locationCollectionEnabled = isChecked
        }
        switchSms.setOnCheckedChangeListener { _, isChecked ->
            localState.smsCollectionEnabled = isChecked
        }
        switchCalls.setOnCheckedChangeListener { _, isChecked ->
            localState.callLogCollectionEnabled = isChecked
        }
        switchContacts.setOnCheckedChangeListener { _, isChecked ->
            localState.contactsCollectionEnabled = isChecked
        }
        switchApps.setOnCheckedChangeListener { _, isChecked ->
            localState.appInventoryCollectionEnabled = isChecked
        }

        btnClearAll.setOnClickListener {
            AlertDialog.Builder(requireContext())
                .setTitle("Clear All Data")
                .setMessage("Are you sure you want to delete all cached local data?")
                .setPositiveButton("Yes") { _, _ ->
                    viewLifecycleOwner.lifecycleScope.launch {
                        withContext(Dispatchers.IO) {
                            val db = AppDatabase.getDatabase(requireContext())
                            db.clearAllTables()
                        }
                        Toast.makeText(requireContext(), "Data cleared", Toast.LENGTH_SHORT).show()
                    }
                }
                .setNegativeButton("No", null)
                .show()
        }
    }
}
