package com.example.walletapp.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.walletapp.network.ApiService
import com.example.walletapp.network.LoginRequest
import com.example.walletapp.network.RegisterRequest
import io.ktor.client.call.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

// Represents the state of the UI for authentication
data class AuthUiState(
    val isLoading: Boolean = false,
    val successMessage: String? = null,
    val errorMessage: String? = null
)

class AuthViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            try {
                val response = ApiService.login(LoginRequest(email, password))
                if (response.status.value in 200..299) {
                    _uiState.value = AuthUiState(successMessage = "Login successful!")
                } else {
                    _uiState.value = AuthUiState(errorMessage = "Login failed: ${response.body<String>()}")
                }
            } catch (e: Exception) {
                _uiState.value = AuthUiState(errorMessage = e.message ?: "An unknown error occurred")
            }
        }
    }

    fun register(email: String, password: String, fullName: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState(isLoading = true)
            try {
                val response = ApiService.register(RegisterRequest(email, password, fullName))
                if (response.status.value in 200..299) {
                    _uiState.value = AuthUiState(successMessage = "Registration successful!")
                } else {
                    _uiState.value = AuthUiState(errorMessage = "Registration failed: ${response.body<String>()}")
                }
            } catch (e: Exception) {
                _uiState.value = AuthUiState(errorMessage = e.message ?: "An unknown error occurred")
            }
        }
    }
}
