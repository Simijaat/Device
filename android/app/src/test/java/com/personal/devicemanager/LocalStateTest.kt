package com.personal.devicemanager

import android.content.Context
import android.content.SharedPreferences
import com.personal.devicemanager.data.LocalState
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*

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
        assertEquals(false, localState.masterCollectionEnabled)

        `when`(mockPrefs.getInt("syncInterval", 60)).thenReturn(60)
        assertEquals(60, localState.syncInterval)
    }

    @Test
    fun testSetValues() {
        localState.masterCollectionEnabled = true
        verify(mockEditor).putBoolean("masterCollectionEnabled", true)
        verify(mockEditor, atLeastOnce()).apply()

        localState.syncInterval = 120
        verify(mockEditor).putInt("syncInterval", 120)
        verify(mockEditor, atLeastOnce()).apply()
    }
}
