package com.personal.devicemanager.utils

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MessageProcessingTest {

    private fun sanitizeMessageBody(body: String): String {
        return body.trim()
    }

    @Test
    fun testMessageSanitization() {
        val raw = "   Hello from the device manager   "
        assertEquals("Hello from the device manager", sanitizeMessageBody(raw))
    }

    @Test
    fun testEmptyMessage() {
        val empty = ""
        assertTrue(sanitizeMessageBody(empty).isEmpty())
    }
}
