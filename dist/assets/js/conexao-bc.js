const mysql = require('mysql2');

// Configurações da conexão com o banco de dados
const conexaoBanco = mysql.createConnection({
    host: '162.241.3.15',
    user: 'italof39_admin',
    password: 'WFG7wSx)}8nX',
    database: 'italof39_abbachurch',
});

function executarConsulta(query, callback) {
    const conexaoBanco = mysql.createConnection(config);

    conexaoBanco.connect((erroConexao) => {
        if (erroConexao) {
            console.error('Erro ao conectar ao banco de dados:', erroConexao);
            return callback(erroConexao, null);
        }

        console.log('Conectado ao banco de dados MySQL');

        conexaoBanco.query(query, (erroConsulta, resultados) => {
            if (erroConsulta) {
                console.error('Erro na consulta:', erroConsulta);
                callback(erroConsulta, null);
            } else {
                console.log('Resultados da consulta:', resultados);
                callback(null, resultados);
            }

            conexaoBanco.end((erroFechamento) => {
                if (erroFechamento) {
                    console.error('Erro ao fechar a conexão:', erroFechamento);
                } else {
                    console.log('Conexão fechada');
                }
            });
        });
    });
}

console.log("conexaoBanco");