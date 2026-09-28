package com.personal.devicemanager.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.personal.devicemanager.R

class PermissionFragment : Fragment() {

    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted: Boolean ->
            if (isGranted) {
                Toast.makeText(requireContext(), "Permission Granted", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(requireContext(), "Permission Denied", Toast.LENGTH_SHORT).show()
            }
        }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_permission, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<Button>(R.id.btnReqLocation).setOnClickListener {
            checkAndRequestPermission(Manifest.permission.ACCESS_FINE_LOCATION)
        }

        view.findViewById<Button>(R.id.btnReqContacts).setOnClickListener {
            checkAndRequestPermission(Manifest.permission.READ_CONTACTS)
        }

        view.findViewById<Button>(R.id.btnReqSms).setOnClickListener {
            checkAndRequestPermission(Manifest.permission.READ_SMS)
        }

        view.findViewById<Button>(R.id.btnReqCallLog).setOnClickListener {
            checkAndRequestPermission(Manifest.permission.READ_CALL_LOG)
        }
    }

    private fun checkAndRequestPermission(permission: String) {
        if (ContextCompat.checkSelfPermission(requireContext(), permission) == PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(requireContext(), "Permission already granted", Toast.LENGTH_SHORT).show()
        } else {
            requestPermissionLauncher.launch(permission)
        }
    }
}
