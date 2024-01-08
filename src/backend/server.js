const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { autenticarUsuario } = require('./auth');
const { saveImage } = require('./upload-imagem');
const { listarNomePaises } = require('./paises');
const { listarCategorias, cadastrarCategoria, deletarCategoria, carregarCategoria, atualizarCategoria } = require('./categorias');
const { listarPessoas, cadastrarPessoa, cadastrarFilho, cadastrarVoluntario, deletarPessoa, carregarPessoa, atualizarPessoa } = require('./pessoas');
const e = require('express');
const app = express();
const port = 3000;

app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.use('/html', express.static(path.join(__dirname, '../html')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
    secret: 's3Cr3T4BbA',
    resave: false,
    saveUninitialized: true,
}));

const authenticateMiddleware = (req, res, next) => {
    if (['/login', '/reset-password', '/index', '/voluntariar', '/api/listarCategorias', '/'].includes(req.url)) {
        next();
    } else if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.use(authenticateMiddleware);

app.get('/voluntariar', (req, res) => { 
    const filePath = path.join(__dirname, '../html', 'voluntariar.html');
    res.sendFile(filePath);
})

app.get('/reset-password', (req, res) => {
    const filePath = path.join(__dirname, '../html', 'reset-password.html');
    res.sendFile(filePath);
})

app.get('/login', (req, res) => {
    const filePath = path.join(__dirname, '../html', 'sign-in-cover2.html');
    res.sendFile(filePath);
});

app.post('/login', async (req, res) => {
    const { email, senha, remember } = req.body;

    if (!email || !senha) {
        res.status(400).json({ message: 'Credenciais inválidas' });
        return;
    }

    try {
        const usuario = await autenticarUsuario(email, senha); //return resultados.length > 0 ? resultados[0] : null;

        if (usuario) {

            if (remember) {
                req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
            }

            req.session.authenticated = true;
            req.session.email = email;
            req.session.nome = usuario.nomePessoa;
            req.session.foto = usuario.fotoPessoa;
            req.session.idPessoa = usuario.idPessoa;
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
    // if (req.session.authenticated) {
        res.sendFile(path.join(__dirname, '../html', 'index.html'));
    // } else {
    //  Se o usuário não estiver autenticado, redirecione para a página de login
    //     res.redirect('/login');
    // }
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

    const { tipoPessoa, pessoaId } = req.body;

    try {
        const lista = await listarPessoas(tipoPessoa, pessoaId);

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

    const { tipoPessoa, pastorId, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, profissaoPessoa, escolaridadePessoa, idiomaPessoa, categoriasVoluntario } = req.body;
    
    try {

        const nomeFoto = fotoPessoa ? await saveImage(JSON.parse(fotoPessoa)) : 'semfoto.png';

        const pessoa = await cadastrarPessoa(tipoPessoa, nomeFoto, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, profissaoPessoa, escolaridadePessoa, idiomaPessoa);
        if(pastorId){
            switch(tipoPessoa){
                case 'filho':
                    await cadastrarFilho(pessoa.insertId, pastorId);
                break;
                case 'voluntario':
                    await cadastrarVoluntario(pessoa.insertId, pastorId, categoriasVoluntario);
                break;
            }
        }

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

    const { idPessoa, tipoPessoa, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, changeAccess, profissaoPessoa, escolaridadePessoa, idiomaPessoa } = req.body;

    try {
        const nomeFoto = fotoPessoa ? await saveImage(JSON.parse(fotoPessoa)) : 'semfoto.png';
        const resultado = await atualizarPessoa(idPessoa, tipoPessoa, nomeFoto, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, changeAccess, profissaoPessoa, escolaridadePessoa, idiomaPessoa);

        if (resultado) 
        {
            let newData = {};
            if (req.session.idPessoa == idPessoa){
                
                req.session.nome = nomePessoa;
                req.session.foto = nomeFoto;
                newData = {
                    changeData: true,
                    resultado: resultado,
                    nomePessoa: nomePessoa,
                    nomeFoto: nomeFoto
                };

            } else {
                newData = {
                    changeData: false,
                    resultado: resultado,
                };
            }

            res.json(newData);

        } else {
            res.status(401).json({ message: 'Erro ao atualizar' });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/listarCategorias', async (req, res) => {

    try {
        const lista = await listarCategorias();

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

app.post('/api/cadastrarCategoria', async (req, res) => {

    const { nomeCategoria } = req.body;
    
    try {
        const categoria = await cadastrarCategoria(nomeCategoria);
        
        if (categoria) {
            res.json({ message: 'Cadastrado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao cadastrar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarCategoria', async (req, res) => {

    const { idCategoria, nomeCategoria } = req.body;
    
    try {
        const categoria = await atualizarCategoria(idCategoria, nomeCategoria);
        
        if (categoria) {
            res.json({ message: 'Atualizado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao atualizar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/deletarCategoria', async (req, res) => {

    const { idCategoria } = req.body;

    try {
        const resultado = await deletarCategoria(idCategoria);

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

app.post('/api/carregarCategoria', async (req, res) => {

    const { idCategoria } = req.body;

    try {
        const resultado = await carregarCategoria(idCategoria);

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

app.post('/api/listarNomePaises', async (req, res) => {

    try {
        const lista = await listarNomePaises();

        if (lista) {
            res.json(lista);
        } else {
            res.status(401).json({ message: 'Erro ao Carregar' });
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
