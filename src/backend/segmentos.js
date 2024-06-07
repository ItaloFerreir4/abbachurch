const executarQuery = require('./consulta');

async function listarSegmentos() {
    
    let query = 'SELECT * FROM segmentos';

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarSegmento(nomeSegmento) {

    // Aplicar escape nas aspas simples e duplas nos valores de texto
    nomeSegmento = nomeSegmento.replace(/(['"])/g, "\\$1");
    
    const query = `
    INSERT INTO segmentos (nomeSegmento) 
    VALUES ('${nomeSegmento}')`;

    try {
        const Segmento = await executarQuery(query);
        return Segmento;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarSegmento(idSegmento) {
    
    let query = `DELETE FROM segmentos WHERE idSegmento = ${idSegmento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarSegmento(idSegmento) {
    
    let query = `SELECT * FROM segmentos WHERE idSegmento = ${idSegmento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarSegmento(idSegmento, nomeSegmento) {

    // Aplicar escape nas aspas simples e duplas nos valores de texto
    nomeSegmento = nomeSegmento.replace(/(['"])/g, "\\$1");
    
    let query = `
        UPDATE segmentos SET nomeSegmento = '${nomeSegmento}' WHERE idSegmento = ${idSegmento};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarSegmentos, cadastrarSegmento, deletarSegmento, carregarSegmento, atualizarSegmento };