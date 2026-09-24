const accentDefs = {
  indigo: { h: 235, s: 45 },
  rose: { h: 348, s: 60 },
  emerald: { h: 160, s: 50 },
  amber: { h: 32, s: 65 },
  violet: { h: 270, s: 50 },
  ocean: { h: 200, s: 60 },
}

function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`
}

export function getExportPalettes(accent = "indigo") {
  const def = accentDefs[accent] || accentDefs.indigo
  return {
    siteview: [
      { bg: "#faf8f4", text: "#1a1a2e", accent: hsl(def.h, def.s, 22), label: "Light" },
      { bg: "#0e0e1a", text: "#e8e4dc", accent: hsl(def.h, def.s, 72), label: "Dark" },
    ],
    minimal: [
      { bg: "#ffffff", text: "#1a1a1a", accent: "#1a1a2e" },
      { bg: "#f9f6f0", text: "#2c2820", accent: "#4a3f35" },
      { bg: "#e8e6e1", text: "#1a1a1a", accent: "#222222" }
    ],
    dark: [
      { bg: "#12112a", text: "#e8e0d4", accent: "#3a3660" },
      { bg: "#1a1a1a", text: "#e8e8e8", accent: "#444444" },
      { bg: "#11221c", text: "#d4e8dd", accent: "#2a4a38" }
    ],
    love: [
      { bg: "#f5f0e4", text: "#1a1a1a", accent: "#c0392b" },
      { bg: "#fff0f3", text: "#2a1a1c", accent: "#d65a73" },
      { bg: "#fcedea", text: "#2c1e1c", accent: "#b05050" },
      { bg: "#171923", text: "#f2e8e5", accent: "#e8a6b5", label: "Midnight" },
      { bg: "#301b26", text: "#fae9ed", accent: "#e9b7a2", label: "Burgundy" },
      { bg: "#202020", text: "#f5eee3", accent: "#d9c49c", label: "Charcoal" }
    ],
    botanical: [
      { bg: "#f3f1e6", text: "#293e32", accent: "#526c49", label: "Sage" },
      { bg: "#142e26", text: "#edf0df", accent: "#b4c998", label: "Forest" },
      { bg: "#fbf2e9", text: "#51392d", accent: "#9a573b", label: "Terracotta" },
    ],
    celestial: [
      { bg: "#141b32", text: "#eeeaf5", accent: "#d6bd86", label: "Starlight" },
      { bg: "#f8f5ee", text: "#343046", accent: "#786136", label: "Daybreak" },
      { bg: "#30243c", text: "#f4eafa", accent: "#d8b3d9", label: "Dusk" },
    ],
    story: [
      { bg: "#2d1f3d", text: "#f0e8ff", accent: "#9b7eb8" },
      { bg: "#0d1117", text: "#c9d1d9", accent: "#58a6ff" },
      { bg: "#3d261f", text: "#ffece8", accent: "#d97c66" },
      { bg: "#ffffff", text: "#252334", accent: "#62567e", label: "White" },
      { bg: "#faf6ed", text: "#383129", accent: "#80633f", label: "Ivory" },
      { bg: "#edf2f5", text: "#243642", accent: "#42677b", label: "Mist" }
    ]
  }
}

export const CREATIVE_LAYOUTS = [
  { id: "botanical", title: "Botanical press", desc: "Pressed leaves & quiet verse" },
  { id: "celestial", title: "Celestial", desc: "Moonlight & golden orbits" },
]
