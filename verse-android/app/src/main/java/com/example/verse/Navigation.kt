package com.example.verse

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.verse.data.api.TokenManager
import com.example.verse.ui.screens.auth.AuthViewModel
import com.example.verse.ui.screens.auth.LoginScreen
import com.example.verse.ui.screens.auth.SignupScreen
import com.example.verse.ui.screens.author.AuthorScreen
import com.example.verse.ui.screens.collections.CollectionsScreen
import com.example.verse.ui.screens.feed.FeedScreen
import com.example.verse.ui.screens.poem.PoemDetailScreen
import com.example.verse.ui.screens.profile.ProfileScreen
import com.example.verse.ui.screens.search.SearchScreen
import com.example.verse.ui.screens.write.WriteScreen

enum class BottomNavItem(
    val navKey: NavKey,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    Feed(Main, "Discover", Icons.Filled.Explore, Icons.Outlined.Explore),
    CollectionsTab(Collections, "Collections", Icons.Filled.CollectionsBookmark, Icons.Outlined.CollectionsBookmark),
    ProfileTab(Profile, "Profile", Icons.Filled.Person, Icons.Outlined.Person)
}

@Composable
fun MainNavigation(tokenManager: TokenManager) {
    val backStack = rememberNavBackStack(Main)
    val authViewModel: AuthViewModel = viewModel(key = "auth") { AuthViewModel(tokenManager) }
    var isLoggedIn by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        isLoggedIn = tokenManager.isLoggedIn()
    }

    // Track current destination for bottom nav
    val currentKey by remember { derivedStateOf { backStack.lastOrNull() } }
    val showBottomBar by remember {
        derivedStateOf {
            currentKey is Main || currentKey is Collections || currentKey is Profile
        }
    }

    Scaffold(
        bottomBar = {
            AnimatedVisibility(
                visible = showBottomBar,
                enter = slideInVertically { it },
                exit = slideOutVertically { it }
            ) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 2.dp
                ) {
                    BottomNavItem.entries.forEach { item ->
                        val selected = currentKey == item.navKey ||
                            (item == BottomNavItem.Feed && currentKey is Main)
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                if (!selected) {
                                    // Clear back stack to root and navigate
                                    while (backStack.size > 1) backStack.removeLastOrNull()
                                    if (item.navKey != Main) {
                                        backStack.add(item.navKey)
                                    }
                                }
                            },
                            icon = {
                                Icon(
                                    if (selected) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.label
                                )
                            },
                            label = { Text(item.label, style = MaterialTheme.typography.labelSmall) }
                        )
                    }
                }
            }
        },
        floatingActionButton = {
            if (showBottomBar && isLoggedIn) {
                FloatingActionButton(
                    onClick = { backStack.add(Write) },
                    shape = CircleShape,
                    containerColor = MaterialTheme.colorScheme.primary
                ) {
                    Icon(Icons.Default.Edit, "Write", tint = MaterialTheme.colorScheme.onPrimary)
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            NavDisplay(
                backStack = backStack,
                onBack = { backStack.removeLastOrNull() },
                entryProvider = entryProvider {
                    entry<Main> {
                        FeedScreen(
                            onPoemClick = { backStack.add(PoemDetail(it)) },
                            onAuthorClick = { backStack.add(AuthorDetail(it)) },
                            onSearchClick = { backStack.add(Search) }
                        )
                    }

                    entry<PoemDetail> { key ->
                        PoemDetailScreen(
                            poemId = key.poemId,
                            onBack = { backStack.removeLastOrNull() },
                            onAuthorClick = { backStack.add(AuthorDetail(it)) }
                        )
                    }

                    entry<AuthorDetail> { key ->
                        AuthorScreen(
                            authorId = key.authorId,
                            onBack = { backStack.removeLastOrNull() },
                            onPoemClick = { backStack.add(PoemDetail(it)) }
                        )
                    }

                    entry<Search> {
                        SearchScreen(
                            onBack = { backStack.removeLastOrNull() },
                            onPoemClick = { backStack.add(PoemDetail(it)) },
                            onAuthorClick = { backStack.add(AuthorDetail(it)) }
                        )
                    }

                    entry<Write> {
                        WriteScreen(
                            onBack = { backStack.removeLastOrNull() },
                            onPoemCreated = { id ->
                                backStack.removeLastOrNull()
                                backStack.add(PoemDetail(id))
                            }
                        )
                    }

                    entry<Collections> {
                        CollectionsScreen(
                            onCollectionClick = { backStack.add(CollectionDetail(it)) },
                            onCreateClick = { }
                        )
                    }

                    entry<CollectionDetail> { key ->
                        // Simple placeholder — can be expanded
                        Text("Collection ${key.collectionId}")
                    }

                    entry<Profile> {
                        ProfileScreen(
                            onLoginClick = { backStack.add(Login) },
                            onLogout = {
                                authViewModel.logout()
                                isLoggedIn = false
                            },
                            isLoggedIn = isLoggedIn
                        )
                    }

                    entry<Login> {
                        LoginScreen(
                            viewModel = authViewModel,
                            onSignupClick = {
                                backStack.removeLastOrNull()
                                backStack.add(Signup)
                            },
                            onLoginSuccess = {
                                isLoggedIn = true
                                backStack.removeLastOrNull()
                            }
                        )
                    }

                    entry<Signup> {
                        SignupScreen(
                            viewModel = authViewModel,
                            onLoginClick = {
                                backStack.removeLastOrNull()
                                backStack.add(Login)
                            },
                            onSignupSuccess = {
                                isLoggedIn = true
                                backStack.removeLastOrNull()
                            }
                        )
                    }
                }
            )
        }
    }
}
