const executarQuery = require('./consulta');
const { formatarDataHora } = require('./formata-data');

async function listarAtendimentos(tipoListagem, atendidoAtendimento) {

    let query = '';

    switch(tipoListagem){
        case 'todos':
            query = 'SELECT * FROM atendimentos';
            break;
        case 'pessoasAtendidas':
            query = 'SELECT pe.*, at.* FROM pessoas pe INNER JOIN atendimentos at ON pe.idPessoa = at.atendidoAtendimento GROUP BY at.atendidoAtendimento;';
            break;
        case 'atendimentoPessoa':
            query = `SELECT * FROM pessoas pe INNER JOIN atendimentos at ON at.atendidoAtendimento = ${atendidoAtendimento} AND pe.idPessoa = at.atendidoAtendimento ORDER BY at.dataAtendimento DESC`;
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

    dataAtendimento = formatarDataHora(dataAtendimento);

    // Aplicar escape nas aspas simples e duplas nos valores de texto
    tituloAtendimento = tituloAtendimento.replace(/(['"])/g, "\\$1");
    anotacaoAtendimento = anotacaoAtendimento.replace(/(['"])/g, "\\$1");
    
    const query = `
    INSERT INTO atendimentos (atendenteAtendimento, atendidoAtendimento, tituloAtendimento, anotacaoAtendimento, dataAtendimento) 
    VALUES ('${atendenteAtendimento}', '${atendidoAtendimento}', '${tituloAtendimento}', '${anotacaoAtendimento}', '${dataAtendimento}')`;

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
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarAtendimentos, cadastrarAtendimento, deletarAtendimento, carregarAtendimento, atualizarAtendimento };