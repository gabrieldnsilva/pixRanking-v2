<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../config/dbConfig.php";

try {
    $body = json_decode(file_get_contents("php://input"), true);
    $email = isset($body["email"]) ? trim($body["email"]) : "";
    $token = isset($body["token"]) ? trim($body["token"]) : "";
    $newPass = isset($body["password"]) ? $body["password"] : "";

    // Validações básicas
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($token) < 64 || strlen($newPass) < 6) {
        http_response_code(400);
        echo json_encode(["message" => "Dados inválidos. Verifique o formulário."]);
        exit;
    }

    $pdo = connect_db();

    // Busca usuário e token
    $stmt = $pdo->prepare("
        SELECT id, reset_token_hash, reset_token_expires_at 
          FROM ranking_usuarios 
         WHERE email = :email 
         LIMIT 1
    ");
    $stmt->execute([":email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || empty($user["reset_token_hash"]) || empty($user["reset_token_expires_at"])) {
        http_response_code(400);
        echo json_encode(["message" => "Link inválido ou expirado. Solicite um novo."]);
        exit;
    }

    // Valida token e expiração
    $now = new DateTime();
    $expires = new DateTime($user["reset_token_expires_at"]);
    $tokenHash = hash("sha256", $token);

    if (!hash_equals($user["reset_token_hash"], $tokenHash)) {
        http_response_code(400);
        echo json_encode(["message" => "Token inválido."]);
        exit;
    }

    if ($now > $expires) {
        http_response_code(400);
        echo json_encode(["message" => "Link expirado. Solicite um novo."]);
        exit;
    }

    // Gera novo hash de senha (Argon2id)
    $newHash = password_hash($newPass, PASSWORD_ARGON2ID);

    // Atualiza senha e limpa token
    $upd = $pdo->prepare("
        UPDATE ranking_usuarios
           SET senha = :p, 
               reset_token_hash = NULL, 
               reset_token_expires_at = NULL
         WHERE id = :id
    ");
    $upd->execute([":p" => $newHash, ":id" => $user["id"]]);

    echo json_encode(["message" => "Senha redefinida com sucesso! Faça login."]);
} catch (Throwable $e) {
    error_log("Erro em reset_password.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Erro no servidor. Tente novamente."]);
}
