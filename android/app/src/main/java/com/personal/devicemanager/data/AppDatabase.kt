package com.personal.devicemanager.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        LocationRecord::class,
        ContactRecord::class,
        SmsRecord::class,
        CallLogRecord::class,
        AppRecord::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun locationDao(): LocationDao
    abstract fun contactDao(): ContactDao
    abstract fun smsDao(): SmsDao
    abstract fun callLogDao(): CallLogDao
    abstract fun appDao(): AppDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "device_manager_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
