package com.example.verse.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.verse.data.api.ApiClient
import com.example.verse.data.model.UserProfile
import com.example.verse.ui.components.VerseAvatar

@Composable
fun ProfileScreen(
    onLoginClick: () -> Unit,
    onLogout: () -> Unit,
    isLoggedIn: Boolean
) {
    var profile by remember { mutableStateOf<UserProfile?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(isLoggedIn) {
        if (!isLoggedIn) {
            isLoading = false
            return@LaunchedEffect
        }
        try {
            val result = ApiClient.api.getProfile()
            profile = result.profile
        } catch (_: Exception) { }
        isLoading = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp)
    ) {
        if (!isLoggedIn) {
            // Not logged in state
            Box(Modifier.fillMaxWidth().padding(top = 80.dp), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Outlined.AccountCircle, null, Modifier.size(72.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f))
                    Spacer(Modifier.height(16.dp))
                    Text("Sign in to see your profile", style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(16.dp))
                    Button(onClick = onLoginClick, shape = RoundedCornerShape(20.dp)) { Text("Log in") }
                }
            }
            return
        }

        if (isLoading) {
            Box(Modifier.fillMaxWidth().padding(48.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            return
        }

        val p = profile ?: return

        // Profile header
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)) {
            VerseAvatar(imageUrl = p.image, name = p.name, size = 80.dp)
            Spacer(Modifier.height(12.dp))
            Text(p.name ?: "Unknown", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)

            p.username?.let {
                Text("@$it", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
            }

            p.bio?.let {
                Spacer(Modifier.height(8.dp))
                Text(it, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

            Spacer(Modifier.height(16.dp))

            // Stats
            Row(horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                StatItem("Poems", p.poemCount)
                StatItem("Followers", p.followerCount)
                StatItem("Following", p.followingCount)
            }
        }

        Spacer(Modifier.height(24.dp))
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
        Spacer(Modifier.height(16.dp))

        // Profile details
        p.email?.let {
            ProfileDetailRow(icon = Icons.Outlined.Email, label = "Email", value = it)
        }
        p.location?.let {
            ProfileDetailRow(icon = Icons.Outlined.LocationOn, label = "Location", value = it)
        }
        p.website?.let {
            ProfileDetailRow(icon = Icons.Outlined.Language, label = "Website", value = it)
        }

        Spacer(Modifier.height(24.dp))

        // Logout button
        OutlinedButton(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
        ) {
            Icon(Icons.AutoMirrored.Outlined.Logout, null, Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("Log out")
        }

        Spacer(Modifier.height(80.dp))
    }
}

@Composable
private fun StatItem(label: String, count: Int) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("$count", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun ProfileDetailRow(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, Modifier.size(20.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.width(12.dp))
        Column {
            Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
