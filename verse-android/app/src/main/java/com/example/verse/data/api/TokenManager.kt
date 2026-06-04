package com.example.verse.data.api

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

private val Context.dataStore by preferencesDataStore(name = "verse_prefs")

class TokenManager(private val context: Context) {
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
        private val USER_ID_KEY = stringPreferencesKey("user_id")
        private val USER_NAME_KEY = stringPreferencesKey("user_name")
        private val USER_EMAIL_KEY = stringPreferencesKey("user_email")
        private val USER_IMAGE_KEY = stringPreferencesKey("user_image")
    }

    val tokenFlow = context.dataStore.data.map { prefs -> prefs[TOKEN_KEY] }

    fun getTokenSync(): String? = runBlocking {
        context.dataStore.data.first()[TOKEN_KEY]
    }

    suspend fun saveAuth(token: String, userId: String, name: String?, email: String?, image: String?) {
        context.dataStore.edit { prefs ->
            prefs[TOKEN_KEY] = token
            prefs[USER_ID_KEY] = userId
            name?.let { prefs[USER_NAME_KEY] = it }
            email?.let { prefs[USER_EMAIL_KEY] = it }
            image?.let { prefs[USER_IMAGE_KEY] = it }
        }
    }

    suspend fun getUserId(): String? = context.dataStore.data.first()[USER_ID_KEY]
    suspend fun getUserName(): String? = context.dataStore.data.first()[USER_NAME_KEY]

    suspend fun clearAuth() {
        context.dataStore.edit { it.clear() }
    }

    suspend fun isLoggedIn(): Boolean = context.dataStore.data.first()[TOKEN_KEY] != null
}
