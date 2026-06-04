package com.example.verse.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val VerseDarkColorScheme = darkColorScheme(
    primary = VerseAccents.IndigoDark,
    onPrimary = DarkBackground,
    primaryContainer = VerseAccents.IndigoDark.copy(alpha = 0.2f),
    onPrimaryContainer = VerseAccents.IndigoDark,

    secondary = DarkTextSecondary,
    onSecondary = DarkBackground,
    secondaryContainer = DarkBackgroundTertiary,
    onSecondaryContainer = DarkTextSecondary,

    tertiary = FeaturedTextDark,
    tertiaryContainer = FeaturedBgDark,
    onTertiaryContainer = FeaturedTextDark,

    background = DarkBackground,
    onBackground = DarkTextPrimary,

    surface = DarkCard,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkBackgroundSecondary,
    onSurfaceVariant = DarkTextSecondary,

    outline = DarkBorderPrimary,
    outlineVariant = DarkBorderSecondary,

    error = DangerColor,
    onError = Color.White,

    inverseSurface = LightCard,
    inverseOnSurface = LightTextPrimary,
)

private val VerseLightColorScheme = lightColorScheme(
    primary = VerseAccents.IndigoLight,
    onPrimary = Color.White,
    primaryContainer = VerseAccents.IndigoLight.copy(alpha = 0.08f),
    onPrimaryContainer = VerseAccents.IndigoLight,

    secondary = LightTextSecondary,
    onSecondary = Color.White,
    secondaryContainer = LightBackgroundTertiary,
    onSecondaryContainer = LightTextSecondary,

    tertiary = FeaturedTextLight,
    tertiaryContainer = FeaturedBgLight,
    onTertiaryContainer = FeaturedTextLight,

    background = LightBackground,
    onBackground = LightTextPrimary,

    surface = LightCard,
    onSurface = LightTextPrimary,
    surfaceVariant = LightBackgroundSecondary,
    onSurfaceVariant = LightTextSecondary,

    outline = LightBorderPrimary,
    outlineVariant = LightBorderSecondary,

    error = DangerColor,
    onError = Color.White,

    inverseSurface = DarkCard,
    inverseOnSurface = DarkTextPrimary,
)

@Composable
fun VerseTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) VerseDarkColorScheme else VerseLightColorScheme

    // Set system bar colors
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? android.app.Activity)?.window ?: return@SideEffect
            @Suppress("DEPRECATION")
            window.statusBarColor = colorScheme.background.toArgb()
            @Suppress("DEPRECATION")
            window.navigationBarColor = colorScheme.background.toArgb()
            val controller = WindowCompat.getInsetsController(window, view)
            controller.isAppearanceLightStatusBars = !darkTheme
            controller.isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
