<?php
session_start();

// Destrói todas as variáveis de sessão
$_SESSION = array();

// Se houver cookie de sessão, exclui
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// Destroi a sessão
session_destroy();

echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso.']);
