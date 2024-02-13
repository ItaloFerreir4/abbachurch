const executarQuery = require('./consulta');

async function listarCategoriasRelatorio() {
    
    let query = 'SELECT * FROM categoriasRelatorio';

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarCategoriaRelatorio(nomeCategoriaRelatorio) {

    let query = `
    SELECT * FROM categoriasRelatorio WHERE nomeCategoriaRelatorio = '${nomeCategoriaRelatorio}'
    `;

    const categoria = await executarQuery(query);

    if(categoria && categoria.length > 0){
        return 'Existe';
    }
    
    query = `
    INSERT INTO categoriasRelatorio (nomeCategoriaRelatorio) 
    VALUES ('${nomeCategoriaRelatorio}')`;

    try {
        const resultado = await executarQuery(query);

        return 'Cadastrado';
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarCategoriaRelatorio(idCategoriaRelatorio) {
    
    let query = `DELETE FROM categoriasRelatorio WHERE idCategoriaRelatorio = ${idCategoriaRelatorio};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarCategoriaRelatorio(idCategoriaRelatorio) {
    
    let query = `SELECT * FROM categoriasRelatorio WHERE idCategoriaRelatorio = ${idCategoriaRelatorio};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarCategoriaRelatorio(idCategoriaRelatorio, nomeCategoriaRelatorio) {
    
    let query = `
        UPDATE categoriasRelatorio SET nomeCategoriaRelatorio = '${nomeCategoriaRelatorio}' WHERE idCategoriaRelatorio = ${idCategoriaRelatorio};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarWidgetRelatorio(idCategoriaRelatorio, widgetRelatorio) {
    
    let query = `
        UPDATE categoriasRelatorio SET 
        widgetRelatorio = '${widgetRelatorio}'
        WHERE idCategoriaRelatorio = ${idCategoriaRelatorio};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarCategoriasRelatorio, cadastrarCategoriaRelatorio, deletarCategoriaRelatorio, carregarCategoriaRelatorio, atualizarCategoriaRelatorio, atualizarWidgetRelatorio };