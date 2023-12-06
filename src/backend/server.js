const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const executarQuery = require('./consulta');
const { autenticarUsuario } = require('./auth');
const app = express();
const port = 3000;

// Configuração para servir arquivos estáticos no diretório
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../html')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Adicione essa linha para configurar o body-parser para tratar JSON

// Rota para a consulta SQL
app.post('/listarPastores', (req, res) => {

    const query = 'SELECT * FROM pastores pa, pessoas pe WHERE pa.pessoaId = pe.idPessoa';

    executarQuery(query)
    .then(resultados => {
        res.json(resultados);
    })
    .catch(erro => {
        console.error('Erro:', erro);
    });

});

app.post('/cadastrarPastor', (req, res) => {

    const { nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa } = req.body;

    const query = `INSERT INTO pessoas (nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa) VALUES ('${nomePessoa}', '${emailPessoa}', '${telefonePessoa}', '${estadoCivilPessoa}', '${dataNascimentoPessoa}')`;

    executarQuery(query)
    .then(resultados => {
        console.log('Resultados:', resultados);

        const pessoaId = resultados.insertId;

        // Segundo INSERT para cadastrar o pastor associado à pessoa
        const insertPastorQuery = `INSERT INTO pastores (pessoaId) VALUES (${pessoaId})`;

        res.json(resultados);

        return executarQuery(insertPastorQuery);
    })
    .catch(erro => {
        console.error('Erro:', erro);
        // Lide com o erro
    });

});

app.get('/login', (req, res) => {
    const filePath = path.join(__dirname, '..', 'html', 'sign-in-cover2.html');
    res.sendFile(filePath);
});

app.post('/auth/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await autenticarUsuario(email, senha);

        if (usuario) {
            res.json({ message: 'Login bem-sucedido', usuario });
        } else {
            res.status(401).json({ message: 'Credenciais inválidas' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});


// Rota padrão, pode ser usada para servir a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html', 'index.html'));
});

// Inicie o servidor
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});