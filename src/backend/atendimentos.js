const executarQuery = require('./consulta');
const { formatarDataHora } = require('./formata-data');
const moment = require('moment');

async function listarAtendimentos(tipoListagem, atendidoAtendimento) {

    let query = '';

    switch(tipoListagem){
        case 'todos':
            query = 'SELECT * FROM atendimentos';
            break;
        case 'pessoasAtendidas':
            // query = 'SELECT pe.*, at.* FROM pessoas pe INNER JOIN atendimentos at ON pe.idPessoa = at.atendidoAtendimento GROUP BY at.atendidoAtendimento;';
            query = 'SELECT pe.*, at.* FROM pessoas pe INNER JOIN atendimentos at ON pe.idPessoa = at.atendidoAtendimento INNER JOIN ( SELECT at.atendidoAtendimento, MAX(at.dataAtendimento) as maxDataAtendimento FROM atendimentos at GROUP BY at.atendidoAtendimento ) at_max ON at.atendidoAtendimento = at_max.atendidoAtendimento AND at.dataAtendimento = at_max.maxDataAtendimento ORDER BY at.dataAtendimento DESC;';
            break;
        case 'atendimentoPessoa':
            query = `SELECT * FROM pessoas pe INNER JOIN atendimentos at ON at.atendidoAtendimento = ${atendidoAtendimento} AND pe.idPessoa = at.atendidoAtendimento ORDER BY at.dataAtendimento DESC, at.idAtendimento DESC;`;
            break;
    }
    
    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarAtendimento(atendenteAtendimento, atendidoAtendimento, tituloAtendimento, anotacaoAtendimento, dataAtendimento) {

    let dataAtual = moment();
    let horaFormatada = dataAtual.format('hh:mm A');
    dataAtendimento = dataAtendimento + ' ' + horaFormatada;
    dataAtendimento = formatarDataHora(dataAtendimento);


    // Aplicar escape nas aspas simples e duplas nos valores de texto
    tituloAtendimento = tituloAtendimento.replace(/(['"])/g, "\\$1");
    anotacaoAtendimento = anotacaoAtendimento.replace(/(['"])/g, "\\$1");
    
    const query = `
    INSERT INTO atendimentos (atendenteAtendimento, atendidoAtendimento, tituloAtendimento, anotacaoAtendimento, dataAtendimento, statusAtendimento) 
    VALUES ('${atendenteAtendimento}', '${atendidoAtendimento}', '${tituloAtendimento}', '${anotacaoAtendimento}', '${dataAtendimento}', 1)`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarAtendimento(idAtendimento) {
    
    let query = `DELETE FROM atendimentos WHERE idAtendimento = ${idAtendimento};`;

    try {
        const resultado = await executarQuery(query);
        return resultado ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarAtendimento(idAtendimento) {
    
    let query = `SELECT * FROM atendimentos WHERE idAtendimento = ${idAtendimento};`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarAtendimento(idAtendimento, atendenteAtendimento, atendidoAtendimento, tituloAtendimento, anotacaoAtendimento, dataAtendimento) {

    dataAtendimento = formatarDataHora(dataAtendimento);

    // Aplicar escape nas aspas simples e duplas nos valores de texto
    tituloAtendimento = tituloAtendimento.replace(/(['"])/g, "\\$1");
    anotacaoAtendimento = anotacaoAtendimento.replace(/(['"])/g, "\\$1");
    
    let query = `
        UPDATE atendimentos SET 
        atendenteAtendimento = '${atendenteAtendimento}', 
        atendidoAtendimento = '${atendidoAtendimento}', 
        tituloAtendimento = '${tituloAtendimento}', 
        anotacaoAtendimento = '${anotacaoAtendimento}',
        dataAtendimento = '${dataAtendimento}'
        WHERE idAtendimento = ${idAtendimento};`;
        
    try {
        const resultados = await executarQuery(query);

        if(resultados){
            await historicoAtualizacao(idAtendimento);
        }

        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarStatusAtendimento(pessoaId, statusAtendimento) {
    
    let query = `
        UPDATE atendimentos
        SET statusAtendimento = '${statusAtendimento}'
        WHERE atendidoAtendimento = ${pessoaId};
        `;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }

}

async function listarHistoricoAtualizacaoAtendimentos() {
    
    const query = `SELECT * FROM historicoAtualizacaoAtendimento`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function historicoAtualizacao(atendimentoId) {

    let dataAtualizacaoAtendimento = moment();
    dataAtualizacaoAtendimento = dataAtualizacaoAtendimento.format('YYYY-MM-DD');
    
    const query = `
    INSERT INTO historicoAtualizacaoAtendimento (atendimentoId, dataAtualizacaoAtendimento) 
    VALUES ('${atendimentoId}', '${dataAtualizacaoAtendimento}')`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarAtendimentos, cadastrarAtendimento, deletarAtendimento, carregarAtendimento, atualizarAtendimento, atualizarStatusAtendimento, listarHistoricoAtualizacaoAtendimentos };