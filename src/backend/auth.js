require('dotenv').config();
const executarQuery = require('./consulta');
const bcrypt = require('bcrypt');
const { verificarTokenConfirmacao, gerarTokenConfirmacao } = require('./global');
const { enviarEmail } = require('./send-email');

async function autenticarUsuario(email, senha) {
    var status = 0;
    var query = `
        SELECT * FROM pessoas p, usuarios u
        WHERE p.idPessoa = u.pessoaId AND p.emailPessoa = '${email}'`;

    try {
        var resultados = await executarQuery(query);

        if (resultados.length > 0) {

            var usuario = resultados[0];

            if (usuario.statusUsuario == 0) {
                status = 0;
                return { status };
            }

            if (usuario.statusUsuario == 2) {
                status = 4;
                return { status };
            }

            const senhaCorreta = await bcrypt.compare(senha, usuario.senhaUsuario);

            if (senhaCorreta) {
                status = 1;
                return { status, usuario };

            } else {
                status = 2;
                return { status };
            }
        } else {
            status = 3;
            return { status };
        }
    } catch (erro) {
        throw erro;
    }
}

async function confirmarEmail(token) {
    
    const payload = verificarTokenConfirmacao(token);
    
    if (payload) {
        const query = `
            UPDATE usuarios
            SET statusUsuario = 1
            WHERE pessoaId = ${payload.pessoaId}`;

        try {
            await executarQuery(query);
            return payload;
        } catch (erro) {
            throw erro;
        }
    } else {
        return false;
    }

}

async function enviarRecEmail(email) {
    let query = `
        SELECT * FROM pessoas
        WHERE emailPessoa = '${email}'`;

    try {
        let resultados = await executarQuery(query);
        let baseUrl = process.env.BASE_URL;

        if (resultados.length > 0) {
            
            let pessoa = resultados[0];
            let token = gerarTokenConfirmacao(pessoa.idPessoa, email);
            let destinatario = email;
            let assunto = 'Recuperação de senha';
            let corpo = `<p>Olá, <b>${pessoa.nomePessoa}</b>!</p> 
            <p>Você solicitou a <b>recuperação de senha</b>.</p>
            <p>Clique no link abaixo para redefini-la:</p>
            <p>${baseUrl}/recuperar-senha?t=${token}</p>`;
            enviarEmail(destinatario, assunto, corpo)

            return 1;

        } else {

            return 0;

        }
        
    } catch (erro) {
        throw erro;
    }
}

module.exports = { autenticarUsuario, confirmarEmail, enviarRecEmail };