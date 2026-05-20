import Tesseract from 'tesseract.js';

export async function extractTextFromImage(imageBuffer: Buffer | string): Promise<string> {
  try {
    const result = await Tesseract.recognize(
      imageBuffer,
      'eng',
      { logger: m => console.log(m) }
    );
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}
