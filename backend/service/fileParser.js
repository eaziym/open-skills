const path = require('path');

class FileParserService {
  parseFile(file) {
    const extension = path.extname(file.originalname).toLowerCase();
    const content = file.buffer.toString('utf-8');

    // Basic content cleaning
    const cleanContent = content
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, '  ')
      .trim();

    return {
      name: file.originalname,
      type: extension.slice(1), // Remove the dot from extension
      content: cleanContent
    };
  }

  // Split content into chunks for better embedding
  chunkContent(content, maxChunkSize = 1000) {
    const chunks = [];
    let currentChunk = '';

    const lines = content.split('\n');
    
    for (const line of lines) {
      if ((currentChunk + line).length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      currentChunk += line + '\n';
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

module.exports = new FileParserService(); 