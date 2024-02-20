require('dotenv').config();
const executarQuery = require('./consulta');
const { cadastrarUsuario } = require('./usuarios');
const { format } = require('date-fns');
const { enviarEmail } = require('./send-email');
const { gerarTokenConfirmacao } = require('./global');
const bcrypt = require('bcrypt');
const saltRounds = 12;

async function listarPessoas(idUserLog, tipoUserLog, tipoPessoa, pessoaId) {
    
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
            // if(tipoUserLog == 0){
                query = `SELECT * FROM voluntarios vo, pessoas pe, usuarios us WHERE vo.pessoaId = pe.idPessoa and us.pessoaId = pe.idPessoa ORDER BY pe.idPessoa DESC`;
            // }
            // else{
            //     query = `SELECT * FROM voluntarios vo, pessoas pe, usuarios us WHERE vo.pastorId = ${idUserLog} AND vo.pessoaId = pe.idPessoa and us.pessoaId = pe.idPessoa`;
            // }
            break;
        case 'voluntarioAtivo':
            query = `SELECT * FROM voluntarios vo, pessoas pe, usuarios us WHERE vo.pessoaId = pe.idPessoa AND us.pessoaId = pe.idPessoa AND us.statusUsuario = 1`;
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

async function alterarAdminPastor(pessoaId, tipoUsuario) {

    let userType = tipoUsuario == 'adminpastor' ? 5 : 1;
        
    let query = `UPDATE usuarios SET tipoUsuario = ${userType} WHERE pessoaId = ${pessoaId};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
    
}

async function cadastrarPessoa(tipoPessoa, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, generoPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, igrejaId) {

    if (tipoPessoa != 'conjuge'){
        let query_count = `SELECT * FROM pessoas WHERE emailPessoa = '${emailPessoa}'`;

        let count = await executarQuery(query_count);
        if(count.length > 0){
            return null;
        }
    }
    
    let date = new Date();
    date = format(date, 'yyyy-MM-dd');

    let query = `
    INSERT INTO pessoas (fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, generoPessoa, dataNascimentoPessoa, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, dataEntradaPessoa) 
    VALUES ('${fotoPessoa}', '${nomePessoa}', '${emailPessoa}', '${telefonePessoa}', '${estadoCivilPessoa}', '${generoPessoa}', '${dataNascimentoPessoa}', '${profissaoPessoa}', '${escolaridadePessoa}', '${idiomaPessoa}', '${nacionalidadePessoa}', '${date}')`;

    try {
        let pessoa = await executarQuery(query);

        let pessoaId = pessoa.insertId;

        switch(tipoPessoa){
            case 'pastor':
                let pastor = await cadastrarPastor(pessoaId, igrejaId);
                let conjuge = await cadastrarPessoa('conjuge', '', '', '', '', '', '', '2000-01-01', '', '', '', '', '', '', '', '', '');
                await cadastrarConjuge(conjuge.insertId, pastor.insertId);
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

        query = `DELETE FROM usuarios WHERE pessoaId = ${pessoaId};`;
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

                            query = `DELETE FROM conjuge WHERE pastorId = ${idPastor};`;
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
                    query = `DELETE FROM lideres WHERE pessoaId = ${pessoaId};`
                    return await executarQuery(query) ?  true :  null;

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
        case 'conjuge':
            query = `SELECT c.*, pe.*, re.* FROM conjuge c, pastores pa, pessoas pe, redessociais re WHERE pa.pessoaId = ${idPessoa} AND c.pessoaId = pe.idPessoa AND c.pastorId = pa.idPastor AND re.pessoaId = pe.idPessoa;`;
            break;
        case 'filho':
            query = `SELECT * FROM filhos fi, pessoas pe, redessociais re WHERE fi.pessoaId = ${idPessoa} AND fi.pessoaId = pe.idPessoa AND re.pessoaId = pe.idPessoa;`;
            break;
        case 'voluntario':
            query = `SELECT * FROM voluntarios vo, pessoas pe, redessociais re, usuarios u WHERE vo.pessoaId = ${idPessoa} AND vo.pessoaId = pe.idPessoa AND re.pessoaId = pe.idPessoa AND u.pessoaId = pe.idPessoa;`;
            break;
        case 'voluntarioId':
            query = `SELECT * FROM voluntarios vo, pessoas pe, redessociais re WHERE vo.idVoluntario = ${idPessoa} AND vo.pessoaId = pe.idPessoa AND re.pessoaId = pe.idPessoa;`;
            break;
        case 'admin':
            query = `SELECT * FROM usuarios us, pessoas pe, redessociais re WHERE us.pessoaId = ${idPessoa} AND us.pessoaId = pe.idPessoa AND re.pessoaId = pe.idPessoa;`;
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

async function atualizarPessoa(idPessoa, tipoPessoa, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, generoPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, changeAccess, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, igrejaId) {

    //verificar se o email já existe
    let query_count = `SELECT * FROM pessoas WHERE emailPessoa = '${emailPessoa}' AND idPessoa != ${idPessoa}`;
    let count = await executarQuery(query_count);
    if(count.length > 0){
        return null;
    }
    
    let query = `
        UPDATE pessoas
        SET fotoPessoa = '${fotoPessoa}', nomePessoa = '${nomePessoa}', telefonePessoa = '${telefonePessoa}', estadoCivilPessoa = '${estadoCivilPessoa}', generoPessoa = '${generoPessoa}', dataNascimentoPessoa = '${dataNascimentoPessoa}', profissaoPessoa = '${profissaoPessoa}', escolaridadePessoa = '${escolaridadePessoa}', idiomaPessoa = '${idiomaPessoa}', nacionalidadePessoa = '${nacionalidadePessoa}'
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
            return false;
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
            let status = statusVoluntario == 1 ? 'ativo' : 'inativo';
            let corpo = `<p>O seu status foi alterado para <b>${status}</b>!</p>
            <p>Qualquer dúvida entre em contato com a igreja Abba Church.</p>`;
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

async function cadastrarConjuge(pessoaId, pastorId) {
    
    const query = `INSERT INTO conjuge (pessoaId, pastorId) VALUES (${pessoaId}, ${pastorId})`;

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
        let baseUrl = process.env.BASE_URL;

        const destinatario = emailPessoa;
        const assunto = 'Confirmação de cadastro';
        const corpo = `<p>Olá, <b>${nomePessoa}</b>!</p>
        <p>Você foi cadastrado no sistema Abba Church.</p>
        <p>Para <b>confirmar seu cadastro</b>, clique no link abaixo:</p> 
        <p><a href="${baseUrl}/confirmar-email?t=${token}">${baseUrl}/confirmar-email?t=${token}</a></p>`;

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

async function deletarLider(pessoaId) {
    
    let query = `DELETE FROM lideres WHERE pessoaId = ${pessoaId};`;

    try {
        const resultados = await executarQuery(query);

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

async function isLider(pessoaId, tipo) {
        
    let query = `UPDATE pastores SET isLider = ${tipo} WHERE pessoaId = ${pessoaId};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
    
}

module.exports = { listarPessoas, cadastrarPessoa, cadastrarFilho, cadastrarVoluntario, deletarPessoa, carregarPessoa, atualizarPessoa, atualizarVoluntario, atualizarStatusVoluntario, alterarAdminPastor, cadastrarLider, deletarLider, isLider };