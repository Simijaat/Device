package com.personal.devicemanager

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.personal.devicemanager.data.EncryptedPrefsManager
import com.personal.devicemanager.databinding.ActivityLoginBinding
import com.personal.devicemanager.network.LoginRequest
import com.personal.devicemanager.network.RetrofitClient
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
