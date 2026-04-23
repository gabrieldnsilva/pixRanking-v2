<?php

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// CORRIGIDO: Caminho correto para dbConfig.php
require_once __DIR__ . "/../../config/dbConfig.php";

function getPdo()
{
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    return new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

try {
    $pdo = getPdo();

    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        $stmt = $pdo->query("SELECT numero_operadora, nome_operadora FROM ranking_operadoras ORDER BY numero_operadora ASC");
        echo json_encode($stmt->fetchAll());
        exit;
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $body = json_decode(file_get_contents("php://input"), true);
        if (!is_array($body)) {
            http_response_code(400);
            echo json_encode(["message" => "Payload inválido"]);
            exit;
        }

        $pdo->beginTransaction();

        // ✅ TRUNCATE e INSERT sem try-catch aninhado
        $pdo->exec("TRUNCATE TABLE ranking_operadoras");
        $insert = $pdo->prepare("INSERT INTO ranking_operadoras (numero_operadora, nome_operadora) VALUES (:numero, :nome)");

        foreach ($body as $op) {
            if (!isset($op["numero_operadora"], $op["nome_operadora"])) continue;
            $insert->execute([
                ":numero" => (int)$op["numero_operadora"],
                ":nome"   => trim($op["nome_operadora"]),
            ]);
        }

        $pdo->commit();

        // ✅ Enviar resposta e terminar IMEDIATAMENTE
        http_response_code(200);
        echo json_encode(["message" => "Operadoras salvas com sucesso"]);
        exit;
    }

    // Método não suportado
    http_response_code(405);
    echo json_encode(["message" => "Método não suportado"]);
    exit;
} catch (Throwable $e) {
    // ✅ Rollback SOMENTE se transação ainda estiver ativa
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        "message" => "Erro no servidor",
        "error" => $e->getMessage()
    ]);
    exit;
}
