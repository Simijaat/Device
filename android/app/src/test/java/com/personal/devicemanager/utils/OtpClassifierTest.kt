package com.personal.devicemanager.utils

import org.junit.Assert.assertEquals
import org.junit.Test
import java.util.Locale

class OtpClassifierTest {

    // Testing the logic originally defined in SmsRepository
    private fun classifySms(body: String): String {
        val lowerBody = body.lowercase(Locale.getDefault())
        if (lowerBody.contains("otp") || lowerBody.contains("verification code") ||
            lowerBody.contains("verification pin") || lowerBody.contains("do not share")) {
            return "OTP"
        }
        return "NORMAL"
    }

    @Test
    fun classifySms_WithOtp_ReturnsOTP() {
        val body = "Your Amazon OTP is 123456"
        assertEquals("OTP", classifySms(body))
    }

    @Test
    fun classifySms_WithVerificationCode_ReturnsOTP() {
        val body = "Your Google verification code is G-999999"
        assertEquals("OTP", classifySms(body))
    }

    @Test
    fun classifySms_WithDoNotShare_ReturnsOTP() {
        val body = "112233 is your pin. Do not share this with anyone."
        assertEquals("OTP", classifySms(body))
    }

    @Test
    fun classifySms_NormalMessage_ReturnsNORMAL() {
        val body = "Hey, are we still on for lunch?"
        assertEquals("NORMAL", classifySms(body))
    }
}
