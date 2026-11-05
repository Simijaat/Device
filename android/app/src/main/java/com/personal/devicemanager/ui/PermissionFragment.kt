package com.personal.devicemanager.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Switch
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.personal.devicemanager.R
import com.personal.devicemanager.data.LocalState

class PermissionFragment : Fragment() {

    private lateinit var localState: LocalState

    private lateinit var tvLocationPerm: TextView
    private lateinit var swLocationSync: Switch

    private lateinit var tvContactsPerm: TextView
    private lateinit var swContactsSync: Switch

    private lateinit var tvSmsPerm: TextView
    private lateinit var swSmsSync: Switch

    private lateinit var tvCallLogPerm: TextView
    private lateinit var swCallLogSync: Switch

    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            updateUI()
        }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_permission, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        localState = LocalState(requireContext())

        tvLocationPerm = view.findViewById(R.id.tvLocationPerm)
        swLocationSync = view.findViewById(R.id.swLocationSync)

        tvContactsPerm = view.findViewById(R.id.tvContactsPerm)
        swContactsSync = view.findViewById(R.id.swContactsSync)

        tvSmsPerm = view.findViewById(R.id.tvSmsPerm)
        swSmsSync = view.findViewById(R.id.swSmsSync)

        tvCallLogPerm = view.findViewById(R.id.tvCallLogPerm)
        swCallLogSync = view.findViewById(R.id.swCallLogSync)

        view.findViewById<Button>(R.id.btnReqLocation).setOnClickListener {
            requestPermissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
        }

        view.findViewById<Button>(R.id.btnReqContacts).setOnClickListener {
            requestPermissionLauncher.launch(arrayOf(Manifest.permission.READ_CONTACTS))
        }

        view.findViewById<Button>(R.id.btnReqSms).setOnClickListener {
            requestPermissionLauncher.launch(arrayOf(Manifest.permission.READ_SMS))
        }

        view.findViewById<Button>(R.id.btnReqCallLog).setOnClickListener {
            requestPermissionLauncher.launch(arrayOf(Manifest.permission.READ_CALL_LOG))
        }

        swLocationSync.setOnCheckedChangeListener { _, isChecked -> localState.locationCollectionEnabled = isChecked }
        swContactsSync.setOnCheckedChangeListener { _, isChecked -> localState.contactsCollectionEnabled = isChecked }
        swSmsSync.setOnCheckedChangeListener { _, isChecked -> localState.smsCollectionEnabled = isChecked }
        swCallLogSync.setOnCheckedChangeListener { _, isChecked -> localState.callLogCollectionEnabled = isChecked }

        updateUI()
    }

    override fun onResume() {
        super.onResume()
        updateUI()
    }

    private fun updateUI() {
        val locationGranted = ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val contactsGranted = ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_CONTACTS) == PackageManager.PERMISSION_GRANTED
        val smsGranted = ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED
        val callLogGranted = ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_CALL_LOG) == PackageManager.PERMISSION_GRANTED

        tvLocationPerm.text = "Android Permission: ${if (locationGranted) "Granted" else "Denied"}"
        swLocationSync.isChecked = localState.locationCollectionEnabled

        tvContactsPerm.text = "Android Permission: ${if (contactsGranted) "Granted" else "Denied"}"
        swContactsSync.isChecked = localState.contactsCollectionEnabled

        tvSmsPerm.text = "Android Permission: ${if (smsGranted) "Granted" else "Denied"}"
        swSmsSync.isChecked = localState.smsCollectionEnabled

        tvCallLogPerm.text = "Android Permission: ${if (callLogGranted) "Granted" else "Denied"}"
        swCallLogSync.isChecked = localState.callLogCollectionEnabled
    }
}
