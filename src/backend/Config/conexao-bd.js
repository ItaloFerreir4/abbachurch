const mysql = require('mysql2');

// Configurações da conexão com o banco de dados
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  };

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

executarConsulta('SELECT * FROM pastores', (erro, resultados) => {
    if (erro) {
        console.error('Erro durante a execução da consulta:', erro);
        return;
    }
    
    console.log('Resultados: ', resultados);

    // Faça algo com os resultados aqui
});