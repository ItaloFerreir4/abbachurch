const mysql = require('mysql2/promise');
const config = require('./config/conexao-bd');

async function executarQuery(query) {
    const conexaoBanco = await mysql.createConnection(config);

    try {
        await conexaoBanco.beginTransaction();
        const [resultados] = await conexaoBanco.query(query);
        await conexaoBanco.commit();

        return resultados;
    } catch (erro) {
        await conexaoBanco.rollback();
        throw erro;
    } finally {
        await conexaoBanco.end();
    }
}

module.exports = executarQuery;