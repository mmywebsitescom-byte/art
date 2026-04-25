export const processAscii = (
  sourceCanvas,
  targetCanvas,
  options
) => {
  const {
    chars = "@#S%?*+;:,.",
    resolution = 10,
    colorMode = "grayscale",
    singleColor = "#00ff00",
    invertMapping = false,
    filters = { brightness: 100, contrast: 100, invert: 0, blur: 0 },
    bg = "#000000"
  } = options;

  const ctxSource = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const ctxTarget = targetCanvas.getContext("2d");

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  ctxSource.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) invert(${filters.invert}%) blur(${filters.blur}px)`;
  ctxSource.drawImage(sourceCanvas, 0, 0, width, height);

  const imgData = ctxSource.getImageData(0, 0, width, height);
  const data = imgData.data;

  targetCanvas.width = width;
  targetCanvas.height = height;
  ctxTarget.fillStyle = bg;
  ctxTarget.fillRect(0, 0, width, height);
  ctxTarget.textBaseline = "top";
  
  const fontSize = resolution * 1.2;
  ctxTarget.font = `${fontSize}px monospace`;

  let plainText = "";
  const charArray = invertMapping ? chars.split("").reverse() : chars.split("");
  const charLen = charArray.length;

  for (let y = 0; y < height; y += resolution) {
    let rowText = "";
    for (let x = 0; x < width; x += resolution) {
      const offset = (y * width + x) * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const a = data[offset + 3];

      if (a === 0) {
        rowText += " ";
        continue;
      }

      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const charIndex = Math.floor(brightness * (charLen - 1));
      const char = charArray[charIndex] || " ";
      rowText += char;

      if (colorMode === "color") {
        ctxTarget.fillStyle = `rgb(${r},${g},${b})`;
      } else if (colorMode === "grayscale") {
        const v = Math.floor(brightness * 255);
        ctxTarget.fillStyle = `rgb(${v},${v},${v})`;
      } else if (colorMode === "inverted") {
        ctxTarget.fillStyle = `rgb(${255 - r},${255 - g},${255 - b})`;
      } else {
        ctxTarget.fillStyle = singleColor;
      }

      ctxTarget.fillText(char, x, y);
    }
    plainText += rowText + "\n";
  }

  return plainText;
};
