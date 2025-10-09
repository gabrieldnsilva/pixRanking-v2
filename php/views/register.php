<?php

// require_once './config/dbConfig.php';
// require_once './api/models/Usuario.php';

require_once "./config/dbConfig.php";
require_once "./models/Usuario.php";

$db = connect_db();
$usuarioModel = new Usuario($db);

$data = json_decode(file_get_contents("php://input"));

// Validação básica dos dados recebidos
if (!isset($data->email) || !isset($data->senha) || !isset($data->departamento)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']);
    exit();
}

try {
    if ($usuarioModel->findByEmail($data->email)) {
        http_response_code(409); // Conflict
        echo json_encode((["success" => false, "message" => "Este email já está cadastrado."]));
        exit();
    }

    $uuid = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4));
    $senha_hash = password_hash($data->senha, PASSWORD_ARGON2ID);


    // Monta o array de dados para o Model
    $userData = [
        "id" => $uuid,
        "departamento" => $data->departamento,
        "email" => $data->email,
        "senha_hash" => $senha_hash
    ];

    if ($usuarioModel->create($userData)) {
        http_response_code(201); // Created
        echo json_encode((["success" => true, "message" => "Usuário registrado com sucesso."]));
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode((["success" => false, "message" => "Não foi possível registrar usuário."]));
    }
} catch (PDOException $event) {
    http_response_code(500); // Internal Server Error
    echo json_encode((["success" => false, "message" => "Erro ao conectar ao servidor: " . $event->getMessage()]));
}
