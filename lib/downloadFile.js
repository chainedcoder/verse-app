// Converts a data: URL (base64 or percent-encoded, as produced by html-to-image) into a Blob.
export function dataUrlToBlob(dataUrl) {
  const commaIndex = dataUrl.indexOf(",")
  if (!dataUrl.startsWith("data:") || commaIndex === -1) {
    throw new Error("Invalid data URL")
  }
  const meta = dataUrl.slice(5, commaIndex)
  const payload = dataUrl.slice(commaIndex + 1)
  const isBase64 = /;base64$/i.test(meta)
  const mimeType = meta.replace(/;base64$/i, "").split(";")[0] || "application/octet-stream"

  if (!isBase64) {
    return new Blob([decodeURIComponent(payload)], { type: mimeType })
  }

  const binary = atob(payload)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mimeType })
}

// iOS WebKit (Safari and Chrome on iOS) ignores the `download` attribute on data: URLs,
// so files are always handed over as an object URL from an anchor attached to the document.
export function downloadDataUrl(dataUrl, fileName) {
  const blob = dataUrlToBlob(dataUrl)
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = objectUrl
  a.download = fileName
  a.rel = "noopener"
  a.style.display = "none"
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking immediately can cancel the download on iOS before the save prompt reads the blob.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 40000)
}
