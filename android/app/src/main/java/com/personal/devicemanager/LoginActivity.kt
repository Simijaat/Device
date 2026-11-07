package com.personal.devicemanager

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.personal.devicemanager.data.EncryptedPrefsManager
import com.personal.devicemanager.databinding.ActivityLoginBinding
import com.personal.devicemanager.network.DeviceStatusPayload
import com.personal.devicemanager.network.LoginRequest
import com.personal.devicemanager.network.RegisterDeviceRequest
import com.personal.devicemanager.network.RetrofitClient
import com.personal.devicemanager.utils.DeviceInfoUtils
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var prefs: EncryptedPrefsManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        prefs = EncryptedPrefsManager(this)

        if (prefs.getToken() != null) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnLogin.setOnClickListener {
            val user = binding.etUsername.text.toString().trim()
            val pass = binding.etPassword.text.toString().trim()

            if (user.isBlank() || pass.isBlank()) {
                Toast.makeText(this, "Please enter username and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            binding.btnLogin.isEnabled = false
            lifecycleScope.launch {
                try {
                    val apiService = RetrofitClient.getApiService(this@LoginActivity)
                    val response = apiService.login(LoginRequest(user, pass))

                    if (response.isSuccessful && response.body()?.success == true) {
                        val token = response.body()?.token
                        if (!token.isNullOrBlank()) {
                            prefs.saveToken(token)

                            // Immediately register device and upload initial battery/network status
                            try {
                                val authedApi = RetrofitClient.getApiService(this@LoginActivity)
                                val deviceId = prefs.getOrCreateDeviceId()
                                val deviceInfo = DeviceInfoUtils.getDeviceInfo(this@LoginActivity)
                                authedApi.registerDevice(
                                    RegisterDeviceRequest(
                                        id = deviceId,
                                        name = "${Build.MANUFACTURER} ${Build.MODEL}",
                                        model = Build.MODEL,
                                        android_version = "Android ${Build.VERSION.RELEASE}",
                                        app_version = deviceInfo.appVersion
                                    )
                                )
                                authedApi.updateDeviceStatus(
                                    deviceId = deviceId,
                                    status = DeviceStatusPayload(
                                        battery_level = deviceInfo.batteryPercentage.coerceIn(0, 100),
                                        is_charging = deviceInfo.isCharging,
                                        network_type = deviceInfo.networkState
                                    )
                                )
                            } catch (_: Exception) {
                            }

                            Toast.makeText(this@LoginActivity, "Login successful", Toast.LENGTH_SHORT).show()
                            startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                            finish()
                        } else {
                            Toast.makeText(this@LoginActivity, "No token returned from server", Toast.LENGTH_LONG).show()
                        }
                    } else {
                        val errorMsg = response.body()?.error ?: "Invalid credentials (${response.code()})"
                        Toast.makeText(this@LoginActivity, errorMsg, Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@LoginActivity, "Connection error: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                } finally {
                    binding.btnLogin.isEnabled = true
                }
            }
        }
    }
}
