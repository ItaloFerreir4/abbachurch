const executarQuery = require('./consulta');
const { formatarDataHora } = require('./formata-data');

async function listarRelatorios(tipoLista) {
    
    let query = ''

    switch(tipoLista){
        case 'todosRelatorios':
            query = 'SELECT * FROM relatorios re, categoriasRelatorio catRe WHERE re.categoriaRelatorioId = catRe.idCategoriaRelatorio';
            break;
        case 'totalUltimoRelatorio':
            query = 'SELECT re.*, cat.nomeCategoriaRelatorio FROM relatorios re, categoriasRelatorio cat WHERE re.categoriaRelatorioId = cat.idCategoriaRelatorio AND (re.categoriaRelatorioId, re.dataHoraRelatorio) IN ( SELECT categoriaRelatorioId, MAX(dataHoraRelatorio) AS maxDataHoraRelatorio FROM relatorios GROUP BY categoriaRelatorioId ) ORDER BY re.dataHoraRelatorio DESC';
    }

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarRelatorio(categoriaRelatorioId, dataHoraRelatorio, quantidadeRelatorio) {

    let dataHora = formatarDataHora(dataHoraRelatorio);
    
    const query = `
    INSERT INTO relatorios (categoriaRelatorioId, dataHoraRelatorio, quantidadeRelatorio) 
    VALUES ('${categoriaRelatorioId}', '${dataHora}', '${quantidadeRelatorio}')`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarRelatorio(idRelatorio) {
    
    let query = `DELETE FROM relatorios WHERE idRelatorio = ${idRelatorio};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarRelatorio(idRelatorio) {
    
    let query = `SELECT * FROM relatorios WHERE idRelatorio = ${idRelatorio};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarRelatorio(idRelatorio, categoriaRelatorioId, dataHoraRelatorio, quantidadeRelatorio) {
    
    let dataHora = formatarDataHora(dataHoraRelatorio);

    let query = `
        UPDATE relatorios SET categoriaRelatorioId = '${categoriaRelatorioId}', dataHoraRelatorio = '${dataHora}', quantidadeRelatorio = '${quantidadeRelatorio}' WHERE idRelatorio = ${idRelatorio};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarWidgetRelatorio(idRelatorio, widgetRelatorio) {
    
    let query = `
        UPDATE relatorios SET 
        widgetRelatorio = '${widgetRelatorio}'
        WHERE idRelatorio = ${idRelatorio};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarRelatorios, cadastrarRelatorio, deletarRelatorio, carregarRelatorio, atualizarRelatorio, atualizarWidgetRelatorio };