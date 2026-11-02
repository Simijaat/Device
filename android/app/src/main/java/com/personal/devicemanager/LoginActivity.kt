package com.personal.devicemanager

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.personal.devicemanager.data.EncryptedPrefsManager
import com.personal.devicemanager.databinding.ActivityLoginBinding

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
            // Will connect to real API later
            val user = binding.etUsername.text.toString()
            val pass = binding.etPassword.text.toString()
            
            if (user.isNotBlank() && pass.isNotBlank()) {
                prefs.saveToken("dummy_token_for_now")
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            } else {
                Toast.makeText(this, "Enter credentials", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
