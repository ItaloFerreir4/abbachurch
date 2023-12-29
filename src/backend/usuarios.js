const bcrypt = require('bcrypt');
const saltRounds = 12;
const executarQuery = require('./consulta');

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

        const salt = await bcrypt.genSalt(saltRounds);
        const hashSenha = await bcrypt.hash(senhaUsuario, salt);

        const query = `INSERT INTO usuarios (pessoaId, senhaUsuario, tipoUsuario) VALUES ('${pessoaId}', '${hashSenha}', '${tipoPessoa}')`;

        const resultados = await executarQuery(query);
        return resultados;

    } catch (erro) {

        console.error('Erro:', erro);
        throw erro;

    }
}

module.exports = { cadastrarUsuario };