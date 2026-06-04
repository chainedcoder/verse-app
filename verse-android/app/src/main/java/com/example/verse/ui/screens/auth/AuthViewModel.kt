package com.example.verse.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.verse.data.api.ApiClient
import com.example.verse.data.api.TokenManager
import com.example.verse.data.model.LoginRequest
import com.example.verse.data.model.RegisterRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val email: String = "",
    val password: String = "",
    val name: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val isLoggedIn: Boolean = false
)

class AuthViewModel(private val tokenManager: TokenManager) : ViewModel() {
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoggedIn = tokenManager.isLoggedIn())
        }
    }

    fun updateEmail(email: String) { _uiState.value = _uiState.value.copy(email = email, error = null) }
    fun updatePassword(pw: String) { _uiState.value = _uiState.value.copy(password = pw, error = null) }
    fun updateName(name: String) { _uiState.value = _uiState.value.copy(name = name, error = null) }

    fun login() {
        val s = _uiState.value
        if (s.email.isBlank() || s.password.isBlank()) {
            _uiState.value = s.copy(error = "Email and password are required")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val result = ApiClient.api.login(LoginRequest(s.email.trim(), s.password))
                tokenManager.saveAuth(result.token, result.user.id, result.user.name, result.user.name, result.user.image)
                _uiState.value = _uiState.value.copy(isLoading = false, isLoggedIn = true)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message ?: "Login failed")
            }
        }
    }

    fun register() {
        val s = _uiState.value
        if (s.name.isBlank() || s.email.isBlank() || s.password.isBlank()) {
            _uiState.value = s.copy(error = "All fields are required")
            return
        }
        if (s.password.length < 6) {
            _uiState.value = s.copy(error = "Password must be at least 6 characters")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val result = ApiClient.api.register(RegisterRequest(s.name.trim(), s.email.trim(), s.password))
                tokenManager.saveAuth(result.token, result.user.id, result.user.name, result.user.name, result.user.image)
                _uiState.value = _uiState.value.copy(isLoading = false, isLoggedIn = true)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message ?: "Registration failed")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            tokenManager.clearAuth()
            _uiState.value = AuthUiState()
        }
    }
}
