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

    private var isUpdatingUI = false

    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
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
            requestPermissionLauncher.launch(
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            )
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

        swLocationSync.setOnCheckedChangeListener { _, isChecked ->
            if (isUpdatingUI) return@setOnCheckedChangeListener
            val hasPerm = ContextCompat.checkSelfPermission(
                requireContext(),
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(
                requireContext(),
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED

            if (isChecked && !hasPerm) {
                Toast.makeText(requireContext(), "Grant Location permission first before enabling sync", Toast.LENGTH_SHORT).show()
                updateUI()
            } else {
                localState.locationCollectionEnabled = isChecked
            }
        }

        swContactsSync.setOnCheckedChangeListener { _, isChecked ->
            if (isUpdatingUI) return@setOnCheckedChangeListener
            val hasPerm = ContextCompat.checkSelfPermission(
                requireContext(),
                Manifest.permission.READ_CONTACTS
            ) == PackageManager.PERMISSION_GRANTED

            if (isChecked && !hasPerm) {
                Toast.makeText(requireContext(), "Grant Contacts permission first before enabling sync", Toast.LENGTH_SHORT).show()
                updateUI()
            } else {
                localState.contactsCollectionEnabled = isChecked
            }
        }

        swSmsSync.setOnCheckedChangeListener { _, isChecked ->
            if (isUpdatingUI) return@setOnCheckedChangeListener
            val hasPerm = ContextCompat.checkSelfPermission(
                requireContext(),
                Manifest.permission.READ_SMS
            ) == PackageManager.PERMISSION_GRANTED

            if (isChecked && !hasPerm) {
                Toast.makeText(requireContext(), "Grant SMS permission first before enabling sync", Toast.LENGTH_SHORT).show()
                updateUI()
            } else {
                localState.smsCollectionEnabled = isChecked
            }
        }

        swCallLogSync.setOnCheckedChangeListener { _, isChecked ->
            if (isUpdatingUI) return@setOnCheckedChangeListener
            val hasPerm = ContextCompat.checkSelfPermission(
                requireContext(),
                Manifest.permission.READ_CALL_LOG
            ) == PackageManager.PERMISSION_GRANTED

            if (isChecked && !hasPerm) {
                Toast.makeText(requireContext(), "Grant Call Log permission first before enabling sync", Toast.LENGTH_SHORT).show()
                updateUI()
            } else {
                localState.callLogCollectionEnabled = isChecked
            }
        }

        updateUI()
    }

    override fun onResume() {
        super.onResume()
        updateUI()
    }

    private fun updateUI() {
        if (!isAdded) return
        isUpdatingUI = true

        val locationGranted = ContextCompat.checkSelfPermission(
            requireContext(),
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(
            requireContext(),
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED

        val contactsGranted = ContextCompat.checkSelfPermission(
            requireContext(),
            Manifest.permission.READ_CONTACTS
        ) == PackageManager.PERMISSION_GRANTED

        val smsGranted = ContextCompat.checkSelfPermission(
            requireContext(),
            Manifest.permission.READ_SMS
        ) == PackageManager.PERMISSION_GRANTED

        val callLogGranted = ContextCompat.checkSelfPermission(
            requireContext(),
            Manifest.permission.READ_CALL_LOG
        ) == PackageManager.PERMISSION_GRANTED

        // If permission was revoked, turn off local sync setting to prevent stale collection
        if (!locationGranted) localState.locationCollectionEnabled = false
        if (!contactsGranted) localState.contactsCollectionEnabled = false
        if (!smsGranted) localState.smsCollectionEnabled = false
        if (!callLogGranted) localState.callLogCollectionEnabled = false

        tvLocationPerm.text = "Android Permission: ${if (locationGranted) "Granted" else "Denied"}"
        swLocationSync.isChecked = localState.locationCollectionEnabled && locationGranted
        swLocationSync.isEnabled = locationGranted

        tvContactsPerm.text = "Android Permission: ${if (contactsGranted) "Granted" else "Denied"}"
        swContactsSync.isChecked = localState.contactsCollectionEnabled && contactsGranted
        swContactsSync.isEnabled = contactsGranted

        tvSmsPerm.text = "Android Permission: ${if (smsGranted) "Granted" else "Denied"}"
        swSmsSync.isChecked = localState.smsCollectionEnabled && smsGranted
        swSmsSync.isEnabled = smsGranted

        tvCallLogPerm.text = "Android Permission: ${if (callLogGranted) "Granted" else "Denied"}"
        swCallLogSync.isChecked = localState.callLogCollectionEnabled && callLogGranted
        swCallLogSync.isEnabled = callLogGranted

        isUpdatingUI = false
    }
}
