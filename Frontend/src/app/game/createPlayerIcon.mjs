export const FALLBACK_PLAYER_ICON = "/profile-icon.png";

// Browser APIs are created only when called, so importing this module is SSR-safe.
export function createPlayerIcon(
  profileUrl,
  {
    createImage = () => new Image(),
    createCanvas = () => document.createElement("canvas"),
    timeoutMs = 5000,
  } = {},
) {
  if (
    typeof profileUrl !== "string" ||
    !profileUrl.trim() ||
    profileUrl === "null" ||
    profileUrl === "undefined"
  ) {
    return Promise.resolve(FALLBACK_PLAYER_ICON);
  }

  return new Promise((resolve) => {
    let image;
    let timer;
    let settled = false;
    const finish = (url) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (image) {
        image.onload = null;
        image.onerror = null;
      }
      resolve(url);
    };

    try {
      image = createImage();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        if (settled) return;
        try {
          if (!image.naturalWidth || !image.naturalHeight) {
            finish(FALLBACK_PLAYER_ICON);
            return;
          }
          // Keep this canvas detached from the page: it only generates a marker.
          const canvas = createCanvas();
          canvas.width = 100;
          canvas.height = 100;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            finish(FALLBACK_PLAYER_ICON);
            return;
          }
          ctx.fillStyle = "#3e5ab3";
          ctx.beginPath();
          ctx.ellipse(50, 50, 30, 30, Math.PI, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(20, 55);
          ctx.bezierCurveTo(40, 105, 60, 105, 80, 55);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(50, 50, 25, 25, Math.PI, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip("nonzero");
          ctx.drawImage(image, 25, 25, 50, 50);
          finish(canvas.toDataURL());
        } catch {
          // Drawing and export can fail, for example with a CORS-tainted canvas.
          finish(FALLBACK_PLAYER_ICON);
        }
      };
      image.onerror = () => finish(FALLBACK_PLAYER_ICON);
      timer = setTimeout(() => finish(FALLBACK_PLAYER_ICON), timeoutMs);
      image.src = profileUrl;
    } catch {
      finish(FALLBACK_PLAYER_ICON);
    }
  });
}
