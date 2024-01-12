const jwt = require('jsonwebtoken');
const segredo = 's3Cr3T4BbA';

function gerarTokenConfirmacao(pessoaId, email) {
    const payload = {
        pessoaId: pessoaId,
        email: email,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // O token expirará em 1 dia
    };
  
    return jwt.sign(payload, segredo);
  }

function verificarTokenConfirmacao(token) {
    try {
        const decoded = jwt.verify(token, segredo);
        return {
            pessoaId: decoded.pessoaId,
            email: decoded.email,
        };
    } catch (error) {
        // Token inválido ou expirado
        console.error('Erro ao verificar token de confirmação:', error);
        return null;
    }
}

module.exports = { gerarTokenConfirmacao, verificarTokenConfirmacao }