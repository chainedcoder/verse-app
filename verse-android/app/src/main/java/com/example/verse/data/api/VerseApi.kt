package com.example.verse.data.api

import com.example.verse.data.model.*
import retrofit2.http.*

interface VerseApi {

    // ── Auth ─────────────────────────────────────
    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse

    // ── Poems ────────────────────────────────────
    @GET("api/v1/poems")
    suspend fun getPoems(
        @Query("cursor") cursor: String? = null,
        @Query("limit") limit: Int = 10,
        @Query("tag") tag: String = "all",
        @Query("featured") featured: Boolean = false
    ): PoemsResponse

    @POST("api/v1/poems")
    suspend fun createPoem(@Body request: CreatePoemRequest): PoemResponse

    @GET("api/v1/poems/{id}")
    suspend fun getPoem(@Path("id") id: String): PoemResponse

    @PUT("api/v1/poems/{id}")
    suspend fun updatePoem(@Path("id") id: String, @Body request: CreatePoemRequest): PoemResponse

    @DELETE("api/v1/poems/{id}")
    suspend fun deletePoem(@Path("id") id: String): SuccessResponse

    // ── Interactions ─────────────────────────────
    @POST("api/v1/poems/{id}/like")
    suspend fun toggleLike(@Path("id") poemId: String): LikeResponse

    @GET("api/v1/poems/{id}/comments")
    suspend fun getComments(@Path("id") poemId: String): CommentsResponse

    @POST("api/v1/poems/{id}/comments")
    suspend fun addComment(@Path("id") poemId: String, @Body request: CommentRequest): CommentResponse

    // ── Search ───────────────────────────────────
    @GET("api/v1/poems/search")
    suspend fun searchPoems(@Query("q") query: String): PoemsResponse

    // ── Authors ──────────────────────────────────
    @GET("api/v1/authors")
    suspend fun getAuthors(@Query("limit") limit: Int = 20): AuthorsResponse

    @GET("api/v1/authors/{id}")
    suspend fun getAuthor(@Path("id") id: String): AuthorDetailResponse

    @POST("api/v1/authors/{id}/follow")
    suspend fun toggleFollow(@Path("id") authorId: String): FollowResponse

    // ── Collections ──────────────────────────────
    @GET("api/v1/collections")
    suspend fun getCollections(): CollectionsResponse

    @POST("api/v1/collections")
    suspend fun createCollection(@Body request: CreateCollectionRequest): CollectionResponse

    @GET("api/v1/collections/{id}")
    suspend fun getCollection(@Path("id") id: String): CollectionDetailResponse

    @DELETE("api/v1/collections/{id}")
    suspend fun deleteCollection(@Path("id") id: String): SuccessResponse

    // ── Profile ──────────────────────────────────
    @GET("api/v1/profile")
    suspend fun getProfile(): ProfileResponse

    // ── Notifications ────────────────────────────
    @GET("api/v1/notifications")
    suspend fun getNotifications(): NotificationsResponse

    @POST("api/v1/notifications")
    suspend fun markNotificationsRead(): SuccessResponse

    // ── Tags ─────────────────────────────────────
    @GET("api/v1/tags")
    suspend fun getTags(): TagsResponse
}
