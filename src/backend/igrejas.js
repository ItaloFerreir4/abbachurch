const executarQuery = require('./consulta');

async function listarIgrejas() {
    
    let query = 'SELECT * FROM igrejas';

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarIgreja(nomeIgreja, paisIgreja, estadoIgreja, enderecoIgreja, cepIgreja, telefoneIgreja, emailIgreja, tipoIgreja, matrizId) {
    
    matrizId = matrizId ? matrizId : 0;

    const query = `
    INSERT INTO igrejas (nomeIgreja, paisIgreja, estadoIgreja, enderecoIgreja, cepIgreja, telefoneIgreja, emailIgreja, tipoIgreja, matrizId) 
    VALUES ('${nomeIgreja}', '${paisIgreja}', '${estadoIgreja}', '${enderecoIgreja}', '${cepIgreja}', '${telefoneIgreja}', '${emailIgreja}', ${tipoIgreja}, ${matrizId})`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarIgreja(idIgreja) {
    
    let query = `DELETE FROM igrejas WHERE idIgreja = ${idIgreja};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarIgreja(idIgreja) {
    
    let query = `SELECT * FROM igrejas WHERE idIgreja = ${idIgreja};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarIgreja(idIgreja, nomeIgreja, paisIgreja, estadoIgreja, enderecoIgreja, cepIgreja, telefoneIgreja, emailIgreja, tipoIgreja, matrizId) {
    
    matrizId = matrizId ? matrizId : 0;
    
    let query = `
        UPDATE igrejas SET nomeIgreja = '${nomeIgreja}', paisIgreja = '${paisIgreja}', estadoIgreja = '${estadoIgreja}', enderecoIgreja = '${enderecoIgreja}', cepIgreja = '${cepIgreja}', telefoneIgreja = '${telefoneIgreja}', emailIgreja = '${emailIgreja}', tipoIgreja = ${tipoIgreja}, matrizId = ${matrizId} WHERE idIgreja = ${idIgreja};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarIgrejas, cadastrarIgreja, deletarIgreja, carregarIgreja, atualizarIgreja };