const mysql = require('mysql2');
const config = require('./config/conexao-bd');

function executarQuery(query, callback) {

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

module.exports = executarQuery;