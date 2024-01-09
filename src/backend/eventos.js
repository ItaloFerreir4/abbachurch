const executarQuery = require('./consulta');

async function listarEventos() {
    
    let query = 'SELECT * FROM eventos';

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarEvento(nomeEvento, dataHoraEvento, localEvento, ministerioId, observacoesEvento) {
    
    const query = `
    INSERT INTO eventos (nomeEvento, dataHoraEvento, localEvento, ministerioId, observacoesEvento) 
    VALUES ('${nomeEvento}', '${dataHoraEvento}', '${localEvento}', '${ministerioId}', '${observacoesEvento}')`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarEvento(idEvento) {
    
    let query = `DELETE FROM eventos WHERE idEvento = ${idEvento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarEvento(idEvento) {
    
    let query = `SELECT * FROM eventos WHERE idEvento = ${idEvento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarEvento(idEvento, nomeEvento, dataHoraEvento, localEvento, ministerioId, observacoesEvento) {
    
    let query = `UPDATE eventos SET nomeEvento = '${nomeEvento}', dataHoraEvento = '${dataHoraEvento}', localEvento = '${localEvento}', ministerioId = '${ministerioId}', observacoesEvento = '${observacoesEvento}' WHERE idEvento = ${idEvento};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarEventos, cadastrarEvento, deletarEvento, carregarEvento, atualizarEvento };