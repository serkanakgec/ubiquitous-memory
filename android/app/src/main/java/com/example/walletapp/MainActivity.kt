package com.example.walletapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.walletapp.viewmodel.AuthViewModel
import kotlinx.coroutines.launch

@ExperimentalMaterial3Api::class
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var currentScreen by remember { mutableStateOf("login") }
            WalletAppTheme {
                when (currentScreen) {
                    "login" -> LoginScreen(onNavigateToRegister = { currentScreen = "register" })
                    "register" -> RegisterScreen(onNavigateToLogin = { currentScreen = "login" })
                }
            }
        }
    }
}

@Composable
fun WalletAppTheme(content: @Composable () -> Unit) {
    MaterialTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            content()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(onNavigateToRegister: () -> Unit, authViewModel: AuthViewModel = viewModel()) {
    val uiState by authViewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Login", style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(16.dp))
            OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation())
            Spacer(Modifier.height(16.dp))
            Button(onClick = { authViewModel.login(email, password) }, enabled = !uiState.isLoading) {
                if (uiState.isLoading) CircularProgressIndicator(Modifier.size(24.dp)) else Text("Login")
            }
            TextButton(onClick = onNavigateToRegister) { Text("Don't have an account? Register") }
        }
    }
    LaunchedEffect(uiState) {
        uiState.errorMessage?.let { scope.launch { snackbarHostState.showSnackbar(it) } }
        uiState.successMessage?.let { scope.launch { snackbarHostState.showSnackbar(it) } }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(onNavigateToLogin: () -> Unit, authViewModel: AuthViewModel = viewModel()) {
    val uiState by authViewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) { padding ->
        Column(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Register", style = MaterialTheme.typography.headlineMedium)
            Spacer(Modifier.height(16.dp))
            OutlinedTextField(value = fullName, onValueChange = { fullName = it }, label = { Text("Full Name") })
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
            Spacer(Modifier.height(8.dp))
            OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation())
            Spacer(Modifier.height(16.dp))
            Button(onClick = { authViewModel.register(email, password, fullName) }, enabled = !uiState.isLoading) {
                if (uiState.isLoading) CircularProgressIndicator(Modifier.size(24.dp)) else Text("Register")
            }
            TextButton(onClick = onNavigateToLogin) { Text("Already have an account? Login") }
        }
    }
    LaunchedEffect(uiState) {
        uiState.errorMessage?.let { scope.launch { snackbarHostState.showSnackbar(it) } }
        uiState.successMessage?.let { scope.launch { snackbarHostState.showSnackbar(it) } }
    }
}
