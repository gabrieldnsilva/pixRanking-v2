<?php

// Inicia a sessão PHP (necessário para gerenciar sessões de usuário)
session_start();

// Importações
require_once "/home/gabrieldnsilva/projects/rankingPixDebito/config/dbConfig.php";
require_once "/home/gabrieldnsilva/projects/rankingPixDebito/api/models/Usuario.php";

// Pega os dados JSON enviados pelo front-end
$data = json_decode(file_get_contents("php://input"));

// Validação básica dos dados recebidos
if (!isset($data->email) || !isset($data->senha)) {
    http_response_code(400); // Bad Request
    echo json_encode((["success" => false, "message" => "Email e senha são obrigatórios."]));
    exit();
}

try {

    $db = connect_db();
    $usuarioModel = new Usuario($db);

    // Busca o usuário pelo email
    $usuario = $usuarioModel->findByEmail($data->email);

    if ($usuario && password_verify($data->senha, $usuario["senha"])) {
        $_SESSION["user_id"] = $usuario["id"];
        $_SESSION["email"] = $usuario["email"];
        $_SESSION["departamento"] = $usuario["departamento"];
        $_SESSION["logged_in"] = true;

        echo json_encode([
            "success" => true,
            "message" => "Login bem-sucedido!"
        ]);
    } else {
        // Autenticação falhou
        http_response_code(401); // Unauthorized
        echo json_encode((["success" => false, "message" => "Email ou senha incorretos."]));
    }
} catch (PDOException $event) {
    http_response_code(500); // Internal Server Error
    echo json_encode((["success" => false, "message" => "Erro ao processar login: " . $event->getMessage()]));
}
