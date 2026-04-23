CREATE TABLE ranking_usuarios (
    id varchar(36) PRIMARY KEY,
    departamento ENUM(
        "Informatica",
        "Cadastro",
        "Gerencia",
        "Frente de Caixa"
    ) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE ranking_operadoras(
    numero_operadora INT PRIMARY KEY,
    nome_operadora VARCHAR(255) NOT NULL
);
CREATE TABLE ranking_relatorios_salvos(
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    data_inicial DATE NOT NULL,
    data_final DATE NOT NULL,
    data_geracao TIMESTAMP NOT NULL,
    dados_relatorio JSON NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES ranking_usuarios (id) ON DELETE CASCADE
);