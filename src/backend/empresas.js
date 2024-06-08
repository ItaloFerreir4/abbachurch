const executarQuery = require('./consulta');
const { cadastrarRedes } = require('./pessoas');

async function listarEmpresas(tipo) {

    let query = '';
    
    switch(tipo){
        case 'normal':
            query = 'SELECT * FROM empresas';
        break;
        case 'redes':
            query = 'SELECT * FROM empresas em, redessociais re WHERE re.pessoaId = em.idEmpresa';
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

async function cadastrarEmpresa(nomeImagem, nomeEmpresa, nomeEmpresarioEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, enderecoEmpresa, segmentoEmpresa, iframeMapaEmpresa, instagram, facebook, linkedin) {

    // Aplicar escape nas aspas simples e duplas nos valores de texto
    nomeEmpresa = nomeEmpresa.replace(/(['"])/g, "\\$1");
    
    const query = `
    INSERT INTO empresas (imagemEmpresa, nomeEmpresa, nomeEmpresarioEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, enderecoEmpresa, segmentoEmpresa, iframeMapaEmpresa) 
    VALUES ('${nomeImagem}', '${nomeEmpresa}', '${nomeEmpresarioEmpresa}', '${telefoneEmpresa}', '${emailEmpresa}','${ siteEmpresa}', '${enderecoEmpresa}', '${segmentoEmpresa}',  '${iframeMapaEmpresa}')`;

    try {
        const resultado = await executarQuery(query);

        if(resultado){
            let idEmpresa = resultado.insertId;
            await cadastrarRedes(idEmpresa, instagram, facebook, linkedin);
        }

        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarEmpresa(idEmpresa) {
    
    let query = `DELETE FROM empresas WHERE idEmpresa = ${idEmpresa};`;

    try {
        const resultado = await executarQuery(query);
        return resultado ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarEmpresa(idEmpresa) {
    
    let query = `SELECT * FROM empresas em, redessociais re WHERE em.idEmpresa = ${idEmpresa} AND re.pessoaId = em.idEmpresa;`;

    try {
        const resultado = await executarQuery(query);
        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarEmpresa(idEmpresa, nomeImagem, nomeEmpresa, nomeEmpresarioEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, enderecoEmpresa, segmentoEmpresa, iframeMapaEmpresa, instagram, facebook, linkedin) {

    // Aplicar escape nas aspas simples e duplas nos valores de texto
    nomeEmpresa = nomeEmpresa.replace(/(['"])/g, "\\$1");
    
    let query = `
        UPDATE empresas SET 
        imagemEmpresa = '${nomeImagem}',
        nomeEmpresa = '${nomeEmpresa}',
        nomeEmpresarioEmpresa = '${nomeEmpresarioEmpresa}',
        telefoneEmpresa = '${telefoneEmpresa}',
        emailEmpresa = '${emailEmpresa}',
        siteEmpresa = '${siteEmpresa}',
        enderecoEmpresa = '${enderecoEmpresa}',
        segmentoEmpresa = '${segmentoEmpresa}',
        iframeMapaEmpresa = '${iframeMapaEmpresa}'
        WHERE idEmpresa = ${idEmpresa};`;
        
    try {
        const resultados = await executarQuery(query);

        if(resultados){
            query = `
            UPDATE redessociais
            SET instagram = '${instagram}', facebook = '${facebook}', linkedin = '${linkedin}'
            WHERE pessoaId = ${idEmpresa};
            `;
            
            await executarQuery(query);
        }

        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarEmpresas, cadastrarEmpresa, deletarEmpresa, carregarEmpresa, atualizarEmpresa };