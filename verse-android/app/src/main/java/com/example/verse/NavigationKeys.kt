package com.example.verse

import androidx.navigation3.runtime.NavKey
import kotlinx.serialization.Serializable

@Serializable data object Main : NavKey
@Serializable data object Login : NavKey
@Serializable data object Signup : NavKey
@Serializable data class PoemDetail(val poemId: String) : NavKey
@Serializable data class AuthorDetail(val authorId: String) : NavKey
@Serializable data object Search : NavKey
@Serializable data object Write : NavKey
@Serializable data object Collections : NavKey
@Serializable data class CollectionDetail(val collectionId: String) : NavKey
@Serializable data object Profile : NavKey
@Serializable data object Settings : NavKey
