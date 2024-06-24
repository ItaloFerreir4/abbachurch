const executarQuery = require('./consulta');

async function listarPermissoes(tipoListagem, pessoaId) {
    
    let query = '';

    switch(tipoListagem){
        case 'pessoa':
            query = `SELECT * FROM permissoes WHERE pessoaId = ${pessoaId}`;
            break;
    }

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarPermissao(pessoaId, nomePermissao) {
    
    const query = `
    INSERT INTO permissoes (pessoaId, nomePermissao) 
    VALUES (${pessoaId},'${nomePermissao}')`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarPermissao(pessoaId, nomePermissao) {
    
    let query = `DELETE FROM permissoes WHERE pessoaId = ${pessoaId} AND nomePermissao = '${nomePermissao}';`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarPermissao(pessoaId, nomePermissao, valorPermissao) {

    let resultados = '';

    try {
        if(valorPermissao == 'adicionar'){
            resultados = await cadastrarPermissao(pessoaId, nomePermissao);
        }
        else{
            resultados = await deletarPermissao(pessoaId, nomePermissao);
        }

        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function verificarPermissoes(pessoaId, roles) {
    
    let userRoles = [];

    try {
        permissoes = await listarPermissoes('pessoa', pessoaId);
        userRoles = permissoes.map(permissao => permissao.nomePermissao);
        const haPermissao = roles.some(role => userRoles.includes(role));

        return haPermissao;
        
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarPermissoes, cadastrarPermissao, deletarPermissao, atualizarPermissao, verificarPermissoes };