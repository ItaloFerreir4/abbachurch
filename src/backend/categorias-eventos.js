const executarQuery = require('./consulta');

async function listarCategoriasEventos() {
    
    let query = 'SELECT * FROM categoriasEventos';

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarCategoriaEvento(nomeCategoriaEvento) {
    
    const query = `
    INSERT INTO categoriasEventos (nomeCategoriaEvento) 
    VALUES ('${nomeCategoriaEvento}')`;

    try {
        const categoria = await executarQuery(query);
        return categoria;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarCategoriaEvento(idCategoriaEvento) {
    
    let query = `DELETE FROM categoriasEventos WHERE idCategoriaEvento = ${idCategoriaEvento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarCategoriaEvento(idCategoriaEvento) {
    
    let query = `SELECT * FROM categoriasEventos WHERE idCategoriaEvento = ${idCategoriaEvento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarCategoriaEvento(idCategoriaEvento, nomeCategoriaEvento) {
    
    let query = `
        UPDATE categoriasEventos SET nomeCategoriaEvento = '${nomeCategoriaEvento}' WHERE idCategoriaEvento = ${idCategoriaEvento};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarCategoriasEventos, cadastrarCategoriaEvento, deletarCategoriaEvento, carregarCategoriaEvento, atualizarCategoriaEvento };