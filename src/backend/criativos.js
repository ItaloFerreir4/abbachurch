const executarQuery = require('./consulta');

async function listarCriativos() {
    
    let query = 'SELECT * FROM criativos';

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarCriativo(tituloCriativo, imagemCriativo, linkCriativo) {

    // Aplicar escape nas aspas simples e duplas nos valores de texto
    tituloCriativo = tituloCriativo.replace(/(['"])/g, "\\$1");
    
    const query = `
    INSERT INTO criativos (tituloCriativo, imagemCriativo, linkCriativo, statusCriativo) 
    VALUES ('${tituloCriativo}', '${imagemCriativo}', '${linkCriativo}', 1)`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarCriativo(idCriativo) {
    
    let query = `DELETE FROM criativos WHERE idCriativo = ${idCriativo};`;

    try {
        const resultado = await executarQuery(query);
        return resultado ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarCriativo(idCriativo) {
    
    let query = `SELECT * FROM criativos WHERE idCriativo = ${idCriativo};`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarCriativo(idCriativo, tituloCriativo, imagemCriativo, linkCriativo) {

    // Aplicar escape nas aspas simples e duplas nos valores de texto
    tituloCriativo = tituloCriativo.replace(/(['"])/g, "\\$1");
    
    let query = `
        UPDATE criativos SET 
        tituloCriativo = '${tituloCriativo}', 
        imagemCriativo = '${imagemCriativo}', 
        linkCriativo = '${linkCriativo}'
        WHERE idCriativo = ${idCriativo};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarStatusCriativo(idCriativo, statusCriativo) {
    
    let query = `
        UPDATE criativos SET 
        statusCriativo = '${statusCriativo}'
        WHERE idCriativo = ${idCriativo};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarCriativos, cadastrarCriativo, deletarCriativo, carregarCriativo, atualizarCriativo, atualizarStatusCriativo };