const executarQuery = require('./consulta');

async function autenticarUsuario(email, senha) {
    const query = `
        SELECT * FROM pessoas p, usuarios u
        WHERE p.idPessoa = u.pessoaId AND p.emailPessoa = '${email}' AND u.senhaUsuario = '${senha}'`;

    try {
        const resultados = await executarQuery(query);
        return resultados.length > 0 ? resultados[0] : null;
    } catch (erro) {
        throw erro;
    }
}

module.exports = { autenticarUsuario };