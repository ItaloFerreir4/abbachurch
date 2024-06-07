const executarQuery = require('./consulta');

async function cadastrarEmpresario(pessoaId, pastorId, habilidadesEmpresario) {
    
    const query = `
    INSERT INTO empresarios (pessoaId, pastorId, habilidadesEmpresario) 
    VALUES ('${pessoaId}', '${pastorId}', '${habilidadesEmpresario}')`;

    try {
        const resultado = await executarQuery(query);

        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarEmpresario(pessoaId) {
    
    let query = `DELETE FROM empresarios WHERE pessoaId = ${pessoaId};`;

    try {
        const resultado = await executarQuery(query);
        return resultado ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarEmpresario(pessoaId, pastorId, habilidadesEmpresario) {
    
    let query = `
        UPDATE empresarios SET 
        pastorId = '${pastorId}', 
        habilidadesEmpresario = '${habilidadesEmpresario}'
        WHERE pessoaId = ${pessoaId};`;
        
    try {
        const resultados = await executarQuery(query);

        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { cadastrarEmpresario, deletarEmpresario, atualizarEmpresario };