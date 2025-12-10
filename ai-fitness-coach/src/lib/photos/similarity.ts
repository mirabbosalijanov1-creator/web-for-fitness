import sharp from "sharp";

/**
 * Generates a simple perceptual hash using the dHash algorithm.
 */
export const generatePerceptualHash = async (fileBuffer: Buffer) => {
  const resized = await sharp(fileBuffer)
    .grayscale()
    .resize(9, 8, { fit: "fill" })
    .raw()
    .toBuffer();

  let hash = "";

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const leftPixel = resized[row * 9 + col];
      const rightPixel = resized[row * 9 + col + 1];
      hash += leftPixel < rightPixel ? "1" : "0";
    }
  }

  return hash;
};

export const hammingDistance = (a: string, b: string) => {
  let distance = 0;
  const length = Math.min(a.length, b.length);

  for (let i = 0; i < length; i += 1) {
    if (a[i] !== b[i]) {
      distance += 1;
    }
  }

  return distance + Math.abs(a.length - b.length);
};

export const isSimilarHash = (a: string, b: string, threshold = 5) => {
  return hammingDistance(a, b) <= threshold;
};
