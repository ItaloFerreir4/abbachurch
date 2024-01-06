const executarQuery = require('./consulta');

async function listarCategorias() {
    
    let query = 'SELECT * FROM categorias';

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarCategoria(nomeCategoria) {
    
    const query = `
    INSERT INTO categorias (nomeCategoria) 
    VALUES ('${nomeCategoria}')`;

    try {
        const categoria = await executarQuery(query);
        return categoria;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarCategoria(idCategoria) {
    
    let query = `DELETE FROM categorias WHERE idCategoria = ${idCategoria};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarCategoria(idCategoria) {
    
    let query = `SELECT * FROM categorias WHERE idCategoria = ${idCategoria};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarCategoria(idCategoria, nomeCategoria) {
    
    let query = `
        UPDATE categorias SET nomeCategoria = '${nomeCategoria}' WHERE idCategoria = ${idCategoria};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarCategorias, cadastrarCategoria, deletarCategoria, carregarCategoria, atualizarCategoria };