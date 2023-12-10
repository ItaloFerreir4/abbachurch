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

async function cadastrarRedes(pessoaId, instagram, facebook, linkedin) {
    
    const query = `INSERT INTO redessociais (pessoaId, instagram, facebook, linkedin) VALUES ('${pessoaId}', '${instagram}', '${facebook}', '${linkedin}')`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarPessoa(pessoaId, tipoPessoa) {
    
    let query = `DELETE FROM pessoas WHERE idPessoa = ${pessoaId};`;

    try {
        const resultados = await executarQuery(query);

        query = `DELETE FROM redessociais WHERE pessoaId = ${pessoaId};`;
        await executarQuery(query);

        if(resultados){
            switch(tipoPessoa){
                case 'pastor':
                    query = `SELECT * FROM pastores WHERE pessoaId = ${pessoaId};`

                    const pastor = await executarQuery(query);

                    if(pastor){

                        const idPastor = pastor[0].idPastor;

                        query = `DELETE FROM pastores WHERE idPastor = ${idPastor};`;

                        if(await executarQuery(query)){

                            query = `DELETE FROM esposas WHERE pastorId = ${idPastor};`;
                            await executarQuery(query)

                            query = `DELETE FROM filhos WHERE pastorId = ${idPastor};`;
                            await executarQuery(query)

                            return true;

                        }
                        else{
                            return null;
                        }

                    }
                    else{
                        return null;
                    }

                break;
            }
        }
        else{
            return null;
        }
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarPessoas, cadastrarPessoa, cadastrarPastor, cadastrarRedes, deletarPessoa };