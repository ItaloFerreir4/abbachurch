require('dotenv').config();
const express = require('express');
const session = require('express-session');
const https = require('https');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { recNovaSenha } = require('./usuarios');
const { verificarTokenConfirmacao } = require('./global');
const { autenticarUsuario, confirmarEmail, enviarRecEmail } = require('./auth');
const { saveImage } = require('./upload-imagem');
const { listarNomePaises } = require('./paises');
const { listarIgrejas, cadastrarIgreja, deletarIgreja, carregarIgreja, atualizarIgreja } = require('./igrejas');
const { listarEventos, cadastrarEvento, deletarEvento, carregarEvento, atualizarEvento } = require('./eventos');
const { listarCategorias, cadastrarCategoria, deletarCategoria, carregarCategoria, atualizarCategoria } = require('./categorias');
const { listarMinisterios, cadastrarMinisterio, deletarMinisterio, carregarMinisterio, atualizarMinisterio } = require('./ministerios');
const { listarRequisicoes, cadastrarRequisicao, deletarRequisicao, carregarRequisicao, atualizarRequisicao, atualizarStatusRequisicao } = require('./requisicoes');
const { listarCategoriasEventos, cadastrarCategoriaEvento, deletarCategoriaEvento, carregarCategoriaEvento, atualizarCategoriaEvento } = require('./categorias-eventos');
const { listarTodasAcoes, listarVoluntariosEvento, cadastrarVoluntarioEvento, deletarVoluntarioEvento, carregarVoluntarioEvento, atualizarVoluntarioEvento } = require('./voluntarios-evento');
const { listarPessoas, cadastrarPessoa, cadastrarFilho, cadastrarVoluntario, deletarPessoa, carregarPessoa, atualizarPessoa, atualizarVoluntario, atualizarStatusVoluntario, alterarAdminPastor } = require('./pessoas');
const e = require('express');
const app = express();
const port = 3000;

app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.use('/html', express.static(path.join(__dirname, '../html')));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(cookieParser());
app.use(session({
    secret: 's3Cr3T4BbA',
    resave: false,
    saveUninitialized: true,
}));

const authenticateMiddleware = (req, res, next) => {
    if (['/login', '/reset-password', '/index', '/voluntariar', '/api/listarCategorias', '/api/listarNomePaises', '/api/cadastrarVoluntario', '/esqueci-minha-senha', '/nova-senha', '/'].includes(req.url) || req.url.startsWith('/confirmar-email')  || req.url.startsWith('/recuperar-senha') ) {
        next();
    } else if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.use(authenticateMiddleware);

app.post('/nova-senha', async (req, res) => {
    const { senha, token } = req.body;

    try {

        result = await recNovaSenha(token, senha);

        if (result) {
            res.json({ sts: 1, message: 'Senha alterada com sucesso' });
        } else {
            res.json({ sts: 0, message: 'Erro ao alterar senha' });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500);
    }
        
});

app.post('/esqueci-minha-senha', async (req, res) => {
    const { email } = req.body;

    try {
        const resultado = await enviarRecEmail(email);

        if (resultado == 1) {
            res.json({ sts: 'success', message: 'E-mail de recuperação enviado com sucesso' });
        } else if (resultado == 0) {
            res.json({ sts: 'error', message: 'E-mail não cadastrado' });
        } else {
            res.status(401);
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500);
    }
});

app.get('/esqueci-minha-senha', (req, res) => { 
    const filePath = path.join(__dirname, '../html', 'send-new-password.html');
    res.sendFile(filePath);
})

app.get('/voluntariar', (req, res) => { 
    const filePath = path.join(__dirname, '../html', 'voluntariar.html');
    res.sendFile(filePath);
})

app.get('/confirmar-email', (req, res) => { 
    const filePath = path.join(__dirname, '../html', 'confirmar-email.html');
    res.sendFile(filePath);
});

app.post('/confirmar-email', async (req, res) => {
    const { token } = req.body;

    try {
        const resultado = await confirmarEmail(token);

        if (resultado) {

            res.json({ message: 'E-mail verificado com sucesso' });

        } else {

            res.status(401).json({ message: 'Erro ao verificar. Tente novamente mais tarde.' });

        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor'+erro });
    }
});

app.post('/recuperar-senha', async (req, res) => {
    const { token } = req.body;

    try {
        
        const payload = verificarTokenConfirmacao(token);
    
        if (payload) {
            return res.json({ sts: 1, message: 'Token válido' });
        } else{
            return res.json({ sts: 0, message: 'Token inválido' });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor'+erro });
    }
});

app.get('/recuperar-senha', (req, res) => {
    const filePath = path.join(__dirname, '../html', 'reset-password.html');
    res.sendFile(filePath);
})

app.get('/login', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/home');
    }
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
        var result = await autenticarUsuario(email, senha);
        var sts = result.status;

        if (sts == 1) {

            if (remember) {
                req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
            }

            var usuario = result.usuario;

            req.session.authenticated = true;
            req.session.email = email;
            req.session.nome = usuario.nomePessoa;
            req.session.foto = usuario.fotoPessoa;
            req.session.idPessoa = usuario.idPessoa;
            req.session.tipoUsuario = usuario.tipoUsuario;

            res.json({ sts: sts, message: 'Login bem-sucedido', usuario });

        } else if (sts == 0) {

            res.json({ sts: sts, message: 'E-mail não confirmado' });

        } else if (sts == 2) {

            res.json({ sts: sts, message: 'Credenciais inválidas' });

        } else if (sts == 3) {

            res.json({ sts: sts, message: 'Usuário não cadastrado' });

        } else if (sts == 4) {

            res.json({ sts: sts, message: 'Usuário desativado' });
            
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

    const idUserLog = req.session.idPessoa;
    const tipoUserLog = req.session.tipoUsuario;
    const { tipoPessoa, pessoaId } = req.body;

    try {
        const lista = await listarPessoas(idUserLog, tipoUserLog, tipoPessoa, pessoaId);

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

app.post('/api/alterarAdminPastor', async (req, res) => {
    
    const { pessoaId, tipoUsuario } = req.body;

    try {
        const resultado = await alterarAdminPastor(pessoaId, tipoUsuario);

        if (resultado) {
            res.json({ message: 'Alterado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao alterar' });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor'+erro });
    }
    
});

app.post('/api/cadastrarVoluntario', async (req, res) => {

    const recaptchaToken = req.body.recaptchaToken;
    const postData = `secret=6LfIkmApAAAAAKdUTiizCvzhHdPE1OZyhtlgVZGj&response=${recaptchaToken}`;
    const options = {
        hostname: 'www.google.com',
        path: '/recaptcha/api/siteverify',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
        },
    };

    const verificationRequest = https.request(options, (verificationResponse) => {
        let responseData = '';

        verificationResponse.on('data', (chunk) => {
            responseData += chunk;
        });

        verificationResponse.on('end', async () => {
            try {
                const result = JSON.parse(responseData);
                if (result.success) {
                    
                    const { tipoPessoa, pastorId, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, generoPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, categoriasVoluntario, igrejaId } = req.body;
    
                    try {

                        const nomeFoto = fotoPessoa != null  && fotoPessoa != '' ? await saveImage(JSON.parse(fotoPessoa)) : 'semfoto.png';

                        const pessoa = await cadastrarPessoa(tipoPessoa, nomeFoto, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, generoPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, igrejaId);

                        if (pessoa) {

                            if(pastorId){
                                
                                await cadastrarVoluntario(pessoa.insertId, pastorId, categoriasVoluntario, emailPessoa, nomePessoa, senhaUsuario);

                            }

                            res.json({ message: 'Cadastrado com sucesso' });
                            
                        } else if (pessoa == null) {

                            res.status(401).json({ message: 'E-mail já cadastrado' });

                        } else {

                            res.status(401).json({ message: 'Erro ao cadastrar' });

                        }

                    } catch (erro) {
                        console.error('Erro:', erro);
                        res.status(500).json({ message: 'Erro no servidor' });
                    }

                } else {
                    res.status(401).json({ message: 'Falha na verificação do reCAPTCHA.' });
                }
            } catch (error) {
                res.status(401).json({ message: 'Erro interno.' });
            }
        });
    });

    verificationRequest.on('error', (error) => {
        res.status(401).json({ message: 'Erro interno.' });
    });

    verificationRequest.write(postData);
    verificationRequest.end();

});

app.post('/api/cadastrarPessoa', async (req, res) => {

    const { tipoPessoa, pastorId, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, generoPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, categoriasVoluntario, igrejaId } = req.body;
    
    try {

        const nomeFoto = fotoPessoa != null  && fotoPessoa != '' ? await saveImage(JSON.parse(fotoPessoa)) : 'semfoto.png';

        const pessoa = await cadastrarPessoa(tipoPessoa, nomeFoto, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, generoPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, igrejaId);

        if (pessoa) {

            if(pastorId){
                switch(tipoPessoa){
                    case 'filho':
                        await cadastrarFilho(pessoa.insertId, pastorId);
                    break;
                    case 'voluntario':
                        await cadastrarVoluntario(pessoa.insertId, pastorId, categoriasVoluntario, emailPessoa, nomePessoa, senhaUsuario);
                    break;
                }
            }

            res.json({ message: 'Cadastrado com sucesso' });
            
        } else if (pessoa == null) {

            res.status(401).json({ message: 'E-mail já cadastrado' });

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

    const { idPessoa, pastorId, tipoPessoa, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, changeAccess, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, categoriasVoluntario, igrejaId } = req.body;

    try {
        const nomeFoto = fotoPessoa ? await saveImage(JSON.parse(fotoPessoa)) : 'semfoto.png';
        const resultado = await atualizarPessoa(idPessoa, tipoPessoa, nomeFoto, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, changeAccess, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, igrejaId);

        switch(tipoPessoa){
            case 'voluntario':
                const voluntario = await atualizarVoluntario(idPessoa, pastorId, categoriasVoluntario);
                console.log(voluntario);
            break;
        }

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

        } else if (resultado == null) {
            
            res.status(401).json({ message: 'E-mail já cadastrado' });  
        
        } else {
                
            res.status(401).json({ message: 'Erro ao atualizar' });
            
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarStatusVoluntario', async (req, res) => {

    const { pessoaId, statusVoluntario } = req.body;

    try {
        const resultado = await atualizarStatusVoluntario(pessoaId, statusVoluntario);

        if (resultado) 
        {
            res.json({message: 'Atualizado o status'});

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

app.post('/api/listarMinisterios', async (req, res) => {

    const idUserLog = req.session.idPessoa;
    const tipoUserLog = req.session.tipoUsuario;

    try {
        const lista = await listarMinisterios(idUserLog, tipoUserLog, 0);

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

app.post('/api/listarMinisteriosEventos', async (req, res) => {

    const idUserLog = req.session.idPessoa;
    const tipoUserLog = req.session.tipoUsuario;

    try {
        const lista = await listarMinisterios(idUserLog, tipoUserLog, 1);

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

app.post('/api/cadastrarMinisterio', async (req, res) => {

    const { nomeMinisterio, liderId, dataEntradaMinisterio } = req.body;
    
    try {
        const ministerio = await cadastrarMinisterio(nomeMinisterio, liderId, dataEntradaMinisterio);
        
        if (ministerio) {
            res.json({ message: 'Cadastrado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao cadastrar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarMinisterio', async (req, res) => {

    const { idMinisterio, nomeMinisterio, liderId, dataEntradaMinisterio } = req.body;
    
    try {
        const ministerio = await atualizarMinisterio(idMinisterio, nomeMinisterio, liderId, dataEntradaMinisterio);
        
        if (ministerio) {
            res.json({ message: 'Atualizado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao atualizar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/deletarMinisterio', async (req, res) => {

    const { idMinisterio } = req.body;

    try {
        const resultado = await deletarMinisterio(idMinisterio);

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

app.post('/api/carregarMinisterio', async (req, res) => {

    const { idMinisterio } = req.body;

    try {
        const resultado = await carregarMinisterio(idMinisterio);

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

app.post('/api/listarEventos', async (req, res) => {

    try {
        const lista = await listarEventos();

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

app.post('/api/cadastrarEvento', async (req, res) => {

    const { nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, localEvento, ministerioId, observacoesEvento, categoriaEventoId } = req.body;
    
    try {
        const resultado = await cadastrarEvento(nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, localEvento, ministerioId, observacoesEvento, categoriaEventoId);
        
        if (resultado) {
            res.json({ message: 'Cadastrado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao cadastrar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarEvento', async (req, res) => {

    const { idEvento, nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, localEvento, ministerioId, observacoesEvento, categoriaEventoId} = req.body;
    
    try {
        const resultado = await atualizarEvento(idEvento, nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, localEvento, ministerioId, observacoesEvento, categoriaEventoId);
        
        if (resultado) {
            res.json({ message: 'Atualizado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao atualizar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/deletarEvento', async (req, res) => {

    const { idEvento } = req.body;

    try {
        const resultado = await deletarEvento(idEvento);

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

app.post('/api/carregarEvento', async (req, res) => {

    const { idEvento } = req.body;

    try {
        const resultado = await carregarEvento(idEvento);

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

app.post('/api/listarCategoriasEventos', async (req, res) => {

    try {
        const lista = await listarCategoriasEventos();

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

app.post('/api/cadastrarCategoriaEvento', async (req, res) => {

    const { nomeCategoriaEvento } = req.body;
    
    try {
        const resultado = await cadastrarCategoriaEvento(nomeCategoriaEvento);
        
        if (resultado) {
            res.json({ message: 'Cadastrado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao cadastrar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarCategoriaEvento', async (req, res) => {

    const { idCategoriaEvento, nomeCategoriaEvento } = req.body;
    
    try {
        const resultado = await atualizarCategoriaEvento(idCategoriaEvento, nomeCategoriaEvento);
        
        if (resultado) {
            res.json({ message: 'Atualizado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao atualizar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/deletarCategoriaEvento', async (req, res) => {

    const { idCategoriaEvento } = req.body;

    try {
        const resultado = await deletarCategoriaEvento(idCategoriaEvento);

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

app.post('/api/carregarCategoriaEvento', async (req, res) => {

    const { idCategoriaEvento } = req.body;

    try {
        const resultado = await carregarCategoriaEvento(idCategoriaEvento);

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

app.post('/api/listarTodasAcoes', async (req, res) => {

    try {
        const lista = await listarTodasAcoes();

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

app.post('/api/listarVoluntariosEvento', async (req, res) => {

    const { eventoId } = req.body;

    try {
        const lista = await listarVoluntariosEvento(eventoId);

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

app.post('/api/cadastrarVoluntarioEvento', async (req, res) => {

    const { voluntarioId, eventoId, categoria } = req.body;
    
    try {
        const resultado = await cadastrarVoluntarioEvento(voluntarioId, eventoId, categoria);
        
        if (resultado) {
            res.json({ message: 'Cadastrado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao cadastrar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarVoluntarioEvento', async (req, res) => {

    const { idVoluntarioEvento, voluntarioId, eventoId, categoria } = req.body;
    
    try {
        const resultado = await atualizarVoluntarioEvento(idVoluntarioEvento, voluntarioId, eventoId, categoria);
        
        if (resultado) {
            res.json({ message: 'Atualizado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao atualizar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/deletarVoluntarioEvento', async (req, res) => {

    const { idVoluntarioEvento } = req.body;

    try {
        const resultado = await deletarVoluntarioEvento(idVoluntarioEvento);

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

app.post('/api/carregarVoluntarioEvento', async (req, res) => {

    const { idVoluntarioEvento } = req.body;

    try {
        const resultado = await carregarVoluntarioEvento(idVoluntarioEvento);

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

app.post('/api/listarIgrejas', async (req, res) => {

    try {
        const lista = await listarIgrejas();

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

app.post('/api/cadastrarIgreja', async (req, res) => {

    const { nomeIgreja, paisIgreja, estadoIgreja, enderecoIgreja, cepIgreja, telefoneIgreja, emailIgreja, tipoIgreja, matrizId } = req.body;
    
    try {
        const resultado = await cadastrarIgreja(nomeIgreja, paisIgreja, estadoIgreja, enderecoIgreja, cepIgreja, telefoneIgreja, emailIgreja, tipoIgreja, matrizId);
        
        if (resultado) {
            res.json({ message: 'Cadastrado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao cadastrar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarIgreja', async (req, res) => {

    const { idIgreja, nomeIgreja, paisIgreja, estadoIgreja, enderecoIgreja, cepIgreja, telefoneIgreja, emailIgreja, tipoIgreja, matrizId } = req.body;
    
    try {
        const resultado = await atualizarIgreja(idIgreja, nomeIgreja, paisIgreja, estadoIgreja, enderecoIgreja, cepIgreja, telefoneIgreja, emailIgreja, tipoIgreja, matrizId);
        
        if (resultado) {
            res.json({ message: 'Atualizado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao atualizar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/deletarIgreja', async (req, res) => {

    const { idIgreja } = req.body;

    try {
        const resultado = await deletarIgreja(idIgreja);

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

app.post('/api/carregarIgreja', async (req, res) => {

    const { idIgreja } = req.body;

    try {
        const resultado = await carregarIgreja(idIgreja);

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

app.post('/api/listarRequisicoes', async (req, res) => {

    const idUserLog = req.session.idPessoa;
    const tipoUserLog = req.session.tipoUsuario;

    try {
        const lista = await listarRequisicoes(idUserLog, tipoUserLog);

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

app.post('/api/cadastrarRequisicao', async (req, res) => {

    const { pessoaId, tipoUsuario, classificacaoRequisicao, informacoesRequisicao, statusRequisicao } = req.body;
    
    try {
        const resultado = await cadastrarRequisicao(pessoaId, tipoUsuario, classificacaoRequisicao, informacoesRequisicao, statusRequisicao);
        
        if (resultado) {
            res.json({ message: 'Cadastrado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao cadastrar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarRequisicao', async (req, res) => {

    const { idRequisicao, classificacaoRequisicao, informacoesRequisicao } = req.body;
    const idPessoa = req.session.idPessoa;
    
    try {
        const resultado = await atualizarRequisicao(idPessoa, idRequisicao, classificacaoRequisicao, informacoesRequisicao);
        
        if (resultado) {
            res.json({ message: 'Atualizado com sucesso' });
        } else {
            res.status(401).json({ message: 'Erro ao atualizar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/deletarRequisicao', async (req, res) => {

    const { idRequisicao } = req.body;

    try {
        const resultado = await deletarRequisicao(idRequisicao);

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

app.post('/api/carregarRequisicao', async (req, res) => {

    const { idRequisicao } = req.body;

    try {
        const resultado = await carregarRequisicao(idRequisicao);

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

app.post('/api/atualizarStatusRequisicao', async (req, res) => {

    const { idRequisicao, statusRequisicao } = req.body;
    
    try {
        const resultado = await atualizarStatusRequisicao(idRequisicao, statusRequisicao);
        
        if (resultado) {
            res.json({ message: 'Atualizado com sucesso' });
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
        idUsuario: req.session.idPessoa,
        nomeUsuario: req.session.nome,
        emailUsuario: req.session.email,
        fotoUsuario: req.session.foto,
        tipoUsuario: req.session.tipoUsuario,
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
