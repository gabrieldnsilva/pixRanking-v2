<?php
// api/views/session_status.php
session_start();

require_once "/home/gabrieldnsilva/projects/rankingPixDebito/api/core/auth_check.php";


if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    echo json_encode(['success' => true, 'data' => get_user_info()]); // Retorna informações do usuário
    error_log("Verificando status da sessão: " . print_r($_SESSION, true));
} else {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
}
