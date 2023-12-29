const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { autenticarUsuario } = require('./auth');
const { saveImage } = require('./upload-imagem');
const { listarPessoas, cadastrarPessoa, deletarPessoa, carregarPessoa, atualizarPessoa } = require('./pessoas');
const e = require('express');
const app = express();
const port = 3000;

app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.use('/html', express.static(path.join(__dirname, '../html')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 's3Cr3T4BbA',
    resave: false,
    saveUninitialized: true,
}));

const authenticateMiddleware = (req, res, next) => {
    if (req.url === '/login' || req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.use(authenticateMiddleware);

app.get('/login', (req, res) => {
    const filePath = path.join(__dirname, '../html', 'sign-in-cover2.html');
    res.sendFile(filePath);
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await autenticarUsuario(email, senha); //return resultados.length > 0 ? resultados[0] : null;

        if (usuario) {
            req.session.authenticated = true;
            req.session.email = email;
            req.session.nome = usuario.nomePessoa;
            req.session.foto = usuario.fotoPessoa;
            res.json({ message: 'Login bem-sucedido', usuario });
        } else {
            res.status(401).json({ message: 'Credenciais inválidas' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Rota para a página inicial
app.get('/', (req, res) => {
    // Verifique se o usuário está autenticado antes de servir a página inicial
    if (req.session.authenticated) {
        res.sendFile(path.join(__dirname, '../html', 'index.html'));
    } else {
        // Se o usuário não estiver autenticado, redirecione para a página de login
        res.redirect('/login');
    }
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

    const { tipoPessoa, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario } = req.body;
    
    try {

        const nomeFoto = fotoPessoa ? await saveImage(JSON.parse(fotoPessoa)) : 'semfoto.png';

        const pessoa = await cadastrarPessoa(tipoPessoa, nomeFoto, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario);

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

    const { idPessoa, tipoPessoa, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, changeAccess } = req.body;

    try {
        const nomeFoto = fotoPessoa ? await saveImage(JSON.parse(fotoPessoa)) : 'semfoto.png';
        const resultado = await atualizarPessoa(idPessoa, tipoPessoa, nomeFoto, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, changeAccess);

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

// Rota para tratar solicitações de dados
app.get('/api/data', (req, res) => {
    if (req.session.authenticated) {
      res.json({ 
        nomeUsuario: req.session.nome,
        emailUsuario: req.session.email,
        fotoUsuario: req.session.foto,
     });
    } else {
      res.status(401).json({ error: 'Usuário não autenticado' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logout bem-sucedido' });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
