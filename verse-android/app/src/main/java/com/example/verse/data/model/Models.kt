package com.example.verse.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Author(
    val id: String,
    val name: String? = null,
    val username: String? = null,
    val image: String? = null,
    val bio: String? = null,
    val location: String? = null,
    val website: String? = null,
    val poemCount: Int = 0,
    val followerCount: Int = 0,
    val followingCount: Int = 0,
    val isFollowing: Boolean = false,
    val createdAt: String? = null
)

@Serializable
data class Tag(
    val id: String,
    val name: String,
    val poemCount: Int = 0
)

@Serializable
data class PoemImage(
    val id: String,
    val url: String,
    val alt: String? = null
)

@Serializable
data class LikeCount(val likes: Int = 0, val comments: Int = 0)

@Serializable
data class Poem(
    val id: String,
    val title: String,
    val excerpt: String = "",
    val fullText: String = "",
    val featured: Boolean = false,
    val status: String = "PUBLISHED",
    val isPrivate: Boolean = false,
    val authorId: String = "",
    val author: Author? = null,
    val tags: List<Tag> = emptyList(),
    val images: List<PoemImage> = emptyList(),
    val isLiked: Boolean = false,
    val isFollowingAuthor: Boolean = false,
    val likeCount: Int = 0,
    val commentCount: Int = 0,
    val createdAt: String? = null
)

@Serializable
data class Comment(
    val id: String,
    val content: String,
    val poemId: String = "",
    val authorId: String = "",
    val author: Author? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

@Serializable
data class Collection(
    val id: String,
    val name: String,
    val description: String? = null,
    val isPublic: Boolean = true,
    val poemCount: Int = 0,
    val coverImage: String? = null,
    val poems: List<Poem> = emptyList(),
    val author: Author? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

@Serializable
data class Notification(
    val id: String,
    val type: String,
    val read: Boolean = false,
    val actor: Author? = null,
    val poem: PoemRef? = null,
    val createdAt: String? = null
)

@Serializable
data class PoemRef(
    val id: String,
    val title: String
)

@Serializable
data class UserProfile(
    val id: String,
    val name: String? = null,
    val username: String? = null,
    val email: String? = null,
    val image: String? = null,
    val bio: String? = null,
    val location: String? = null,
    val website: String? = null,
    val theme: String = "system",
    val immersiveMode: Boolean = false,
    val isPrivateAccount: Boolean = false,
    val emailNotifications: Boolean = true,
    val poemCount: Int = 0,
    val followerCount: Int = 0,
    val followingCount: Int = 0,
    val createdAt: String? = null
)
