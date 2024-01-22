-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 22/01/2024 às 14:47
-- Versão do servidor: 5.7.23-23
-- Versão do PHP: 8.1.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `italof39_abbachurch`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `idCategoria` int(11) NOT NULL,
  `nomeCategoria` varchar(500) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `categorias`
--

INSERT INTO `categorias` (`idCategoria`, `nomeCategoria`) VALUES
(2, 'habilidade'),
(3, 'habilidade 2'),
(4, 'habilidade 3'),
(5, 'habilidade 1'),
(6, 'habilidade 2');

-- --------------------------------------------------------

--
-- Estrutura para tabela `categoriasEventos`
--

CREATE TABLE `categoriasEventos` (
  `idCategoriaEvento` int(11) NOT NULL,
  `nomeCategoriaEvento` varchar(200) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `categoriasEventos`
--

INSERT INTO `categoriasEventos` (`idCategoriaEvento`, `nomeCategoriaEvento`) VALUES
(2, 'Aniversário'),
(3, 'categoria evento 2'),
(4, 'Categoria 3');

-- --------------------------------------------------------

--
-- Estrutura para tabela `esposas`
--

CREATE TABLE `esposas` (
  `idEsposa` int(11) NOT NULL,
  `pessoaId` int(11) NOT NULL,
  `pastorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `esposas`
--

INSERT INTO `esposas` (`idEsposa`, `pessoaId`, `pastorId`) VALUES
(6, 74, 27),
(8, 86, 30);

-- --------------------------------------------------------

--
-- Estrutura para tabela `eventos`
--

CREATE TABLE `eventos` (
  `idEvento` int(11) NOT NULL,
  `nomeEvento` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `dataHoraInicioEvento` datetime NOT NULL,
  `dataHoraFimEvento` datetime NOT NULL,
  `localEvento` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `ministerioId` int(11) NOT NULL,
  `observacoesEvento` text COLLATE utf8_unicode_ci NOT NULL,
  `categoriaEventoId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `eventos`
--

INSERT INTO `eventos` (`idEvento`, `nomeEvento`, `dataHoraInicioEvento`, `dataHoraFimEvento`, `localEvento`, `ministerioId`, `observacoesEvento`, `categoriaEventoId`) VALUES
(23, 'Evento 1', '2024-01-16 13:00:00', '2024-01-30 13:00:00', 'Rio de Janeiro', 4, 'teste', 3),
(24, 'Evento 2', '2024-01-18 13:00:00', '2024-01-30 13:00:00', 'Rio de Janeiro', 4, 'teste', 3),
(25, 'Evento 3', '2024-01-18 13:00:00', '2024-01-30 13:00:00', 'Rio de Janeiro', 4, 'teste', 4),
(26, 'Evento 4', '2024-01-15 12:00:00', '2024-01-08 12:00:00', 'Rio de Janeiro', 5, 'Evento 4', 2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `filhos`
--

CREATE TABLE `filhos` (
  `idFilho` int(11) NOT NULL,
  `pessoaId` int(11) NOT NULL,
  `pastorId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `igrejas`
--

CREATE TABLE `igrejas` (
  `idIgreja` int(11) NOT NULL,
  `nomeIgreja` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `paisIgreja` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `estadoIgreja` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `enderecoIgreja` varchar(1000) COLLATE utf8_unicode_ci NOT NULL,
  `cepIgreja` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `telefoneIgreja` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `emailIgreja` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `tipoIgreja` int(11) NOT NULL,
  `matrizId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `igrejas`
--

INSERT INTO `igrejas` (`idIgreja`, `nomeIgreja`, `paisIgreja`, `estadoIgreja`, `enderecoIgreja`, `cepIgreja`, `telefoneIgreja`, `emailIgreja`, `tipoIgreja`, `matrizId`) VALUES
(7, 'Igreja Matriz', 'Brasil', 'São Paulo', 'Rua VW', '12109831', '9999999', 'igreja@email.com', 0, 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `lideres`
--

CREATE TABLE `lideres` (
  `idLider` int(11) NOT NULL,
  `pessoaId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `lideres`
--

INSERT INTO `lideres` (`idLider`, `pessoaId`) VALUES
(15, 79),
(16, 87);

-- --------------------------------------------------------

--
-- Estrutura para tabela `ministerios`
--

CREATE TABLE `ministerios` (
  `idMinisterio` int(11) NOT NULL,
  `nomeMinisterio` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `liderId` int(11) NOT NULL,
  `dataEntradaMinisterio` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `ministerios`
--

INSERT INTO `ministerios` (`idMinisterio`, `nomeMinisterio`, `liderId`, `dataEntradaMinisterio`) VALUES
(4, 'Ministerio 1', 79, '2024-01-18'),
(5, 'Ministerio 2', 87, '2024-01-23');

-- --------------------------------------------------------

--
-- Estrutura para tabela `pastores`
--

CREATE TABLE `pastores` (
  `idPastor` int(11) NOT NULL,
  `pessoaId` int(11) NOT NULL,
  `igrejaId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `pastores`
--

INSERT INTO `pastores` (`idPastor`, `pessoaId`, `igrejaId`) VALUES
(27, 73, 7),
(30, 85, 7);

-- --------------------------------------------------------

--
-- Estrutura para tabela `pessoas`
--

CREATE TABLE `pessoas` (
  `idPessoa` int(11) NOT NULL,
  `fotoPessoa` longtext COLLATE utf8_unicode_ci NOT NULL,
  `nomePessoa` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `emailPessoa` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `telefonePessoa` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `estadoCivilPessoa` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `dataNascimentoPessoa` date DEFAULT NULL,
  `profissaoPessoa` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `escolaridadePessoa` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `idiomaPessoa` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `redeSocialId` int(11) NOT NULL,
  `nacionalidadePessoa` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `dataEntradaPessoa` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `pessoas`
--

INSERT INTO `pessoas` (`idPessoa`, `fotoPessoa`, `nomePessoa`, `emailPessoa`, `telefonePessoa`, `estadoCivilPessoa`, `dataNascimentoPessoa`, `profissaoPessoa`, `escolaridadePessoa`, `idiomaPessoa`, `redeSocialId`, `nacionalidadePessoa`, `dataEntradaPessoa`) VALUES
(72, 'semfoto.png', 'admin', 'admin@email.com', '999999999', 'Solteiro(a)', '2024-01-24', 'ad', 'Prefiro não dizer', 'Ingles', 0, 'Albania', '2024-01-18'),
(73, 'image_1705793436121.png', '@Pastor', 'pastor@email.com', '999999999', 'Casado(a)', '2024-01-11', 'Teste', '6º ao 9º Ano do Fundamental', 'Ingles', 0, 'Afghanistan', '2024-01-18'),
(74, 'semfoto.png', 'esposa teste', '', '999999999', 'undefined', '1899-11-30', 'undefined', 'Doutorado', 'Ingles', 0, 'Anguilla', '2024-01-18'),
(75, 'semfoto.png', 'Italo', 'italo.s.ferreira@hotmail.com', '9999999999', 'Solteiro(a)', '2024-01-23', 'Dev', 'Superior Completo', 'Ingles,Espanhol', 0, 'Afghanistan', '2024-01-18'),
(79, 'semfoto.png', 'Lider', 'lider@email.com', '999999999', 'Solteiro(a)', '2024-01-23', 'Dev', 'Prefiro não dizer', 'Espanhol', 0, 'Albania', '2024-01-19'),
(80, 'semfoto.png', 'Voluntario', 'voluntario@email.com', '9999999999', 'Solteiro(a)', '2024-01-25', 'Dev', 'Mestrado', 'Ingles', 0, 'Anguilla', '2024-01-19'),
(84, 'semfoto.png', 'Voluntario2', 'voluntario1@email.com', '111111111', 'Solteiro(a)', '1111-11-11', 'dev', 'Doutorado', 'Português', 0, 'Aruba', '2024-01-19'),
(85, 'image_1705696690414.png', 'Pastor 2', 'pastor2@email.com', '999999999', 'Solteiro(a)', '2024-01-09', 'Dev', 'Superior Incompleto', 'Espanhol', 0, 'Antigua and Barbuda', '2024-01-19'),
(86, '', '', '', '', '', '0000-00-00', 'undefined', 'undefined', 'undefined', 0, 'undefined', '2024-01-19'),
(87, 'image_1705696903623.png', 'Lider2', 'lider2@email.com', '111111111', 'Solteiro(a)', '1111-11-11', 'dev', 'Médio Completo', 'Espanhol,Outros', 0, 'Bulgaria', '2024-01-19'),
(88, 'semfoto.png', 'voluntario', 'voluntario2@email.com', '999999999', 'Solteiro(a)', '2024-01-01', 'voluntario', '6º ao 9º Ano do Fundamental', 'Ingles,Outros', 0, 'Belgium', '2024-01-20');

-- --------------------------------------------------------

--
-- Estrutura para tabela `redessociais`
--

CREATE TABLE `redessociais` (
  `idRedeSocial` int(11) NOT NULL,
  `pessoaId` int(11) NOT NULL,
  `instagram` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `facebook` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `linkedin` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `redessociais`
--

INSERT INTO `redessociais` (`idRedeSocial`, `pessoaId`, `instagram`, `facebook`, `linkedin`) VALUES
(52, 71, '', '', ''),
(53, 72, '', '', ''),
(54, 74, '', '', ''),
(55, 73, '', '', ''),
(56, 75, '', '', ''),
(57, 76, '', '', ''),
(58, 77, '', '', ''),
(59, 78, '', '', ''),
(60, 79, '', '', ''),
(61, 80, '', '', ''),
(62, 83, '', '', ''),
(63, 82, '', '', ''),
(64, 84, '', '', ''),
(65, 86, '', '', ''),
(66, 85, '', '', ''),
(67, 87, '', '', ''),
(68, 88, '', '', '');

-- --------------------------------------------------------

--
-- Estrutura para tabela `requisicoes`
--

CREATE TABLE `requisicoes` (
  `idRequisicao` int(11) NOT NULL,
  `pessoaId` int(11) NOT NULL,
  `tipoUsuario` int(11) NOT NULL,
  `classificacaoRequisicao` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `informacoesRequisicao` text COLLATE utf8_unicode_ci NOT NULL,
  `statusRequisicao` int(11) NOT NULL COMMENT '0 - Pendente\r\n1 - Ativo\r\n2 - Recusado',
  `dataRequisicao` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `requisicoes`
--

INSERT INTO `requisicoes` (`idRequisicao`, `pessoaId`, `tipoUsuario`, `classificacaoRequisicao`, `informacoesRequisicao`, `statusRequisicao`, `dataRequisicao`) VALUES
(3, 73, 1, 'Evento', 'teste', 1, '2024-01-18'),
(5, 73, 1, 'Lider', 'teste', 0, '2024-01-18'),
(6, 73, 1, 'Evento', 'eve', 2, '2024-01-18'),
(7, 73, 1, 'Evento', 'Lorem ipsum dolor sit amet. Id recusandae commodi ab laboriosam repellendus cum maiores architecto rem sunt reiciendis eum fugiat consequuntur qui sunt rerum. Ut accusantium dignissimos et dolores facilis et perferendis quaerat et fuga inventore est quia modi ut repudiandae ullam id cumque facere. Sed quia nihil qui voluptas facilis non dolore unde a sint iusto? Ut voluptas voluptates sit galisum optio eos eaque atque et optio rerum a natus neque.\r\n\r\nEt harum dolorem qui incidunt molestiae sit galisum quidem ut voluptatum deserunt qui harum dolores. Et autem quod sit voluptate facilis id corrupti illo est consectetur amet aut Quis sint ab incidunt porro.', 0, '2024-01-18'),
(8, 73, 1, 'Voluntario', 'teste', 0, '2024-01-18'),
(9, 73, 1, 'Voluntario', 'teste', 0, '2024-01-18'),
(10, 73, 1, 'Voluntario', 'teste', 0, '2024-01-18'),
(11, 75, 0, 'Voluntario', 'teste', 0, '2024-01-18'),
(12, 79, 2, 'Evento', 'teste lider', 0, '2024-01-19'),
(13, 73, 1, 'Evento', 'Evento 123', 1, '2024-01-20');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `idUsuario` int(11) NOT NULL,
  `pessoaId` int(11) NOT NULL,
  `senhaUsuario` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `tipoUsuario` int(11) NOT NULL COMMENT '0 - Admin\r\n1 - Pastor\r\n2 - Lider\r\n3 - Ministerios\r\n4 - Voluntarios',
  `statusUsuario` int(11) NOT NULL COMMENT '0 - Aguardando 1 -  Ativo 2 - Desativado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`idUsuario`, `pessoaId`, `senhaUsuario`, `tipoUsuario`, `statusUsuario`) VALUES
(20, 72, '$2b$12$V.H2.6mP4LWWfAJP/H7gF.xXJnPvXwdkEbZI3hoHFdN3Pvs./SuUu', 0, 1),
(21, 73, '$2b$12$Bjyko6fVh/mABi4krbB7IOrJYrKhaB4pfKjkBH3Ca7.15wuHVzdM2', 1, 1),
(22, 75, '$2b$12$IjygfsAwMNq/t2gQkXE7aOgbeXzCHurln.gZw95e1PuJPnYj5ti8K', 0, 1),
(23, 76, '$2b$12$yGRa1yXG8lNJo4LV4aXLrOZA7KHDigsicDphZQOTPFHLPDV1lkEKy', 4, 1),
(26, 79, '$2b$12$u0C0FGxXg1B2o1XFUq0Ek.tcbQGrZWwp3BfEiBUcOg0xMl22hQYCW', 2, 1),
(27, 80, '$2b$12$piB1L6BYcntPaGp.6F3NvuCqDBBurPK0UBXW4gvMr5ywczNZ1Jf2a', 4, 1),
(29, 84, '$2b$12$OFaeXEBuX7u8wD6vd5zEze4Me3PIKzup/ZYSGpAFhoJdd8aBYGxf2', 4, 1),
(30, 85, '$2b$12$KbpDZzrWJrtCE26P1vG7W.hJFss3myU82i2EC2f953esLVPnNHXWO', 1, 1),
(31, 87, '$2b$12$ZqXhNJ3tHlL59Y8pQ0QoSOFeiskhLNbLTsXX26PtdovE3pj2ryMJO', 2, 1),
(32, 88, '$2b$12$V27I9Vl394YHOOAfgey09e.wBw3Pp1fvi3EgZHd04tu1hTpK.Io2i', 4, 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `voluntarios`
--

CREATE TABLE `voluntarios` (
  `idVoluntario` int(11) NOT NULL,
  `pessoaId` int(11) NOT NULL,
  `pastorId` int(11) NOT NULL,
  `categoriasVoluntario` varchar(1000) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `voluntarios`
--

INSERT INTO `voluntarios` (`idVoluntario`, `pessoaId`, `pastorId`, `categoriasVoluntario`) VALUES
(18, 80, 73, 'habilidade 2'),
(19, 84, 0, 'habilidade 2'),
(20, 88, 0, 'habilidade 2');

-- --------------------------------------------------------

--
-- Estrutura para tabela `voluntariosEvento`
--

CREATE TABLE `voluntariosEvento` (
  `idvoluntariosEvento` int(11) NOT NULL,
  `voluntarioId` int(11) NOT NULL,
  `eventoId` int(11) NOT NULL,
  `categoria` varchar(200) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`idCategoria`);

--
-- Índices de tabela `categoriasEventos`
--
ALTER TABLE `categoriasEventos`
  ADD PRIMARY KEY (`idCategoriaEvento`);

--
-- Índices de tabela `esposas`
--
ALTER TABLE `esposas`
  ADD PRIMARY KEY (`idEsposa`);

--
-- Índices de tabela `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`idEvento`);

--
-- Índices de tabela `filhos`
--
ALTER TABLE `filhos`
  ADD PRIMARY KEY (`idFilho`);

--
-- Índices de tabela `igrejas`
--
ALTER TABLE `igrejas`
  ADD PRIMARY KEY (`idIgreja`);

--
-- Índices de tabela `lideres`
--
ALTER TABLE `lideres`
  ADD PRIMARY KEY (`idLider`);

--
-- Índices de tabela `ministerios`
--
ALTER TABLE `ministerios`
  ADD PRIMARY KEY (`idMinisterio`);

--
-- Índices de tabela `pastores`
--
ALTER TABLE `pastores`
  ADD PRIMARY KEY (`idPastor`);

--
-- Índices de tabela `pessoas`
--
ALTER TABLE `pessoas`
  ADD PRIMARY KEY (`idPessoa`);

--
-- Índices de tabela `redessociais`
--
ALTER TABLE `redessociais`
  ADD PRIMARY KEY (`idRedeSocial`);

--
-- Índices de tabela `requisicoes`
--
ALTER TABLE `requisicoes`
  ADD PRIMARY KEY (`idRequisicao`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idUsuario`);

--
-- Índices de tabela `voluntarios`
--
ALTER TABLE `voluntarios`
  ADD PRIMARY KEY (`idVoluntario`);

--
-- Índices de tabela `voluntariosEvento`
--
ALTER TABLE `voluntariosEvento`
  ADD PRIMARY KEY (`idvoluntariosEvento`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `idCategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `categoriasEventos`
--
ALTER TABLE `categoriasEventos`
  MODIFY `idCategoriaEvento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `esposas`
--
ALTER TABLE `esposas`
  MODIFY `idEsposa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `eventos`
--
ALTER TABLE `eventos`
  MODIFY `idEvento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de tabela `filhos`
--
ALTER TABLE `filhos`
  MODIFY `idFilho` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `igrejas`
--
ALTER TABLE `igrejas`
  MODIFY `idIgreja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `lideres`
--
ALTER TABLE `lideres`
  MODIFY `idLider` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `ministerios`
--
ALTER TABLE `ministerios`
  MODIFY `idMinisterio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `pastores`
--
ALTER TABLE `pastores`
  MODIFY `idPastor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de tabela `pessoas`
--
ALTER TABLE `pessoas`
  MODIFY `idPessoa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT de tabela `redessociais`
--
ALTER TABLE `redessociais`
  MODIFY `idRedeSocial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT de tabela `requisicoes`
--
ALTER TABLE `requisicoes`
  MODIFY `idRequisicao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de tabela `voluntarios`
--
ALTER TABLE `voluntarios`
  MODIFY `idVoluntario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de tabela `voluntariosEvento`
--
ALTER TABLE `voluntariosEvento`
  MODIFY `idvoluntariosEvento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
