const executarQuery = require('./consulta');

async function listarMinisterios(idUserLog, tipoUserLog, evento) {

    let query = tipoUserLog == 0 ? 'SELECT * FROM ministerios' : `SELECT * FROM ministerios WHERE liderId = ${idUserLog}`;

    if(evento == 1){
        query = 'SELECT * FROM ministerios';
    }

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarMinisterio(nomeMinisterio, liderId, dataEntradaMinisterio) {
    
    const query = `
    INSERT INTO ministerios (nomeMinisterio, liderId, dataEntradaMinisterio) 
    VALUES ('${nomeMinisterio}', '${liderId}', '${dataEntradaMinisterio}')`;

    try {
        const ministerio = await executarQuery(query);
        return ministerio;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarMinisterio(idMinisterio) {
    
    let query = `DELETE FROM ministerios WHERE idMinisterio = ${idMinisterio};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarMinisterio(idMinisterios) {
    
    let query = `SELECT * FROM ministerios WHERE idMinisterio = ${idMinisterios};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarMinisterio(idMinisterio, nomeMinisterio, liderId, dataEntradaMinisterio) {
    
    let query = `UPDATE ministerios SET nomeMinisterio = '${nomeMinisterio}', liderId = '${liderId}', dataEntradaMinisterio = '${dataEntradaMinisterio}' WHERE idMinisterio = ${idMinisterio};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarMinisterios, cadastrarMinisterio, deletarMinisterio, carregarMinisterio, atualizarMinisterio };