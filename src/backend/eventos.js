const executarQuery = require('./consulta');
const { formatarDataHora } = require('./formata-data');

async function listarEventos() {
    
    let query = 'SELECT * FROM eventos ORDER BY categoriaEventoId ASC';

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarEvento(nomeEvento, dataHoraEvento, localEvento, ministerioId, observacoesEvento, categoriaEventoId) {
    
    let dataHora = formatarDataHora(dataHoraEvento);

    const query = `
    INSERT INTO eventos (nomeEvento, dataHoraEvento, localEvento, ministerioId, observacoesEvento, categoriaEventoId) 
    VALUES ('${nomeEvento}', '${dataHora}', '${localEvento}', '${ministerioId}', '${observacoesEvento}', '${categoriaEventoId}')`;

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

async function atualizarEvento(idEvento, nomeEvento, dataHoraEvento, localEvento, ministerioId, observacoesEvento, categoriaEventoId) {
    
    let dataHora = formatarDataHora(dataHoraEvento);

    let query = `UPDATE eventos SET nomeEvento = '${nomeEvento}', dataHoraEvento = '${dataHora}', localEvento = '${localEvento}', ministerioId = '${ministerioId}', observacoesEvento = '${observacoesEvento}', categoriaEventoId = '${categoriaEventoId}' WHERE idEvento = ${idEvento};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarEventos, cadastrarEvento, deletarEvento, carregarEvento, atualizarEvento };