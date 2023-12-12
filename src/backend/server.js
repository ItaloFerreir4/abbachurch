const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { autenticarUsuario } = require('./auth');
const { listarPessoas, cadastrarPessoa, deletarPessoa, carregarPessoa, atualizarPessoa } = require('./pessoas');
const app = express();
const port = 3000;

// Configuração para servir arquivos estáticos no diretório
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../html')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/api/listarPessoas', async (req, res) => {

    const { tipoPessoa } = req.body;

    try {
        const lista = await listarPessoas(tipoPessoa);

        if (lista) {
            res.json(lista);
        } else {
            res.status(401).json({ message: 'Erro ao listar' });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }

});

app.post('/api/cadastrarPessoa', async (req, res) => {

    const { tipoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin } = req.body;

    try {
        const pessoa = await cadastrarPessoa(tipoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin);

        if (pessoa) {
            res.json({ message: 'Cadastrado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao cadastrar' });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/deletarPessoa', async (req, res) => {

    const { pessoaId, tipoPessoa } = req.body;

    try {
        const resultado = await deletarPessoa(pessoaId, tipoPessoa);

        if (resultado) {
            res.json({ message: 'Deletado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao deletar' });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/carregarPessoa', async (req, res) => {

    const { idPessoa, tipoPessoa } = req.body;

    try {
        const resultado = await carregarPessoa(idPessoa, tipoPessoa);

        if (resultado) {
            res.json(resultado);
        } else {
            res.status(401).json({ message: 'Erro ao Carregar' });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarPessoa', async (req, res) => {

    const { idPessoa, tipoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin } = req.body;

    try {
        const resultado = await atualizarPessoa(idPessoa, tipoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin);

        if (resultado) {
            res.json(resultado);
        } else {
            res.status(401).json({ message: 'Erro ao atualizar' });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
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

// Rota para tratar solicitações de páginas HTML
app.get('/:page', (req, res) => {
    const { page } = req.params;
    const filePath = path.join(__dirname, '../html', `${page}.html`);
    res.sendFile(filePath);
});

// Rota para tratar solicitações de recursos estáticos (CSS, imagens, etc.)
app.get('/assets/:file', (req, res) => {
    const { file } = req.params;
    const filePath = path.join(__dirname, '../assets', file);
    res.sendFile(filePath);
});

// Inicie o servidor
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});