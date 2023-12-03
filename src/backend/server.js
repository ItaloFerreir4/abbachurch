const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const executarQuery = require('./consulta');

const app = express();
const port = 3000;

// Configuração para servir arquivos estáticos no diretório
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../html')));

app.use(bodyParser.json()); // Adicione essa linha para configurar o body-parser para tratar JSON

// Rota para a consulta SQL
app.post('/consultarPastores', (req, res) => {

    const query = 'SELECT * FROM pastores';

    executarQuery(query, (erro, resultados) => {
        if (erro) {
            console.error('Erro durante a execução da consulta:', erro);
            res.status(500).json({ error: 'Erro durante a execução da consulta' });
            return;
        }

        // Envie os resultados como resposta JSON
        res.json(resultados);
    });
});

app.post('/cadastrarPastor', (req, res) => {

    console.log('valor post: ', req.body);

    const { pessoaId } = req.body;

    const query = `INSERT INTO pastores (pessoaId) VALUES (${pessoaId})`;

    executarQuery(query, (erro, resultados) => {
        if (erro) {
            console.error('Erro durante a execução:', erro);
            res.status(500).json({ error: 'Erro durante a execução' });
            return;
        }

        // Envie os resultados como resposta JSON
        res.json(resultados);
    });
});

// Rota padrão, pode ser usada para servir a página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../html', 'index.html'));
});

// Inicie o servidor
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});