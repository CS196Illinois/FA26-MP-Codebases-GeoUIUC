// An <img> can only be drawn onto a canvas once it has finished loading successfully.
// A missing or failed image (e.g. a 404) is "complete" but has no width.
export function isDrawable(image) {
    return Boolean(image?.complete && image.naturalWidth > 0)
}

// Use the player's profile picture when it loaded, otherwise the default icon.
// Returns null if neither can be drawn, so the caller can draw a plain pin instead.
export function pickPinImage(profileImage, fallbackImage) {
    if (isDrawable(profileImage)) return profileImage
    if (isDrawable(fallbackImage)) return fallbackImage
    return null
}
