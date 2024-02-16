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

async function cadastrarEvento(nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, localEvento, ministerioId, observacoesEvento, categoriaEventoId) {
    
    let dataHoraInicio = formatarDataHora(dataHoraInicioEvento);
    let dataHoraFim = formatarDataHora(dataHoraFimEvento);

    // Aplicar escape nas aspas simples e duplas nos valores de texto
    nomeEvento = nomeEvento.replace(/(['"])/g, "\\$1");
    localEvento = localEvento.replace(/(['"])/g, "\\$1");
    observacoesEvento = observacoesEvento.replace(/(['"])/g, "\\$1");

    const query = `
    INSERT INTO eventos (nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, localEvento, ministerioId, observacoesEvento, categoriaEventoId) 
    VALUES ('${nomeEvento}', '${dataHoraInicio}', '${dataHoraFim}', '${localEvento}', '${ministerioId}', '${observacoesEvento}', '${categoriaEventoId}')`;

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

async function atualizarEvento(idEvento, nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, localEvento, ministerioId, observacoesEvento, categoriaEventoId) {
    
    let dataHoraInicio = formatarDataHora(dataHoraInicioEvento);
    let dataHoraFim = formatarDataHora(dataHoraFimEvento);

    // Aplicar escape nas aspas simples e duplas nos valores de texto
    nomeEvento = nomeEvento.replace(/(['"])/g, "\\$1");
    localEvento = localEvento.replace(/(['"])/g, "\\$1");
    observacoesEvento = observacoesEvento.replace(/(['"])/g, "\\$1");

    let query = `UPDATE eventos SET nomeEvento = '${nomeEvento}', dataHoraInicioEvento = '${dataHoraInicio}', dataHoraFimEvento = '${dataHoraFim}', localEvento = '${localEvento}', ministerioId = '${ministerioId}', observacoesEvento = '${observacoesEvento}', categoriaEventoId = '${categoriaEventoId}' WHERE idEvento = ${idEvento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarEventos, cadastrarEvento, deletarEvento, carregarEvento, atualizarEvento };