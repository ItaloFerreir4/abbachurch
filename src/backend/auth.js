const executarQuery = require('./consulta');
const bcrypt = require('bcrypt');

async function autenticarUsuario(email, senha) {
    const query = `
        SELECT * FROM pessoas p, usuarios u
        WHERE p.idPessoa = u.pessoaId AND p.emailPessoa = '${email}'`;

    try {
        const resultados = await executarQuery(query);

        if (resultados.length > 0) {

            const usuario = resultados[0];
            const senhaCorreta = await bcrypt.compare(senha, usuario.senhaUsuario);

            if (senhaCorreta) {
                return usuario;
            } else {
                return null;
            }
        } else {
            return null;
        }
    } catch (erro) {
        throw erro;
    }
}

module.exports = { autenticarUsuario };