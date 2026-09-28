package com.personal.devicemanager.repository

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.provider.ContactsContract
import androidx.core.content.ContextCompat
import com.personal.devicemanager.data.ContactDao
import com.personal.devicemanager.data.ContactRecord
import com.personal.devicemanager.data.LocalState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class ContactsRepository(
    private val context: Context,
    private val contactDao: ContactDao,
    private val localState: LocalState
) {
    fun getAllContacts(): Flow<List<ContactRecord>> {
        return contactDao.getAllContacts()
    }

    suspend fun syncContacts() {
        if (!localState.masterCollectionEnabled || !localState.contactsCollectionEnabled) {
            return
        }

        if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) {
            return
        }

        withContext(Dispatchers.IO) {
            val contactsList = mutableListOf<ContactRecord>()
            val contentResolver = context.contentResolver

            val cursor = contentResolver.query(
                ContactsContract.Contacts.CONTENT_URI,
                null, null, null, null
            )

            cursor?.use {
                if (it.count > 0) {
                    val idIndex = it.getColumnIndex(ContactsContract.Contacts._ID)
                    val nameIndex = it.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME)
                    val hasPhoneIndex = it.getColumnIndex(ContactsContract.Contacts.HAS_PHONE_NUMBER)

                    while (it.moveToNext()) {
                        if (idIndex >= 0 && nameIndex >= 0 && hasPhoneIndex >= 0) {
                            val id = it.getString(idIndex) ?: continue
                            val name = it.getString(nameIndex) ?: "Unknown"
                            val hasPhoneNumber = it.getInt(hasPhoneIndex) > 0

                            val phoneNumbers = mutableListOf<String>()
                            if (hasPhoneNumber) {
                                val pCursor = contentResolver.query(
                                    ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                                    null,
                                    ContactsContract.CommonDataKinds.Phone.CONTACT_ID + " = ?",
                                    arrayOf(id),
                                    null
                                )
                                pCursor?.use { pc ->
                                    val phoneIndex = pc.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)
                                    while (pc.moveToNext()) {
                                        if (phoneIndex >= 0) {
                                            val phoneNo = pc.getString(phoneIndex)
                                            if (phoneNo != null) phoneNumbers.add(phoneNo)
                                        }
                                    }
                                }
                            }
                            contactsList.add(ContactRecord(id, name, phoneNumbers.joinToString(", ")))
                        }
                    }
                }
            }
            if (contactsList.isNotEmpty()) {
                contactDao.insertAll(contactsList)
            }
        }
    }

    suspend fun clearContacts() {
        contactDao.clearAll()
    }
}
