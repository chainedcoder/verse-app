package com.example.verse.ui.screens.author

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.PersonAdd
import androidx.compose.material.icons.outlined.PersonRemove
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.verse.data.api.ApiClient
import com.example.verse.data.model.Author
import com.example.verse.data.model.Poem
import com.example.verse.ui.components.PoemCard
import com.example.verse.ui.components.VerseAvatar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthorScreen(
    authorId: String,
    onBack: () -> Unit,
    onPoemClick: (String) -> Unit
) {
    var author by remember { mutableStateOf<Author?>(null) }
    var poems by remember { mutableStateOf<List<Poem>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var isFollowing by remember { mutableStateOf(false) }
    var followToggleCount by remember { mutableIntStateOf(0) }

    LaunchedEffect(authorId) {
        try {
            val result = ApiClient.api.getAuthor(authorId)
            author = result.author
            poems = result.poems
            isFollowing = result.author.isFollowing
        } catch (_: Exception) { }
        isLoading = false
    }

    // Handle follow toggle
    LaunchedEffect(followToggleCount) {
        if (followToggleCount > 0) {
            try { ApiClient.api.toggleFollow(authorId) } catch (_: Exception) { }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(author?.name ?: "", style = MaterialTheme.typography.titleMedium) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            return@Scaffold
        }

        val a = author ?: return@Scaffold

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Profile header
            item {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp)) {
                    VerseAvatar(imageUrl = a.image, name = a.name, size = 80.dp)
                    Spacer(Modifier.height(12.dp))
                    Text(a.name ?: "Unknown", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)

                    a.bio?.let {
                        Spacer(Modifier.height(6.dp))
                        Text(it, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }

                    a.location?.let {
                        Spacer(Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Outlined.LocationOn, null, Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            Spacer(Modifier.width(4.dp))
                            Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }

                    Spacer(Modifier.height(16.dp))

                    // Stats
                    Row(horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                        StatItem("Poems", a.poemCount)
                        StatItem("Followers", a.followerCount)
                        StatItem("Following", a.followingCount)
                    }

                    Spacer(Modifier.height(16.dp))

                    // Follow button
                    Button(
                        onClick = {
                            isFollowing = !isFollowing
                            followToggleCount++
                        },
                        shape = RoundedCornerShape(20.dp),
                        colors = if (isFollowing) ButtonDefaults.outlinedButtonColors() else ButtonDefaults.buttonColors()
                    ) {
                        Icon(if (isFollowing) Icons.Outlined.PersonRemove else Icons.Outlined.PersonAdd, null, Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text(if (isFollowing) "Following" else "Follow")
                    }
                }
            }

            item { HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant) }

            item {
                Text("Poems", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(vertical = 8.dp))
            }

            items(poems, key = { it.id }) { poem ->
                PoemCard(poem = poem, onPoemClick = onPoemClick, onAuthorClick = { }, onLikeClick = { })
            }

            if (poems.isEmpty()) {
                item {
                    Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        Text("No poems yet", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }

            item { Spacer(Modifier.height(64.dp)) }
        }
    }
}

@Composable
private fun StatItem(label: String, count: Int) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text("$count", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
