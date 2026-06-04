package com.example.verse.data.model

import kotlinx.serialization.Serializable

// ── Auth ─────────────────────────────────────────
@Serializable data class LoginRequest(val email: String, val password: String)
@Serializable data class RegisterRequest(val name: String, val email: String, val password: String)
@Serializable data class AuthResponse(val token: String, val user: Author)

// ── Poems ────────────────────────────────────────
@Serializable data class PoemsResponse(val poems: List<Poem>, val nextCursor: String? = null)
@Serializable data class PoemResponse(val poem: Poem)
@Serializable data class CreatePoemRequest(
    val title: String,
    val fullText: String,
    val excerpt: String = "",
    val tags: List<String> = emptyList(),
    val status: String = "PUBLISHED",
    val isPrivate: Boolean = false
)

// ── Interactions ─────────────────────────────────
@Serializable data class LikeResponse(val isLiked: Boolean, val likeCount: Int)
@Serializable data class FollowResponse(val isFollowing: Boolean, val followerCount: Int)

// ── Comments ─────────────────────────────────────
@Serializable data class CommentsResponse(val comments: List<Comment>)
@Serializable data class CommentRequest(val content: String)
@Serializable data class CommentResponse(val comment: Comment)

// ── Authors ──────────────────────────────────────
@Serializable data class AuthorsResponse(val authors: List<Author>)
@Serializable data class AuthorDetailResponse(val author: Author, val poems: List<Poem>)

// ── Collections ──────────────────────────────────
@Serializable data class CollectionsResponse(val collections: List<Collection>)
@Serializable data class CollectionDetailResponse(val collection: Collection)
@Serializable data class CreateCollectionRequest(val name: String, val description: String? = null, val isPublic: Boolean = true)
@Serializable data class CollectionResponse(val collection: Collection)

// ── Profile ──────────────────────────────────────
@Serializable data class ProfileResponse(val profile: UserProfile)

// ── Notifications ────────────────────────────────
@Serializable data class NotificationsResponse(val notifications: List<Notification>, val unreadCount: Int)
@Serializable data class SuccessResponse(val success: Boolean)

// ── Tags ─────────────────────────────────────────
@Serializable data class TagsResponse(val tags: List<Tag>)
