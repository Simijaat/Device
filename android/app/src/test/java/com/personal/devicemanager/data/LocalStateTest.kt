package com.personal.devicemanager.data

import android.content.Context
import android.content.SharedPreferences
import org.junit.Assert.assertEquals
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

class LocalStateTest {

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
    fun testDefaultValues() {
        `when`(mockPrefs.getBoolean("masterCollectionEnabled", false)).thenReturn(false)
        `when`(mockPrefs.getBoolean("locationCollectionEnabled", false)).thenReturn(false)

        assertFalse(localState.masterCollectionEnabled)
        assertFalse(localState.locationCollectionEnabled)
    }

    @Test
    fun testSetMasterCollection() {
        localState.masterCollectionEnabled = true
        verify(mockEditor).putBoolean("masterCollectionEnabled", true)
        verify(mockEditor).apply()
    }
}
