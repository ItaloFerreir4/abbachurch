const executarQuery = require('./consulta');
const bcrypt = require('bcrypt');
const { verificarTokenConfirmacao, gerarTokenConfirmacao } = require('./global');
const { enviarEmail } = require('./send-email');

async function autenticarUsuario(email, senha) {
    const query = `
        SELECT * FROM pessoas p, usuarios u
        WHERE p.idPessoa = u.pessoaId AND p.emailPessoa = '${email}'`;

    try {
        const resultados = await executarQuery(query);

        if (resultados.length > 0) {

            const usuario = resultados[0];
            const senhaCorreta = await bcrypt.compare(senha, usuario.senhaUsuario);

            if (senhaCorreta) {
                return usuario;
            } else {
                return null;
            }
        } else {
            return null;
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
            let corpo = `Olá, ${pessoa.nomePessoa}! Você solicitou a recuperação de senha. Clique no link abaixo para redefini-la: \n\n http://localhost:3000/recuperar-senha?t=${token}`;
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