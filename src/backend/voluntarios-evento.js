const executarQuery = require('./consulta');
const { enviarEmail } = require('./send-email');
const { format } = require('date-fns');

async function listarEventosVoluntario(pessoaId) {
    
    let query = `
    SELECT ev.*, ve.*, mi.*, catEv.nomeCategoriaEvento 
    FROM voluntariosEvento ve, voluntarios vo, eventos ev, ministerios mi, categoriasEventos catEv
    WHERE vo.pessoaId = ${pessoaId} AND ve.voluntarioId = vo.idVoluntario AND ev.idEvento = ve.eventoId AND ev.ministerioId = mi.idMinisterio AND ev.categoriaEventoId = catEv.idCategoriaEvento`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function listarVoluntariosEvento(eventoId) {
    
    let query = `SELECT * FROM voluntariosEvento ve, pessoas pe, voluntarios vo WHERE ve.eventoId = ${eventoId} AND ve.voluntarioId = vo.idVoluntario AND vo.pessoaId = pe.idPessoa`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function listarTodasAcoes() {
    
    let query = `SELECT * FROM voluntariosEvento ve, voluntarios vo, pessoas pe WHERE ve.voluntarioId = vo.idVoluntario AND vo.pessoaId = pe.idPessoa;`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function cadastrarVoluntarioEvento(voluntarioId, eventoId, categoria) {

    let query = `
    INSERT INTO voluntariosEvento (voluntarioId, eventoId, categoria) 
    VALUES (${voluntarioId}, ${eventoId}, '${categoria}')`;

    try {
        const resultado = await executarQuery(query);

        if(resultado){
            query = `
            SELECT pe.* 
            FROM voluntarios vo, pessoas pe 
            WHERE vo.idVoluntario = ${voluntarioId} AND pe.idPessoa = vo.pessoaId`; 
            const pessoa = await executarQuery(query);

            query = `
            SELECT * 
            FROM eventos 
            WHERE idEvento = ${eventoId}`; 
            const evento = await executarQuery(query);

            let dataInicio = format(new Date(evento[0].dataHoraInicioEvento), 'yyyy-MM-dd hh:mm a');
            let dataFim = format(new Date(evento[0].dataHoraFimEvento), 'yyyy-MM-dd hh:mm a');

            const destinatario = pessoa[0].emailPessoa;
            const assunto = 'Ação voluntária!';
            let corpo = `
            <p>Sua participação foi solicitada em uma ação voluntária. Abaixo está as informações sobre o evento:</p>
            <p>--------------------------</p>
            <p><strong>Nome:</strong> ${evento[0].nomeEvento}</p>
            <p><strong>Inicio:</strong> ${dataInicio}</p>
            <p><strong>Fim:</strong> ${dataFim}</p>
            <p><strong>Local:</strong> ${evento[0].localEvento}</p>
            <p>--------------------------</p>
            <p>Acesse <a href="https://abbachurch.app/" title="Painel Abba Church">https://abbachurch.app/</a><p>
            <p>Qualquer dúvida entre em contato com a Abba Church.</p>`;
            enviarEmail(destinatario, assunto, corpo);
        }

        return resultado;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function deletarVoluntarioEvento(idVoluntarioEvento) {
    
    let query = `DELETE FROM voluntariosEvento WHERE idVoluntariosEvento = ${idVoluntarioEvento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function carregarVoluntarioEvento(idVoluntarioEvento) {
    
    let query = `SELECT * FROM voluntariosEvento WHERE idVoluntariosEvento = ${idVoluntarioEvento};`;

    try {
        const resultados = await executarQuery(query);
        return resultados;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

async function atualizarVoluntarioEvento(idVoluntarioEvento, voluntarioId, eventoId, categoria) {

    let query = `UPDATE voluntariosEvento SET voluntarioId = ${voluntarioId}, eventoId = ${eventoId}, categoria = '${categoria}' WHERE idVoluntariosEvento = ${idVoluntarioEvento};`;
        
    try {
        const resultados = await executarQuery(query);
        return resultados ? true : false;
    } catch (erro) {
        console.error('Erro:', erro);
        throw erro;
    }
}

module.exports = { listarEventosVoluntario, listarTodasAcoes, listarVoluntariosEvento, cadastrarVoluntarioEvento, deletarVoluntarioEvento, carregarVoluntarioEvento, atualizarVoluntarioEvento };