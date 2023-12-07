const executarQuery = require('./consulta');

async function listarPessoas(tipoPessoa) {
    
    let query = '';

    switch(tipoPessoa){
        case 'pastor':
            query = 'SELECT * FROM pastores pa, pessoas pe WHERE pa.pessoaId = pe.idPessoa';
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

async function cadastrarPessoa(nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa) {
    
    const query = `
    INSERT INTO pessoas (nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa) 
    VALUES ('${nomePessoa}', '${emailPessoa}', '${telefonePessoa}', '${estadoCivilPessoa}', '${dataNascimentoPessoa}')`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarPastor(pessoaId) {
    
    const query = `INSERT INTO pastores (pessoaId) VALUES (${pessoaId})`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarPessoas, cadastrarPessoa, cadastrarPastor };