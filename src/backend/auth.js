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
                status = 0; //email não confirmado
                return { status };
            }

            if (usuario.statusUsuario == 2) {
                status = 4; //usuario desativado
                return { status };
            }

            const senhaCorreta = await bcrypt.compare(senha, usuario.senhaUsuario);

            if (senhaCorreta) {
                status = 1; //senha ok
                return { status, usuario };

            } else {
                status = 2; //senha incorreta
                return { status };
            }
        } else {
            status = 3; //email não cadastrado
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
            UPDATE voluntarios
            SET statusVoluntario = 1
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

        if (resultados.length > 0) {
            
            let pessoa = resultados[0];
            let token = gerarTokenConfirmacao(pessoa.idPessoa, email);
            let destinatario = email;
            let assunto = 'Recuperação de senha';
            let corpo = `Olá, ${pessoa.nomePessoa}! Você solicitou a recuperação de senha. Clique no link abaixo para redefini-la: \n\n http://localhost:1111/recuperar-senha?t=${token}`;
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