package com.example.verse.ui.screens.feed

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.verse.data.api.ApiClient
import com.example.verse.data.model.Poem
import com.example.verse.data.model.Tag
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class FeedUiState(
    val poems: List<Poem> = emptyList(),
    val featuredPoems: List<Poem> = emptyList(),
    val tags: List<Tag> = emptyList(),
    val activeTag: String = "all",
    val nextCursor: String? = null,
    val isLoading: Boolean = true,
    val isLoadingMore: Boolean = false,
    val error: String? = null
)

class FeedViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(FeedUiState())
    val uiState: StateFlow<FeedUiState> = _uiState.asStateFlow()

    init {
        loadInitialData()
    }

    private fun loadInitialData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val poemsResult = ApiClient.api.getPoems(limit = 10)
                val featuredResult = ApiClient.api.getPoems(featured = true, limit = 10)
                val tagsResult = ApiClient.api.getTags()

                _uiState.value = _uiState.value.copy(
                    poems = poemsResult.poems,
                    featuredPoems = featuredResult.poems,
                    tags = tagsResult.tags,
                    nextCursor = poemsResult.nextCursor,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load feed"
                )
            }
        }
    }

    fun selectTag(tag: String) {
        if (tag == _uiState.value.activeTag) return
        _uiState.value = _uiState.value.copy(activeTag = tag, isLoading = true)
        viewModelScope.launch {
            try {
                val result = ApiClient.api.getPoems(tag = tag, limit = 10)
                _uiState.value = _uiState.value.copy(
                    poems = result.poems,
                    nextCursor = result.nextCursor,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun loadMore() {
        val cursor = _uiState.value.nextCursor ?: return
        if (_uiState.value.isLoadingMore) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingMore = true)
            try {
                val result = ApiClient.api.getPoems(
                    cursor = cursor,
                    tag = _uiState.value.activeTag,
                    limit = 10
                )
                _uiState.value = _uiState.value.copy(
                    poems = _uiState.value.poems + result.poems,
                    nextCursor = result.nextCursor,
                    isLoadingMore = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoadingMore = false)
            }
        }
    }

    fun toggleLike(poemId: String) {
        viewModelScope.launch {
            try {
                ApiClient.api.toggleLike(poemId)
            } catch (_: Exception) { }
        }
    }

    fun refresh() {
        _uiState.value = _uiState.value.copy(activeTag = "all")
        loadInitialData()
    }
}
