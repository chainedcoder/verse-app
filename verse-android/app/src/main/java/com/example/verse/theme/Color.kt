package com.example.verse.theme

import androidx.compose.ui.graphics.Color

// ── Verse Light Theme Colors ─────────────────────
val LightBackground = Color(0xFFFAF8F4)
val LightBackgroundSecondary = Color(0xFFF5F2EC)
val LightBackgroundTertiary = Color(0xFFEEE9E0)
val LightCard = Color(0xFFFFFFFF)
val LightCardHover = Color(0xFFFDFCFA)

val LightTextPrimary = Color(0xFF1A1A2E)
val LightTextSecondary = Color(0xFF5A5A6E)
val LightTextTertiary = Color(0xFF8A8A9A)

val LightBorderPrimary = Color(0xFFD0CCC4)
val LightBorderSecondary = Color(0xFFDDD9D0)

// ── Verse Dark Theme Colors ──────────────────────
val DarkBackground = Color(0xFF0E0E1A)
val DarkBackgroundSecondary = Color(0xFF16162A)
val DarkBackgroundTertiary = Color(0xFF1E1E36)
val DarkCard = Color(0xFF1A1A30)
val DarkCardHover = Color(0xFF22223A)

val DarkTextPrimary = Color(0xFFE8E4DC)
val DarkTextSecondary = Color(0xFF9A96A6)
val DarkTextTertiary = Color(0xFF6A667A)

val DarkBorderPrimary = Color(0xFF3A3650)
val DarkBorderSecondary = Color(0xFF2E2A42)

// ── Accent Color Palettes ────────────────────────
// Each accent has a light and dark variant
object VerseAccents {
    val IndigoLight = Color(0xFF363254)  // hsl(235, 45%, 22%)
    val IndigoDark  = Color(0xFF9B96D6)  // hsl(235, 45%, 72%)

    val RoseLight  = Color(0xFFA33354)   // hsl(348, 60%, 40%)
    val RoseDark   = Color(0xFFD98BA4)   // hsl(348, 60%, 72%)

    val EmeraldLight = Color(0xFF237A58) // hsl(160, 50%, 28%)
    val EmeraldDark  = Color(0xFF6BC9A3) // hsl(160, 50%, 65%)

    val AmberLight = Color(0xFF8A6020)   // hsl(32, 65%, 35%)
    val AmberDark  = Color(0xFFD4A84D)   // hsl(32, 65%, 70%)

    val VioletLight = Color(0xFF6B3FA0)  // hsl(270, 50%, 35%)
    val VioletDark  = Color(0xFFB896E0)  // hsl(270, 50%, 72%)

    val OceanLight  = Color(0xFF1F6B8A)  // hsl(200, 60%, 30%)
    val OceanDark   = Color(0xFF5AA8C9)  // hsl(200, 60%, 68%)
}

// ── Functional Colors ────────────────────────────
val DangerColor = Color(0xFFDC3545)
val SuccessColor = Color(0xFF28A745)
val WarningColor = Color(0xFFFFC107)

// ── Featured Colors ──────────────────────────────
val FeaturedBgLight = Color(0xFFF5E6D3)
val FeaturedTextLight = Color(0xFF8B5E3C)
val FeaturedBgDark = Color(0xFF3A2A18)
val FeaturedTextDark = Color(0xFFE8C89A)
