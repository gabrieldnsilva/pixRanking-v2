<?php
// test_db.php (criar na raiz do projeto)

require_once __DIR__ . "/config/dbConfig.php";

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS
    );
    echo "✅ Conexão bem-sucedida!";
} catch (PDOException $e) {
    echo "❌ Erro: " . $e->getMessage();
}
