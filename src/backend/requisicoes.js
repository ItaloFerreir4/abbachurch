const executarQuery = require('./consulta');
const { format } = require('date-fns');
const { enviarEmail } = require('./send-email');

async function listarRequisicoes(idUserLog, tipoUserLog) {
    
    let query = tipoUserLog == 0 ? 'SELECT * FROM requisicoes' : `SELECT * FROM requisicoes WHERE pessoaId = ${idUserLog}`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarRequisicao(pessoaId, tipoUsuario, classificacaoRequisicao, informacoesRequisicao, statusRequisicao) {
    
    let dataRequisicao = new Date();
    dataRequisicao = format(dataRequisicao, 'yyyy-MM-dd');

    let query = `
    INSERT INTO requisicoes (pessoaId, tipoUsuario, classificacaoRequisicao, informacoesRequisicao, statusRequisicao, dataRequisicao) 
    VALUES ('${pessoaId}', '${tipoUsuario}', '${classificacaoRequisicao}', '${informacoesRequisicao}', '${statusRequisicao}', '${dataRequisicao}')`;

    try {
        const resultado = await executarQuery(query);

        if(resultado){
            query = `SELECT * FROM pessoas pe, usuarios us WHERE us.tipoUsuario = 0 AND us.pessoaId = pe.idPessoa`; 
            const admins = await executarQuery(query);
            query = `SELECT * FROM pessoas WHERE pessoaId = ${pessoaId}`; 
            const quem = await executarQuery(query);
            const assunto = 'Cadastro de requisição!';
            const corpo = `<p>Uma requisição foi cadastrada!</p>
            <p><strong>Quem cadastrou:</strong> ${quem[0].nomePessoa}<p>
            <p><strong>Informações:</strong> ${informacoesRequisicao}<p>
            <p>Acesse <a href="abbachurch.app" title="Painel Abba Church">abbachurch.app</a><p>
            <p>Qualquer dúvida entre em contato com a Abba Church.</p>`;

            if(classificacaoRequisicao == 'Criativo'){
                const destinatario = "creative@abbachurch.us";
                enviarEmail(destinatario, assunto, corpo);
            }
            else{
                admins.forEach(admin => {
                    const destinatario = admin.emailPessoa;
                    enviarEmail(destinatario, assunto, corpo);
                });
            }
        }

        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarRequisicao(idRequisicao) {
    
    let query = `DELETE FROM requisicoes WHERE idRequisicao = ${idRequisicao};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarRequisicao(idRequisicao) {
    
    let query = `SELECT * FROM requisicoes WHERE idRequisicao = ${idRequisicao};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarRequisicao(pessoaId, idRequisicao, classificacaoRequisicao, informacoesRequisicao) {
    
    let query = `
        UPDATE requisicoes SET classificacaoRequisicao = '${classificacaoRequisicao}', informacoesRequisicao = '${informacoesRequisicao}' WHERE idRequisicao = ${idRequisicao};`;
        
    try {
        const resultados = await executarQuery(query);
        
        if(resultados){
            query = `SELECT * FROM pessoas pe, usuarios us WHERE us.tipoUsuario = 0 AND us.pessoaId = pe.idPessoa`; 
            const admins = await executarQuery(query);
            query = `SELECT * FROM pessoas WHERE pessoaId = ${pessoaId}`; 
            const quem = await executarQuery(query);
            const assunto = 'Cadastro de requisição!';
            const corpo = `<p>Uma requisição foi atualizada!</p>
            <p><strong>Quem atualizou:</strong> ${quem[0].nomePessoa}<p>
            <p><strong>Informações:</strong> ${informacoesRequisicao}<p>
            <p>Acesse <a href="abbachurch.app" title="Painel Abba Church">abbachurch.app</a><p>
            <p>Qualquer dúvida entre em contato com a Abba Church.</p>`;

            if(classificacaoRequisicao == 'Criativo'){
                const destinatario = "creative@abbachurch.us";
                enviarEmail(destinatario, assunto, corpo);
            }
            else{
                admins.forEach(admin => {
                    const destinatario = admin.emailPessoa;
                    enviarEmail(destinatario, assunto, corpo);
                });
            }
        }

        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarStatusRequisicao(idRequisicao, statusRequisicao) {
    
    let query = `
        UPDATE requisicoes SET statusRequisicao = '${statusRequisicao}' WHERE idRequisicao = ${idRequisicao};`;
        
    try {
        const resultados = await executarQuery(query);

        if(resultados){
            query = `SELECT * FROM requisicoes WHERE idRequisicao = ${idRequisicao}`;
            const reqPessoa = await executarQuery(query);
            query = `SELECT * FROM pessoas WHERE idPessoa = ${reqPessoa[0].pessoaId}`; 
            const pessoa = await executarQuery(query);
            const destinatario = pessoa[0].emailPessoa;
            const assunto = 'Alteração no status na requisição!';
            let status = statusVoluntario == 1 ? 'ativo' : 'inativo';
            let corpo = `<p>O status do sua requisição foi alterada para <b>${status}</b>!</p>
            <p>Qualquer dúvida entre em contato com a Abba Church.</p>`;
            enviarEmail(destinatario, assunto, corpo);
        }

        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarRequisicoes, cadastrarRequisicao, deletarRequisicao, carregarRequisicao, atualizarRequisicao, atualizarStatusRequisicao };