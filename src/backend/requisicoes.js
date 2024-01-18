const executarQuery = require('./consulta');
const { format } = require('date-fns');
const { enviarEmail } = require('./send-email');

async function listarRequisicoes() {
    
    let query = 'SELECT * FROM requisicoes';

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
            const assunto = 'Cadastro de requisição!';
            const corpo = 'Uma requisição foi cadastrada! \n\n Qualquer dúvida entre em contato com a Abba Church.';
            admins.forEach(admin => {
                const destinatario = admin.emailPessoa;
                enviarEmail(destinatario, assunto, corpo);
            });
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

async function atualizarRequisicao(idRequisicao, classificacaoRequisicao, informacoesRequisicao) {
    
    let query = `
        UPDATE requisicoes SET classificacaoRequisicao = '${classificacaoRequisicao}', informacoesRequisicao = '${informacoesRequisicao}' WHERE idRequisicao = ${idRequisicao};`;
        
    try {
        const resultados = await executarQuery(query);
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
            const corpo = statusVoluntario == 1 ? 'O status do sua requisição foi alterada para "ativo"! \n\n Qualquer dúvida entre em contato com a Abba Church.' : 'O status da sua requisição foi alterada para "inativo"! \n\n Qualquer dúvida entre em contato com a Abba Church.';
            enviarEmail(destinatario, assunto, corpo);
        }

        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarRequisicoes, cadastrarRequisicao, deletarRequisicao, carregarRequisicao, atualizarRequisicao, atualizarStatusRequisicao };