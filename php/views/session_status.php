<?php
// api/views/session_status.php
session_start();

require_once "/home/gabrieldnsilva/projects/rankingPixDebito/php/core/auth_check.php";
require_once "/home/gabrieldnsilva/projects/rankingPixDebito/php/core/auth_permissions.php";

// Headers para JSON
header('Content-Type: application/json');

// Verifica se o usuário está logado
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    $perms = getPermitionsForRole($_SESSION['departamento'] ?? '');
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $_SESSION['user_id'],
            'email' => $_SESSION['email'],
            'departamento' => $_SESSION['departamento'],
            'permissoes' => $perms,
        ],
    ]);
    exit();
} else {
    http_response_code(401); // Unauthorized
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
}
