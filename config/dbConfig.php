<?php

// ./config/dbConfig.php

// --- Configurações do banco de dados MariaDB ---
define("DB_HOST", "localhost");
define("DB_NAME", "atc_portal");
define("DB_USER", "filial945");
define("DB_PASS", "senhafilial");

// --- Configurações de Cabeçalho para a API ---
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

/**
 * Função para conectar ao banco de dados MariaDB (MySQL) e garantir que as tabelas existam.
 * @return PDO A instância da conexão PDO.
 */
function connect_db()
{
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $event) {
        http_response_code(500); // Internal Server Error
        echo json_encode((["success" => false, "message" => "Erro ao conectar ao banco de dados: " . $event->getMessage()]));
        exit();
    }
}
