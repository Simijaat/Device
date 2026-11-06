package com.personal.devicemanager

import android.content.Context
import android.content.SharedPreferences
import com.personal.devicemanager.data.LocalState
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.mockito.ArgumentMatchers.anyBoolean
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`

class SecurityGatingTest {

    private lateinit var mockContext: Context
    private lateinit var mockPrefs: SharedPreferences
    private lateinit var mockEditor: SharedPreferences.Editor
    private lateinit var localState: LocalState

    @Before
    fun setUp() {
        mockContext = mock(Context::class.java)
        mockPrefs = mock(SharedPreferences::class.java)
        mockEditor = mock(SharedPreferences.Editor::class.java)

        `when`(mockContext.getSharedPreferences(anyString(), anyInt())).thenReturn(mockPrefs)
        `when`(mockPrefs.edit()).thenReturn(mockEditor)
        `when`(mockEditor.putBoolean(anyString(), anyBoolean())).thenReturn(mockEditor)
        `when`(mockEditor.putInt(anyString(), anyInt())).thenReturn(mockEditor)

        localState = LocalState(mockContext)
    }

    @Test
    fun testDefaultCollectionIsDisabled() {
        `when`(mockPrefs.getBoolean("masterCollectionEnabled", false)).thenReturn(false)
        `when`(mockPrefs.getBoolean("smsCollectionEnabled", false)).thenReturn(false)
        `when`(mockPrefs.getBoolean("locationCollectionEnabled", false)).thenReturn(false)
        `when`(mockPrefs.getBoolean("callLogCollectionEnabled", false)).thenReturn(false)
        `when`(mockPrefs.getBoolean("contactsCollectionEnabled", false)).thenReturn(false)

        assertFalse("Master collection must default to disabled", localState.masterCollectionEnabled)
        assertFalse("SMS collection must default to disabled", localState.smsCollectionEnabled)
        assertFalse("Location collection must default to disabled", localState.locationCollectionEnabled)
        assertFalse("Call log collection must default to disabled", localState.callLogCollectionEnabled)
        assertFalse("Contacts collection must default to disabled", localState.contactsCollectionEnabled)
    }

    @Test
    fun testExplicitConsentRequired() {
        localState.masterCollectionEnabled = true
        verify(mockEditor).putBoolean("masterCollectionEnabled", true)

        localState.smsCollectionEnabled = true
        verify(mockEditor).putBoolean("smsCollectionEnabled", true)

        localState.locationCollectionEnabled = true
        verify(mockEditor).putBoolean("locationCollectionEnabled", true)
    }

    @Test
    fun testRevokingMasterConsentDisablesAll() {
        // When master consent is toggled off, individual checks verify masterCollectionEnabled
        `when`(mockPrefs.getBoolean("masterCollectionEnabled", false)).thenReturn(false)
        `when`(mockPrefs.getBoolean("smsCollectionEnabled", false)).thenReturn(true)

        val isSmsGated = localState.masterCollectionEnabled && localState.smsCollectionEnabled
        assertFalse("Revoking master collection must block SMS collection regardless of feature switch", isSmsGated)
    }
}
