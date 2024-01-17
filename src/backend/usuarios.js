const bcrypt = require('bcrypt');
const saltRounds = 12;
const executarQuery = require('./consulta');
const { verificarTokenConfirmacao } = require('./global');

async function cadastrarUsuario(pessoaId, senhaUsuario, tipoPessoa) {

    switch(tipoPessoa) {
        case 'admin':
            tipoPessoa = 0;
            break;
        case 'pastor':
            tipoPessoa = 1;
            break;
        case 'lider':
            tipoPessoa = 2;
            break;
        case 'ministerio':
            tipoPessoa = 3;
            break;
        case 'voluntario':
            tipoPessoa = 4;
            break;
    }

    try {

        let salt = await bcrypt.genSalt(saltRounds);
        let hashSenha = await bcrypt.hash(senhaUsuario, salt);

        let query = `INSERT INTO usuarios (pessoaId, senhaUsuario, tipoUsuario) VALUES ('${pessoaId}', '${hashSenha}', '${tipoPessoa}')`;

        let resultados = await executarQuery(query);
        return resultados;

    } catch (erro) {

        console.error('Erro:', erro);
        throw erro;

    }
}

async function recNovaSenha(token ,senhaUsuario) {
    
    let payload = verificarTokenConfirmacao(token);

    if (payload) {

        let salt = await bcrypt.genSalt(saltRounds);
        let hashSenha = await bcrypt.hash(senhaUsuario, salt);

        let query = `
            UPDATE usuarios
            SET senhaUsuario = '${hashSenha}'
            WHERE pessoaId = ${payload.pessoaId}`;

        try {
            await executarQuery(query);
            return senhaUsuario;
        } catch (erro) {
            throw erro;
        }
    } else {
        return false;
    }

}

module.exports = { cadastrarUsuario, recNovaSenha };