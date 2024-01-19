const executarQuery = require('./consulta');
const { cadastrarUsuario } = require('./usuarios');
const { format } = require('date-fns');
const { enviarEmail } = require('./send-email');
const { gerarTokenConfirmacao } = require('./global');
const bcrypt = require('bcrypt');
const saltRounds = 12;

async function listarPessoas(tipoPessoa, pessoaId) {
    
    let query = '';

    switch(tipoPessoa){
        case 'todos':
            query = 'SELECT * FROM pessoas';
            break;
        case 'admin':
            query = 'SELECT * FROM pessoas pe, usuarios us WHERE us.tipoUsuario = 0 AND us.pessoaId = pe.idPessoa';
            break;
        case 'pastor':
            query = 'SELECT * FROM pastores pa, pessoas pe, usuarios us WHERE pa.pessoaId = pe.idPessoa AND us.pessoaId = pe.idPessoa';
            break;
        case 'lider':
            query = 'SELECT * FROM lideres li, pessoas pe, usuarios us WHERE li.pessoaId = pe.idPessoa AND us.pessoaId = pe.idPessoa';
            break;
        case 'filho':
            query = `SELECT * FROM filhos fi, pessoas pe WHERE fi.pastorId = ${pessoaId} AND fi.pessoaId = pe.idPessoa`;
            break;
        case 'voluntario':
            query = `SELECT * FROM voluntarios vo, pessoas pe, usuarios us WHERE vo.pessoaId = pe.idPessoa and us.pessoaId = pe.idPessoa`;
            break;
        case 'voluntarioAtivo':
            query = `SELECT * FROM voluntarios vo, pessoas pe WHERE vo.pessoaId = pe.idPessoa AND vo.statusVoluntario = 1`;
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

async function cadastrarPessoa(tipoPessoa, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, igrejaId) {

    let query_count = `SELECT * FROM pessoas WHERE emailPessoa = '${emailPessoa}'`;

    let count = await executarQuery(query_count);
    if(count.length > 0){
        return null;
    }
    
    let date = new Date();
    date = format(date, 'yyyy-MM-dd');

    let query = `
    INSERT INTO pessoas (fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, dataEntradaPessoa) 
    VALUES ('${fotoPessoa}', '${nomePessoa}', '${emailPessoa}', '${telefonePessoa}', '${estadoCivilPessoa}', '${dataNascimentoPessoa}', '${profissaoPessoa}', '${escolaridadePessoa}', '${idiomaPessoa}', '${nacionalidadePessoa}', '${date}')`;

    try {
        let pessoa = await executarQuery(query);

        let pessoaId = pessoa.insertId;

        switch(tipoPessoa){
            case 'pastor':
                let pastor = await cadastrarPastor(pessoaId, igrejaId);
                let esposa = await cadastrarPessoa('esposa', '', '', '', '', '', '', '', '', '', '');
                await cadastrarEsposa(esposa.insertId, pastor.insertId);
                await cadastrarUsuario(pessoaId, senhaUsuario, tipoPessoa);
            break;
            case 'lider':
                await cadastrarLider(pessoaId);
                await cadastrarUsuario(pessoaId, senhaUsuario, tipoPessoa);
            break;
            case 'admin':
                await cadastrarUsuario(pessoaId, senhaUsuario, tipoPessoa);
            break;
        }

        await cadastrarRedes(pessoaId, instagram, facebook, linkedin);

        return pessoa;
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
                            await executarQuery(query);

                            query = `DELETE FROM filhos WHERE pastorId = ${idPastor};`;
                            await executarQuery(query);

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
                case 'lider':
                    query = `SELECT * FROM lideres WHERE pessoaId = ${pessoaId};`

                    const lider = await executarQuery(query);

                    if(lider){

                        return true;

                    }
                    else{
                        return null;
                    }

                break;
                case 'filho':
                    query = `DELETE FROM filhos WHERE pessoaId = ${pessoaId};`;
                    return await executarQuery(query) ?  true :  null;
                break;
                case 'voluntario':
                    query = `DELETE FROM voluntarios WHERE pessoaId = ${pessoaId};`;
                    return await executarQuery(query) ?  true :  null;
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

async function carregarPessoa(idPessoa, tipoPessoa) {
    
    let query = '';

    switch(tipoPessoa){
        case 'perfil':
            query = `SELECT * FROM pessoas pe, redessociais re WHERE pe.idPessoa = ${idPessoa} AND re.pessoaId = pe.idPessoa;`;
            break;
        case 'pastor':
            query = `SELECT * FROM pastores pa, pessoas pe, redessociais re, usuarios u WHERE pa.pessoaId = pe.idPessoa AND pe.idPessoa = ${idPessoa} AND re.pessoaId = pe.idPessoa AND u.pessoaId = pe.idPessoa`;
            break;
        case 'lider':
            query = `SELECT * FROM lideres li, pessoas pe, redessociais re, usuarios u WHERE li.pessoaId = pe.idPessoa AND pe.idPessoa = ${idPessoa} AND re.pessoaId = pe.idPessoa AND u.pessoaId = pe.idPessoa`;
        break;
        case 'esposa':
            query = `SELECT es.*, pe.*, re.* FROM esposas es, pastores pa, pessoas pe, redessociais re WHERE pa.pessoaId = ${idPessoa} AND es.pessoaId = pe.idPessoa AND es.pastorId = pa.idPastor AND re.pessoaId = pe.idPessoa;`;
            break;
        case 'filho':
            query = `SELECT * FROM filhos fi, pessoas pe, redessociais re WHERE fi.pessoaId = ${idPessoa} AND fi.pessoaId = pe.idPessoa AND re.pessoaId = pe.idPessoa;`;
            break;
        case 'voluntario':
            query = `SELECT * FROM voluntarios vo, pessoas pe, redessociais re WHERE vo.pessoaId = ${idPessoa} AND vo.pessoaId = pe.idPessoa AND re.pessoaId = pe.idPessoa;`;
            break;
        case 'voluntarioId':
            query = `SELECT * FROM voluntarios vo, pessoas pe, redessociais re WHERE vo.idVoluntario = ${idPessoa} AND vo.pessoaId = pe.idPessoa AND re.pessoaId = pe.idPessoa;`;
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

async function atualizarPessoa(idPessoa, tipoPessoa, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, changeAccess, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, igrejaId) {
    
    let query = `
        UPDATE pessoas
        SET fotoPessoa = '${fotoPessoa}', nomePessoa = '${nomePessoa}', telefonePessoa = '${telefonePessoa}', estadoCivilPessoa = '${estadoCivilPessoa}', dataNascimentoPessoa = '${dataNascimentoPessoa}', profissaoPessoa = '${profissaoPessoa}', escolaridadePessoa = '${escolaridadePessoa}', idiomaPessoa = '${idiomaPessoa}', nacionalidadePessoa = '${nacionalidadePessoa}'
        WHERE idPessoa = ${idPessoa};
        `;
        
    try {
        const resultados = await executarQuery(query);

        query = `
        UPDATE redessociais
        SET instagram = '${instagram}', facebook = '${facebook}', linkedin = '${linkedin}'
        WHERE pessoaId = ${idPessoa};
        `;

        await executarQuery(query);
        
        if(changeAccess == 1){

            query = `
            UPDATE pessoas
            SET emailPessoa = '${emailPessoa}'
            WHERE idPessoa = ${idPessoa};
            `;

            await executarQuery(query);

            if(senhaUsuario != '' || senhaUsuario != null || senhaUsuario != undefined || senhaUsuario != 'undefined'){

                const salt = await bcrypt.genSalt(saltRounds);
                const hashSenha = await bcrypt.hash(senhaUsuario, salt);

                query = `
                UPDATE usuarios
                SET senhaUsuario = '${hashSenha}'
                WHERE pessoaId = ${idPessoa};
                `;

                await executarQuery(query);

            }
        }

        switch(tipoPessoa){
            case 'pastor':
                query = `
                UPDATE pastores
                SET igrejaId = '${igrejaId}'
                WHERE pessoaId = ${idPessoa};
                `;
                await executarQuery(query);
                break;
        }

        if(resultados){
            return true;
        }
        else{
            return null;
        }
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarVoluntario(pessoaId, pastorId, categoriasVoluntario) {
    
    let query = `
        UPDATE voluntarios
        SET pastorId = '${pastorId}', categoriasVoluntario = '${categoriasVoluntario}'
        WHERE pessoaId = ${pessoaId};
        `;
        
    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarStatusVoluntario(pessoaId, statusVoluntario) {
    
    let query = `
        UPDATE usuarios
        SET statusUsuario = '${statusVoluntario}'
        WHERE pessoaId = ${pessoaId};
        `;
        
    try {
        const resultados = await executarQuery(query);

        if(resultados){

            query = `SELECT * FROM pessoas WHERE idPessoa = ${pessoaId}`;

            const voluntario = await executarQuery(query);
            const destinatario = voluntario[0].emailPessoa;
            const assunto = 'Alteração no status!';
            const corpo = statusVoluntario == 1 ? 'O seu status foi alterado para "ativo"! \n\n Qualquer dúvida entre em contato com a igreja Abba Church.' : 'O seu status foi alterado para "inativo"! \n\n Qualquer dúvida entre em contato com a igreja Abba Church.';
            enviarEmail(destinatario, assunto, corpo);
        }

        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarPastor(pessoaId, igrejaId) {
    
    const query = `INSERT INTO pastores (pessoaId, igrejaId) VALUES (${pessoaId}, ${igrejaId})`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarLider(pessoaId) {
    
    const query = `INSERT INTO lideres (pessoaId) VALUES (${pessoaId})`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarEsposa(pessoaId, pastorId) {
    
    const query = `INSERT INTO esposas (pessoaId, pastorId) VALUES (${pessoaId}, ${pastorId})`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarFilho(pessoaId, pastorId) {
    
    const query = `INSERT INTO filhos (pessoaId, pastorId) VALUES (${pessoaId}, ${pastorId})`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarVoluntario(pessoaId, pastorId, categoriasVoluntario, emailPessoa, nomePessoa, senhaUsuario) {
    
    const query = `INSERT INTO voluntarios (pessoaId, pastorId, categoriasVoluntario) VALUES (${pessoaId}, ${pastorId}, '${categoriasVoluntario}')`;

    try {

        await cadastrarUsuario(pessoaId, senhaUsuario, 'voluntario');
        
        const resultados = await executarQuery(query);

        token = gerarTokenConfirmacao(pessoaId, emailPessoa);

        const destinatario = emailPessoa;
        const assunto = 'Confirmação de cadastro';
        const corpo = `Olá, ${nomePessoa}! \n\nVocê foi cadastrado no sistema Abba Church. \n\nPara confirmar seu cadastro, clique no link abaixo: \n\nhttp://localhost:1111/confirmar-email?t=${token}`;

        enviarEmail(destinatario, assunto, corpo);

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

module.exports = { listarPessoas, cadastrarPessoa, cadastrarFilho, cadastrarVoluntario, deletarPessoa, carregarPessoa, atualizarPessoa, atualizarVoluntario, atualizarStatusVoluntario };