package com.personal.devicemanager.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.personal.devicemanager.R
import kotlinx.coroutines.launch

class DashboardFragment : Fragment() {
    private val viewModel: DashboardViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_dashboard, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val btnSyncAll = view.findViewById<Button>(R.id.btnSyncAll)
        val tvLocation = view.findViewById<TextView>(R.id.tvLocation)
        val tvContacts = view.findViewById<TextView>(R.id.tvContacts)
        val tvSms = view.findViewById<TextView>(R.id.tvSms)
        val tvCalls = view.findViewById<TextView>(R.id.tvCalls)
        val tvApps = view.findViewById<TextView>(R.id.tvApps)

        btnSyncAll.setOnClickListener {
            viewModel.syncAll()
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.locationState.collect { location ->
                        if (location != null) {
                            tvLocation.text = "Location: ${location.latitude}, ${location.longitude}"
                        } else {
                            tvLocation.text = "Location: Unknown/Disabled"
                        }
                    }
                }
                launch {
                    viewModel.contactsCount.collect { count ->
                        tvContacts.text = "Contacts: $count"
                    }
                }
                launch {
                    viewModel.smsCount.collect { count ->
                        tvSms.text = "Messages: $count"
                    }
                }
                launch {
                    viewModel.callsCount.collect { count ->
                        tvCalls.text = "Calls: $count"
                    }
                }
                launch {
                    viewModel.appsCount.collect { count ->
                        tvApps.text = "Apps: $count"
                    }
                }
            }
        }
    }
}
