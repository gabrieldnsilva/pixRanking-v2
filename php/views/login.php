<?php

// Importações
require_once "./config/dbConfig.php";
require_once "./models/Usuario.php";

session_start();

// Verifica o Content-Type
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if ($contentType !== "application/json") {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Content-Type deve ser application/json']);
    exit();
}

// Pega os dados JSON enviados pelo front-end
$inputJSON = file_get_contents("php://input");
$data = json_decode($inputJSON);

// Valida se o JSON foi decodificado corretamente
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
    exit();
}

// Validação básica dos dados recebidos
if (!isset($data->email) || !isset($data->senha)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Email e senha são obrigatórios.']);
    exit();
}

try {
    $db = connect_db();
    $usuarioModel = new Usuario($db);

    // Busca o usuário pelo email
    $usuario = $usuarioModel->findByEmail($data->email);

    if ($usuario && password_verify($data->senha, $usuario["senha"])) {
        // Login bem-sucedido - configura a sessão
        $_SESSION["user_id"] = $usuario["id"];
        $_SESSION["email"] = $usuario["email"];
        $_SESSION["departamento"] = $usuario["departamento"];
        $_SESSION["loggedin"] = true;

        error_log("Usuário autenticado: " . print_r($_SESSION, true));

        echo json_encode([
            "success" => true,
            "message" => "Login bem-sucedido!"
        ]);
    } else {
        // Autenticação falhou
        error_log("Falha na autenticação para email: " . $data->email);
        http_response_code(401); // Unauthorized
        echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos.']);
    }
} catch (PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Erro ao processar login: ' . $e->getMessage()]);
    error_log("Erro PDO no login: " . $e->getMessage());
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Erro inesperado no login: ' . $e->getMessage()]);
    error_log("Erro geral no login: " . $e->getMessage());
}
