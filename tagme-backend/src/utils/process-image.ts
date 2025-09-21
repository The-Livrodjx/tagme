import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';

export async function processImage(file: Express.Multer.File): Promise<string> {
  try {
    const originalPath = file.path;

    const processedFilename = `processed-${file.filename}`;
    const outputPath = path.join('./src/itens/uploads/items', processedFilename);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    await sharp(originalPath)
      .resize(500, 500, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(outputPath);

    return processedFilename;
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    throw new Error(`Falha ao processar imagem: ${error.message}`);
  }
}