package com.example.verse.ui.screens.poem

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.verse.data.api.ApiClient
import com.example.verse.data.model.Comment
import com.example.verse.data.model.Poem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class PoemDetailState(
    val poem: Poem? = null,
    val comments: List<Comment> = emptyList(),
    val isLoading: Boolean = true,
    val commentText: String = "",
    val isSendingComment: Boolean = false,
    val error: String? = null
)

class PoemDetailViewModel(private val poemId: String) : ViewModel() {
    private val _uiState = MutableStateFlow(PoemDetailState())
    val uiState: StateFlow<PoemDetailState> = _uiState.asStateFlow()

    init { load() }

    private fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val poemResult = ApiClient.api.getPoem(poemId)
                val commentsResult = ApiClient.api.getComments(poemId)
                _uiState.value = _uiState.value.copy(
                    poem = poemResult.poem,
                    comments = commentsResult.comments,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun updateCommentText(text: String) {
        _uiState.value = _uiState.value.copy(commentText = text)
    }

    fun submitComment() {
        val text = _uiState.value.commentText.trim()
        if (text.isBlank()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSendingComment = true)
            try {
                val result = ApiClient.api.addComment(poemId, com.example.verse.data.model.CommentRequest(text))
                _uiState.value = _uiState.value.copy(
                    comments = listOf(result.comment) + _uiState.value.comments,
                    commentText = "",
                    isSendingComment = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isSendingComment = false)
            }
        }
    }

    fun toggleLike() {
        viewModelScope.launch {
            try {
                val result = ApiClient.api.toggleLike(poemId)
                _uiState.value = _uiState.value.copy(
                    poem = _uiState.value.poem?.copy(isLiked = result.isLiked, likeCount = result.likeCount)
                )
            } catch (_: Exception) { }
        }
    }

    fun toggleFollow(authorId: String) {
        viewModelScope.launch {
            try {
                val result = ApiClient.api.toggleFollow(authorId)
                _uiState.value = _uiState.value.copy(
                    poem = _uiState.value.poem?.copy(isFollowingAuthor = result.isFollowing)
                )
            } catch (_: Exception) { }
        }
    }
}
