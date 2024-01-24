const executarQuery = require('./consulta');

async function listarVoluntariosEvento(eventoId) {
    
    let query = `SELECT * FROM voluntariosEvento ve, pessoas pe, voluntarios vo WHERE ve.eventoId = ${eventoId} AND ve.voluntarioId = vo.idVoluntario AND vo.pessoaId = pe.idPessoa`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function listarTodasAcoes() {
    
    let query = `SELECT * FROM voluntariosEvento ve, voluntarios vo, pessoas pe WHERE ve.voluntarioId = vo.idVoluntario AND vo.pessoaId = pe.idPessoa;`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarVoluntarioEvento(voluntarioId, eventoId, categoria) {

    const query = `
    INSERT INTO voluntariosEvento (voluntarioId, eventoId, categoria) 
    VALUES (${voluntarioId}, ${eventoId}, '${categoria}')`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarVoluntarioEvento(idVoluntarioEvento) {
    
    let query = `DELETE FROM voluntariosEvento WHERE idVoluntariosEvento = ${idVoluntarioEvento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarVoluntarioEvento(idVoluntarioEvento) {
    
    let query = `SELECT * FROM voluntariosEvento WHERE idVoluntariosEvento = ${idVoluntarioEvento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarVoluntarioEvento(idVoluntarioEvento, voluntarioId, eventoId, categoria) {

    let query = `UPDATE voluntariosEvento SET voluntarioId = ${voluntarioId}, eventoId = ${eventoId}, categoria = '${categoria}' WHERE idVoluntariosEvento = ${idVoluntarioEvento};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarTodasAcoes, listarVoluntariosEvento, cadastrarVoluntarioEvento, deletarVoluntarioEvento, carregarVoluntarioEvento, atualizarVoluntarioEvento };