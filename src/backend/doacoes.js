const executarQuery = require('./consulta');
const { format } = require('date-fns');

async function listarDoacoes() {
    
    let query = 'SELECT * FROM doacoes';

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarDoacao(valorDoacao) {

    let dataAtual = new Date();
    dataAtual = format(dataAtual, 'yyyy-MM-dd');
    
    const query = `
    INSERT INTO doacoes (valorDoacao, dataDoacao) 
    VALUES ('${valorDoacao}', '${dataAtual}')`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarDoacao(idDoacao) {
    
    let query = `DELETE FROM doacoes WHERE idDoacao = ${idDoacao};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarDoacao(idDoacao) {
    
    let query = `SELECT * FROM doacoes WHERE idDoacao = ${idDoacao};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarDoacao(idDoacao, valorDoacao) {

    
    let query = `
        UPDATE doacoes SET doacoes = '${valorDoacao}' WHERE idDoacao = ${idDoacao};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarDoacoes, cadastrarDoacao, deletarDoacao, carregarDoacao, atualizarDoacao };