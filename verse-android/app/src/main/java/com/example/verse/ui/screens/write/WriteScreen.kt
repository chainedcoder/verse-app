package com.example.verse.ui.screens.write

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.verse.data.api.ApiClient
import com.example.verse.data.model.CreatePoemRequest

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WriteScreen(
    onBack: () -> Unit,
    onPoemCreated: (String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var body by remember { mutableStateOf("") }
    var tagsText by remember { mutableStateOf("") }
    var isPublishing by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Write", style = MaterialTheme.typography.titleLarge) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                },
                actions = {
                    Button(
                        onClick = {
                            if (title.isBlank() || body.isBlank()) {
                                error = "Title and body are required"
                                return@Button
                            }
                            isPublishing = true
                            error = null
                        },
                        shape = RoundedCornerShape(20.dp),
                        enabled = !isPublishing && title.isNotBlank() && body.isNotBlank()
                    ) {
                        if (isPublishing) {
                            CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp, color = MaterialTheme.colorScheme.onPrimary)
                        } else {
                            Text("Publish", fontWeight = FontWeight.SemiBold)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        }
    ) { padding ->
        // Publish effect
        LaunchedEffect(isPublishing) {
            if (!isPublishing) return@LaunchedEffect
            try {
                val tags = tagsText.split(",").map { it.trim() }.filter { it.isNotBlank() }
                val result = ApiClient.api.createPoem(CreatePoemRequest(title = title.trim(), fullText = body.trim(), tags = tags))
                onPoemCreated(result.poem.id)
            } catch (e: Exception) {
                error = e.message ?: "Failed to publish"
                isPublishing = false
            }
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
        ) {
            Spacer(Modifier.height(8.dp))

            // Title
            OutlinedTextField(
                value = title,
                onValueChange = { title = it; error = null },
                label = { Text("Title") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                textStyle = MaterialTheme.typography.headlineMedium,
                singleLine = true,
                enabled = !isPublishing
            )

            Spacer(Modifier.height(16.dp))

            // Body
            OutlinedTextField(
                value = body,
                onValueChange = { body = it; error = null },
                label = { Text("Write your poem...") },
                modifier = Modifier.fillMaxWidth().heightIn(min = 250.dp),
                shape = RoundedCornerShape(12.dp),
                textStyle = MaterialTheme.typography.bodyLarge,
                enabled = !isPublishing
            )

            Spacer(Modifier.height(16.dp))

            // Tags
            OutlinedTextField(
                value = tagsText,
                onValueChange = { tagsText = it },
                label = { Text("Tags (comma separated)") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
                enabled = !isPublishing
            )

            error?.let {
                Spacer(Modifier.height(12.dp))
                Text(text = it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.error)
            }

            Spacer(Modifier.height(80.dp))
        }
    }
}
