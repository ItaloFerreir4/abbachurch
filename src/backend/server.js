require('dotenv').config();
const express = require('express');
const session = require('express-session');
const https = require('https');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const { recNovaSenha } = require('./usuarios');
const { verificarTokenConfirmacao } = require('./global');
const { autenticarUsuario, confirmarEmail, enviarRecEmail } = require('./auth');
const { saveImage } = require('./upload-imagem');
const { translateElements } = require('./translate');
const { listarNomePaises } = require('./paises');
const { listarDoacoes, cadastrarDoacao } = require('./doacoes');
const { listarPermissoes, atualizarPermissao, verificarPermissoes } = require('./permissoes');
const { cadastrarEmpresario,atualizarEmpresario } = require('./empresarios');
const { listarIgrejas, cadastrarIgreja, deletarIgreja, carregarIgreja, atualizarIgreja } = require('./igrejas');
const { listarEventos, cadastrarEvento, deletarEvento, carregarEvento, atualizarEvento } = require('./eventos');
const { listarEmpresas, cadastrarEmpresa, deletarEmpresa, carregarEmpresa, atualizarEmpresa } = require('./empresas');
const { listarSegmentos, cadastrarSegmento, deletarSegmento, carregarSegmento, atualizarSegmento } = require('./segmentos');
const { listarRelatorios, cadastrarRelatorio, deletarRelatorio, carregarRelatorio, atualizarRelatorio } = require('./relatorios');
const { listarCategorias, cadastrarCategoria, deletarCategoria, carregarCategoria, atualizarCategoria } = require('./categorias');
const { listarMinisterios, cadastrarMinisterio, deletarMinisterio, carregarMinisterio, atualizarMinisterio } = require('./ministerios');
const { listarAtendimentos, cadastrarAtendimento, deletarAtendimento, carregarAtendimento, atualizarAtendimento } = require('./atendimentos');
const { listarCriativos, cadastrarCriativo, deletarCriativo, carregarCriativo, atualizarCriativo, atualizarStatusCriativo } = require('./criativos');
const { listarRequisicoes, cadastrarRequisicao, deletarRequisicao, carregarRequisicao, atualizarRequisicao, atualizarStatusRequisicao } = require('./requisicoes');
const { listarCategoriasEventos, cadastrarCategoriaEvento, deletarCategoriaEvento, carregarCategoriaEvento, atualizarCategoriaEvento } = require('./categorias-eventos');
const { listarCategoriasRelatorio, cadastrarCategoriaRelatorio, deletarCategoriaRelatorio, carregarCategoriaRelatorio, atualizarCategoriaRelatorio, atualizarWidgetRelatorio } = require('./categorias-relatorio');
const { listarEventosVoluntario, listarTodasAcoes, listarVoluntariosEvento, cadastrarVoluntarioEvento, deletarVoluntarioEvento, carregarVoluntarioEvento, atualizarVoluntarioEvento } = require('./voluntarios-evento');
const { listarPessoas, cadastrarPessoa, cadastrarFilho, cadastrarVoluntario, deletarPessoa, carregarPessoa, atualizarPessoa, atualizarVoluntario, atualizarStatusVoluntario, alterarAdminPastor, cadastrarLider, deletarLider, isLider } = require('./pessoas');
const e = require('express');
const app = express();
const port = 3000;

process.env.TZ = 'America/Sao_Paulo';

app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.use('/html', express.static(path.join(__dirname, '../html')));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(cors());

app.use(cookieParser());
app.use(session({
    secret: 's3Cr3T4BbA',
    resave: false,
    saveUninitialized: true,
}));

const authenticateMiddleware = (req, res, next) => {
    if (['/login', '/reset-password', '/index', '/voluntariar', '/doar', '/empower', '/api/cadastrarDoacao', '/api/listarCategorias', '/api/listarNomePaises', '/api/cadastrarVoluntario', '/api/traduzirElemetos', '/esqueci-minha-senha', '/nova-senha', '/api/api-listagem-empresas', '/'].includes(req.url) || req.url.startsWith('/confirmar-email')  || req.url.startsWith('/recuperar-senha') ) {
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

app.get('/empower', (req, res) => { 
    const filePath = path.join(__dirname, '../html', 'empower.html');
    res.sendFile(filePath);
})

app.get('/doar', (req, res) => { 
    const filePath = path.join(__dirname, '../html', 'doar.html');
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

app.post('/api/traduzirElemetos', async (req, res) => {

    const { textoOriginal, idiomaOrigem, idiomaDestino } = req.body;

    try {
        const resposta = await translateElements(textoOriginal, idiomaOrigem, idiomaDestino);

        if (resposta) {
            res.json(resposta);
        } else {
            res.status(401).json({ message: 'Erro ao traduzir' });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }

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

app.post('/api/liderPastor', async (req, res) => {
    
    const { pessoaId, tipoUsuario } = req.body;

    try {

        let resultado;

        switch(tipoUsuario){
            case 'pastorLider':
                resultado = await isLider(pessoaId, 1);
                resultado = await cadastrarLider(pessoaId);
                break;
            case 'pastor':
                resultado = await isLider(pessoaId, 0);
                resultado = await deletarLider(pessoaId);
                break;
        }

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

    // const recaptchaToken = req.body.recaptchaToken;
    // const postData = `secret=6LfIkmApAAAAAKdUTiizCvzhHdPE1OZyhtlgVZGj&response=${recaptchaToken}`;
    // const options = {
    //     hostname: 'www.google.com',
    //     path: '/recaptcha/api/siteverify',
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Content-Length': postData.length,
    //     },
    // };

    // const verificationRequest = https.request(options, (verificationResponse) => {
    //     let responseData = '';

    //     verificationResponse.on('data', (chunk) => {
    //         responseData += chunk;
    //     });

    //     verificationResponse.on('end', async () => {
    //         try {
    //             const result = JSON.parse(responseData);
    //             if (result.success) {
                    
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

            //     } else {
            //         res.status(401).json({ message: 'Falha na verificação do reCAPTCHA.' });
            //     }
            // } catch (error) {
            //     res.status(401).json({ message: 'Erro interno.' });
            // }
        //});
    //});

    // verificationRequest.on('error', (error) => {
    //     res.status(401).json({ message: 'Erro interno.' });
    // });

    // verificationRequest.write(postData);
    // verificationRequest.end();

});

app.post('/api/cadastrarPessoa', async (req, res) => {

    const { tipoPessoa, pastorId, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, generoPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, categoriasVoluntario, igrejaId, habilidadesEmpresario } = req.body;
    
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
                    case 'empresario':
                        await cadastrarEmpresario(pessoa.insertId, pastorId, habilidadesEmpresario);
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

    const { idPessoa, pastorId, tipoPessoa, fotoPessoa, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, generoPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, changeAccess, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, categoriasVoluntario, igrejaId, habilidadesEmpresario } = req.body;

    try {

        const nomeFoto = fotoPessoa ? await saveImage(JSON.parse(fotoPessoa)) : 'semfoto.png';
        const resultado = await atualizarPessoa(idPessoa, tipoPessoa, nomeFoto, nomePessoa, emailPessoa, telefonePessoa, estadoCivilPessoa, generoPessoa, dataNascimentoPessoa, instagram, facebook, linkedin, senhaUsuario, changeAccess, profissaoPessoa, escolaridadePessoa, idiomaPessoa, nacionalidadePessoa, igrejaId);

        switch(tipoPessoa){
            case 'voluntario':
                const voluntario = await atualizarVoluntario(idPessoa, pastorId, categoriasVoluntario);
                console.log(voluntario);
            break;
            case 'empresario':
                const empresario = await atualizarEmpresario(idPessoa, pastorId, habilidadesEmpresario);
                console.log(habilidadesEmpresario);
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
        const lista = await listarRequisicoes(idUserLog, tipoUserLog, 0);

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

app.post('/api/listar3UltimasRequisicoes', async (req, res) => {

    const idUserLog = req.session.idPessoa;
    const tipoUserLog = req.session.tipoUsuario;

    try {
        const lista = await listarRequisicoes(idUserLog, tipoUserLog, 3);

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

    const { pessoaId, tipoUsuario, classificacaoRequisicao, informacoesRequisicao, departamentoEvento, nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, ambienteEvento, departamentosProducaoEvento, participacaoAbbaWorshipEvento, statusRequisicao } = req.body;
    
    try {
        const resultado = await cadastrarRequisicao(pessoaId, tipoUsuario, classificacaoRequisicao, informacoesRequisicao, departamentoEvento, nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, ambienteEvento, departamentosProducaoEvento, participacaoAbbaWorshipEvento, statusRequisicao);
        
        if (resultado == 'Cadastrado') {
            res.json({ message: 'Cadastrado com sucesso!', statusMessage: 'success' });
        } 
        else if(resultado == 'Existe'){
            res.json({ message: 'Já existe evento nessa data!', statusMessage: 'error' });
        }
        else {
            res.status(401).json({ message: 'Erro ao cadastrar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarRequisicao', async (req, res) => {

    const { idRequisicao, classificacaoRequisicao, informacoesRequisicao, departamentoEvento, nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, ambienteEvento, departamentosProducaoEvento, participacaoAbbaWorshipEvento } = req.body;
    const idPessoa = req.session.idPessoa;
    
    try {
        const resultado = await atualizarRequisicao(idPessoa, idRequisicao, classificacaoRequisicao, informacoesRequisicao, departamentoEvento, nomeEvento, dataHoraInicioEvento, dataHoraFimEvento, ambienteEvento, departamentosProducaoEvento, participacaoAbbaWorshipEvento);
        
        if (resultado == 'Atualizado') {
            res.json({ message: 'Atualizado com sucesso!', statusMessage: 'success' });
        } 
        else if(resultado == 'Existe'){
            res.json({ message: 'Já existe evento nessa data!', statusMessage: 'error' });
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

app.post('/api/listarCriativos', async (req, res) => {

    try {
        const lista = await listarCriativos();

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

app.post('/api/cadastrarCriativo', async (req, res) => {

    const { tituloCriativo, imagemCriativo, linkCriativo } = req.body;
    
    try {

        const nomeImagem = imagemCriativo != null  && imagemCriativo != '' ? await saveImage(JSON.parse(imagemCriativo)) : 'semfoto.png';
        const resultado = await cadastrarCriativo(tituloCriativo, nomeImagem, linkCriativo);
        
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

app.post('/api/atualizarCriativo', async (req, res) => {

    const { idCriativo, tituloCriativo, imagemCriativo, linkCriativo } = req.body;
    
    try {

        const nomeImagem = imagemCriativo != null  && imagemCriativo != '' ? await saveImage(JSON.parse(imagemCriativo)) : 'semfoto.png';
        const resultado = await atualizarCriativo(idCriativo, tituloCriativo, nomeImagem, linkCriativo);
        
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

app.post('/api/deletarCriativo', async (req, res) => {

    const { idCriativo } = req.body;

    try {
        const resultado = await deletarCriativo(idCriativo);

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

app.post('/api/carregarCriativo', async (req, res) => {

    const { idCriativo } = req.body;

    try {
        const resultado = await carregarCriativo(idCriativo);

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

app.post('/api/atualizarStatusCriativo', async (req, res) => {

    const { idCriativo, statusCriativo } = req.body;
    
    try {
        const resultado = await atualizarStatusCriativo(idCriativo, statusCriativo);
        
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

app.post('/api/listarCategoriasRelatorio', async (req, res) => {

    try {
        const lista = await listarCategoriasRelatorio();

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

app.post('/api/cadastrarCategoriaRelatorio', async (req, res) => {

    const { nomeCategoriaRelatorio } = req.body;
    
    try {
        const resultado = await cadastrarCategoriaRelatorio(nomeCategoriaRelatorio);
        
        if (resultado == 'Cadastrado') {
            res.json({ message: 'Cadastrado com sucesso!', statusMessage: 'success' });
        } 
        else if(resultado == 'Existe'){
            res.json({ message: 'Já existe cadastro com esse nome!', statusMessage: 'error' });
        }
        else {
            res.status(401).json({ message: 'Erro ao cadastrar' });
        }
    } catch (erro) {
        console.error('Erro:', erro);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});

app.post('/api/atualizarCategoriaRelatorio', async (req, res) => {

    const { idCategoriaRelatorio, nomeCategoriaRelatorio } = req.body;
    
    try {
        const resultado = await atualizarCategoriaRelatorio(idCategoriaRelatorio, nomeCategoriaRelatorio);
        
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

app.post('/api/deletarCategoriaRelatorio', async (req, res) => {

    const { idCategoriaRelatorio } = req.body;

    try {
        const resultado = await deletarCategoriaRelatorio(idCategoriaRelatorio);

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

app.post('/api/carregarCategoriaRelatorio', async (req, res) => {

    const { idCategoriaRelatorio } = req.body;

    try {
        const resultado = await carregarCategoriaRelatorio(idCategoriaRelatorio);

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

app.post('/api/listarRelatorios', async (req, res) => {

    try {
        const lista = await listarRelatorios('todosRelatorios');

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

app.post('/api/listarUltimosRelatorios', async (req, res) => {

    try {
        const lista = await listarRelatorios('totalUltimoRelatorio');

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

app.post('/api/cadastrarRelatorio', async (req, res) => {

    const { categoriaRelatorioId, dataHoraRelatorio, quantidadeRelatorio } = req.body;
    
    try {
        const resultado = await cadastrarRelatorio(categoriaRelatorioId, dataHoraRelatorio, quantidadeRelatorio);
        
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

app.post('/api/atualizarRelatorio', async (req, res) => {

    const { idRelatorio, categoriaRelatorioId, dataHoraRelatorio, quantidadeRelatorio } = req.body;
    
    try {
        const resultado = await atualizarRelatorio(idRelatorio, categoriaRelatorioId, dataHoraRelatorio, quantidadeRelatorio);
        
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

app.post('/api/deletarRelatorio', async (req, res) => {

    const { idRelatorio } = req.body;

    try {
        const resultado = await deletarRelatorio(idRelatorio);

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

app.post('/api/carregarRelatorio', async (req, res) => {

    const { idRelatorio } = req.body;

    try {
        const resultado = await carregarRelatorio(idRelatorio);

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

app.post('/api/atualizarWidgetRelatorio', async (req, res) => {

    const { idCategoriaRelatorio, widgetRelatorio } = req.body;
    
    try {
        const resultado = await atualizarWidgetRelatorio(idCategoriaRelatorio, widgetRelatorio);
        
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

app.post('/api/listarDoacoes', async (req, res) => {

    try {
        const lista = await listarDoacoes();

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

app.post('/api/cadastrarDoacao', async (req, res) => {

    const { valorDoacao } = req.body;
    
    try {
        const resultado = await cadastrarDoacao(valorDoacao);
        
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

app.post('/api/listarEventosVoluntario', async (req, res) => {

    const pessoaId = req.session.idPessoa;

    try {
        const lista = await listarEventosVoluntario(pessoaId);

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

app.post('/api/listarEmpresas', async (req, res) => {

    try {
        const lista = await listarEmpresas('normal');

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

app.post('/api/cadastrarEmpresa', async (req, res) => {

    const { imagemEmpresa, nomeEmpresa, nomeEmpresarioEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, enderecoEmpresa, segmentoEmpresa, iframeMapaEmpresa, instagram, facebook, linkedin } = req.body;
    
    try {

        const nomeImagem = imagemEmpresa != null  && imagemEmpresa != '' ? await saveImage(JSON.parse(imagemEmpresa)) : 'semfoto.png';
        const resultado = await cadastrarEmpresa(nomeImagem, nomeEmpresa, nomeEmpresarioEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, enderecoEmpresa, segmentoEmpresa, iframeMapaEmpresa, instagram, facebook, linkedin);
        
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

app.post('/api/atualizarEmpresa', async (req, res) => {

    const { idEmpresa, imagemEmpresa, nomeEmpresa, nomeEmpresarioEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, enderecoEmpresa, segmentoEmpresa, iframeMapaEmpresa, instagram, facebook, linkedin } = req.body;
    
    try {

        const nomeImagem = imagemEmpresa != null  && imagemEmpresa != '' ? await saveImage(JSON.parse(imagemEmpresa)) : 'semfoto.png';
        const resultado = await atualizarEmpresa(idEmpresa, nomeImagem, nomeEmpresa, nomeEmpresarioEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, enderecoEmpresa, segmentoEmpresa, iframeMapaEmpresa, instagram, facebook, linkedin);
        
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

app.post('/api/deletarEmpresa', async (req, res) => {

    const { idEmpresa } = req.body;

    try {
        const resultado = await deletarEmpresa(idEmpresa);

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

app.post('/api/carregarEmpresa', async (req, res) => {

    const { idEmpresa } = req.body;

    try {
        const resultado = await carregarEmpresa(idEmpresa);

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

app.post('/api/listarSegmentos', async (req, res) => {

    try {
        const lista = await listarSegmentos();

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

app.post('/api/cadastrarSegmento', async (req, res) => {

    const { nomeSegmento } = req.body;
    
    try {
        const resultado = await cadastrarSegmento(nomeSegmento);
        
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

app.post('/api/atualizarSegmento', async (req, res) => {

    const { idSegmento, nomeSegmento } = req.body;
    
    try {
        const resultado = await atualizarSegmento(idSegmento, nomeSegmento);
        
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

app.post('/api/deletarSegmento', async (req, res) => {

    const { idSegmento } = req.body;

    try {
        const resultado = await deletarSegmento(idSegmento);

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

app.post('/api/carregarSegmento', async (req, res) => {

    const { idSegmento } = req.body;

    try {
        const resultado = await carregarSegmento(idSegmento);

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

app.post('/api/listarAtendimentos', async (req, res) => {

    const { tipoListagem, atendidoAtendimento } = req.body;

    try {
        const lista = await listarAtendimentos(tipoListagem, atendidoAtendimento);

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

app.post('/api/cadastrarAtendimento', async (req, res) => {

    const { atendidoAtendimento, tituloAtendimento, anotacaoAtendimento, dataAtendimento } = req.body;
    
    const atendenteAtendimento = req.session.idPessoa;

    try {
        const resultado = await cadastrarAtendimento(atendenteAtendimento, atendidoAtendimento, tituloAtendimento, anotacaoAtendimento, dataAtendimento);
        
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

app.post('/api/atualizarAtendimento', async (req, res) => {

    const { idAtendimento, atendenteAtendimento, atendidoAtendimento, tituloAtendimento, anotacaoAtendimento, dataAtendimento } = req.body;
    
    try {
        const resultado = await atualizarAtendimento(idAtendimento, atendenteAtendimento, atendidoAtendimento, tituloAtendimento, anotacaoAtendimento, dataAtendimento);
        
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

app.post('/api/deletarAtendimento', async (req, res) => {

    const { idAtendimento } = req.body;

    try {
        const resultado = await deletarAtendimento(idAtendimento);

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

app.post('/api/carregarAtendimento', async (req, res) => {

    const { idAtendimento } = req.body;

    try {
        const resultado = await carregarAtendimento(idAtendimento);

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

app.post('/api/listarPermissoes', async (req, res) => {

    const { tipoListagem, pessoaId } = req.body;

    try {
        const lista = await listarPermissoes(tipoListagem, pessoaId);

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

app.post('/api/permissoes', async (req, res) => {

    const pessoaId = req.session.idPessoa;

    try {
        const lista = await listarPermissoes('pessoa', pessoaId);

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

app.post('/api/atualizarPermissao', async (req, res) => {

    const { pessoaId, nomePermissao, valorPermissao } = req.body;
    
    try {
        const resultado = await atualizarPermissao(pessoaId, nomePermissao, valorPermissao);
        
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

app.post('/api/verificar-permissao', async (req, res) => {

    const { page } = req.body;
    const tipoUser = req.session.tipoUsuario;
    const pessoaId = req.session.idPessoa;
    const permissoesPage =  [
        { page: '/cadastrar-atendimento', roles: ['atendimento'] },
        { page: '/editar-atendimento', roles: ['atendimento'] },
        { page: '/timeline-atendimento', roles: ['atendimento'] },
        { page: '/listar-atendimentos', roles: ['atendimento'] },
    ];

    const permissoes = permissoesPage.find(item => item.page === page);

    if (permissoes && tipoUser != 0) {
        const resultado = await verificarPermissoes(pessoaId, permissoes.roles);
        if(!resultado){
            res.json({ redirect: '/home' });
        }
    } else {
        console.log('Nenhuma permissão encontrada para a página:', page);
        res.json({ message: 'Não irá redirecionar' });
    }

});

app.get('/api/api-listagem-empresas', async (req, res) => {

    try {
        const listaEmpresa = await listarEmpresas('redes');
        const listaSegmentos = await listarSegmentos();

        const listasAgrupadas = {
            ListaEmpresas: listaEmpresa,
            ListaSegmentos: listaSegmentos
        };

        if (listasAgrupadas) {
            res.json(listasAgrupadas);
        } else {
            res.status(401).json({ message: 'Erro ao listar' });
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