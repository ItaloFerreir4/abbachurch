const executarQuery = require('./consulta');
const { format } = require('date-fns');
const { enviarEmail } = require('./send-email');
const { formatarDataHora } = require('./formata-data');

async function listarRequisicoes(idUserLog, tipoUserLog, limit) {
    
    let query = tipoUserLog == 0 || tipoUserLog == 5 ? 'SELECT * FROM requisicoes ORDER BY idRequisicao DESC' : `SELECT * FROM requisicoes WHERE pessoaId = ${idUserLog}  ORDER BY idRequisicao DESC`;

    if(limit > 0){
        query = 'SELECT req.*, pe.fotoPessoa, pe.nomePessoa FROM requisicoes req, pessoas pe WHERE req.pessoaId = pe.idPessoa ORDER BY idRequisicao DESC LIMIT 3';
    }

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarRequisicao(pessoaId, tipoUsuario, classificacaoRequisicao, informacoesRequisicao, departamentoEvento, nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, ambienteEvento, departamentosProducaoEvento, participacaoAbbaWorshipEvento, statusRequisicao) {
    
    let dataRequisicao = new Date();
    dataRequisicao = format(dataRequisicao, 'yyyy-MM-dd');

    let dataHoraInicio = '';
    let dataHoraFim = '';

    if(classificacaoRequisicao == 'Evento'){

        dataHoraInicio = formatarDataHora(dataHoraInicioEvento);
        dataHoraFim = formatarDataHora(dataHoraFimEvento);

        let query = `SELECT * FROM eventos WHERE dataHoraInicioEvento = '${dataHoraInicio}' `;
        const evento = await executarQuery(query); 

        if(evento && evento.length > 0){
            return 'Existe';
        }
    }

    query = `
    INSERT INTO requisicoes (pessoaId, tipoUsuario, classificacaoRequisicao, informacoesRequisicao, departamentoEvento, nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, ambienteEvento, departamentosProducaoEvento, participacaoAbbaWorshipEvento, statusRequisicao, dataRequisicao) 
    VALUES ('${pessoaId}', '${tipoUsuario}', '${classificacaoRequisicao}', '${informacoesRequisicao}', '${departamentoEvento}', '${nomeEvento}', '${dataHoraInicio}', '${dataHoraFim}', '${ambienteEvento}', '${departamentosProducaoEvento}', '${participacaoAbbaWorshipEvento}', '${statusRequisicao}', '${dataRequisicao}')`;

    try {
        const resultado = await executarQuery(query);

        if(resultado){
            query = `SELECT * FROM pessoas pe, usuarios us WHERE (us.tipoUsuario = 0 OR us.tipoUsuario = 5) AND us.pessoaId = pe.idPessoa`; 
            const admins = await executarQuery(query);
            query = `SELECT * FROM pessoas WHERE idPessoa = ${pessoaId}`; 
            const quem = await executarQuery(query);
            const assunto = 'Cadastro de requisição!';

            let camposEvento;

            if(classificacaoRequisicao == 'Evento'){
                camposEvento = `
                <p><strong>Informações do Evento</strong><p>
                <p><strong>Departamento:</strong> ${departamentoEvento}<p>
                <p><strong>Nome:</strong> ${nomeEvento}<p>
                <p><strong>Data/Hora Inicio:</strong> ${dataHoraInicioEvento}<p>
                <p><strong>Data/Hora Fim:</strong> ${dataHoraFimEvento}<p>
                <p><strong>Ambiente:</strong> ${ambienteEvento}<p>
                <p><strong>Departamentos da produção:</strong> ${departamentosProducaoEvento}<p>
                <p><strong>Participação do Abba worship:</strong> ${participacaoAbbaWorshipEvento}<p>
                `
            }

            const corpo = `<p>Uma requisição foi cadastrada!</p>
            <p><strong>Quem cadastrou:</strong> ${quem[0].nomePessoa}<p>
            ${camposEvento}
            <p><strong>Informações adicionais:</strong> ${informacoesRequisicao}<p>
            <p>Acesse <a href="https://abbachurch.app/" title="Painel Abba Church">https://abbachurch.app/</a><p>
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

        return 'Cadastrado';
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

async function atualizarRequisicao(pessoaId, idRequisicao, classificacaoRequisicao, informacoesRequisicao, departamentoEvento, nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, ambienteEvento, departamentosProducaoEvento, participacaoAbbaWorshipEvento) {

    let dataHoraInicio = '';
    let dataHoraFim = '';

    if(classificacaoRequisicao == 'Evento'){
        
        dataHoraInicio = formatarDataHora(dataHoraInicioEvento);
        dataHoraFim = formatarDataHora(dataHoraFimEvento);

        let query = `SELECT * FROM eventos WHERE dataHoraInicioEvento = '${dataHoraInicio}' `;
        const evento = await executarQuery(query); 

        if(evento && evento.length > 0){
            return 'Existe';
        }
    }

    let query = `
        UPDATE requisicoes SET 
        classificacaoRequisicao = '${classificacaoRequisicao}', 
        informacoesRequisicao = '${informacoesRequisicao}', 
        departamentoEvento = '${departamentoEvento}', 
        nomeEvento = '${nomeEvento}', 
        dataHoraInicioEvento = '${dataHoraInicio}', 
        dataHoraFimEvento = '${dataHoraFim}', 
        ambienteEvento = '${ambienteEvento}', 
        departamentosProducaoEvento = '${departamentosProducaoEvento}', 
        participacaoAbbaWorshipEvento = '${participacaoAbbaWorshipEvento}' WHERE idRequisicao = ${idRequisicao};`;
        
    try {
        const resultados = await executarQuery(query);
        
        if(resultados){
            query = `SELECT * FROM pessoas pe, usuarios us WHERE (us.tipoUsuario = 0 OR us.tipoUsuario = 5) AND us.pessoaId = pe.idPessoa`; 
            const admins = await executarQuery(query);
            query = `SELECT * FROM pessoas WHERE idPessoa = ${pessoaId}`; 
            const quem = await executarQuery(query);
            const assunto = 'Atualização de requisição!';

            let camposEvento;

            if(classificacaoRequisicao == 'Evento'){
                camposEvento = `
                <p><strong>Informações do Evento</strong><p>
                <p><strong>Departamento:</strong> ${departamentoEvento}<p>
                <p><strong>Nome:</strong> ${nomeEvento}<p>
                <p><strong>Data/Hora Inicio:</strong> ${dataHoraInicioEvento}<p>
                <p><strong>Data/Hora Fim:</strong> ${dataHoraFimEvento}<p>
                <p><strong>Ambiente:</strong> ${ambienteEvento}<p>
                <p><strong>Departamentos da produção:</strong> ${departamentosProducaoEvento}<p>
                <p><strong>Participação do Abba worship:</strong> ${participacaoAbbaWorshipEvento}<p>
                `
            }

            const corpo = `<p>Uma requisição foi atualizada!</p>
            <p><strong>Quem atualizou:</strong> ${quem[0].nomePessoa}<p>
            ${camposEvento}
            <p><strong>Informações:</strong> ${informacoesRequisicao}<p>
            <p>Acesse <a href="https://abbachurch.app/" title="Painel Abba Church">https://abbachurch.app/</a><p>
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

        return resultados ? 'Atualizado' : false;
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