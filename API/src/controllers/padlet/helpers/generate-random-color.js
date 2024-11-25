// utils/generate-random-color.js
function generateRandomPastelColor() {
  const r = Math.floor(Math.random() * 156) + 100; // Red value between 100 and 255
  const g = Math.floor(Math.random() * 156) + 100; // Green value between 100 and 255
  const b = Math.floor(Math.random() * 156) + 100; // Blue value between 100 et 255

  const hex = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  return hex;
}

module.exports = generateRandomPastelColor;
