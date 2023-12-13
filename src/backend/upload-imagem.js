const fs = require('fs');
const path = require('path');
const mimeTypes = require('mime-types');

async function saveImage(fotoPessoa) {
  if (!fotoPessoa || !fotoPessoa.data || !fotoPessoa.type) {
    throw new Error('Objeto de imagem inválido.');
  }

  try {
    // Converta a string base64 em buffer
    const imageBuffer = Buffer.from(fotoPessoa.data, 'base64');

    // Gere um nome único para a imagem
    const uniqueFilename = generateUniqueFilename();

    // Determine a extensão do arquivo com base no tipo de imagem fornecido
    const imageExtension = getImageExtension(fotoPessoa.type);

    // Lista de diretórios onde a imagem será salva (ajuste conforme necessário)
    const uploadDirectories = [
      path.join(__dirname, '../assets/uploads/'),
      path.join(__dirname, '../../src/assets/uploads/'),
      // Adicione mais diretórios conforme necessário
    ];

    // Verifique se os diretórios existem, se não, crie-os
    uploadDirectories.forEach((directory) => {
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
    });

    // Salva a imagem em cada diretório
    const savePromises = uploadDirectories.map((directory) => {
      const imagePath = path.join(directory, `${uniqueFilename}.${imageExtension}`);
      return new Promise((resolve, reject) => {
        fs.writeFile(imagePath, imageBuffer, (err) => {
          if (err) {
            console.error('Erro ao salvar a imagem:', err);
            reject(err);
          } else {
            resolve(`${uniqueFilename}.${imageExtension}`);
          }
        });
      });
    });

    // Aguarda todas as cópias serem salvas antes de resolver a promessa
    await Promise.all(savePromises);

    // Retorna o nome do arquivo após salvar com sucesso em todos os diretórios
    return `${uniqueFilename}.${imageExtension}`;
  } catch (error) {
    console.error('Erro na função saveImage:', error);
    throw error;
  }
}

// Função para determinar a extensão do arquivo com base no tipo de imagem
function getImageExtension(imageType) {
  // Use a biblioteca mime-types para obter a extensão com base no tipo de imagem
  const extension = mimeTypes.extension(imageType);

  // Se a extensão for conhecida, retorne-a; caso contrário, retorne 'png' como padrão
  return extension || 'png';
}

function generateUniqueFilename() {
  const timestamp = Date.now();
  return `image_${timestamp}`;
}

module.exports = { saveImage };