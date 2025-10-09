<?php

// Verifica se o usuário NÃO está logado
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    // Se não estiver logado, envia uma resposta de "Não Autorizado"
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado. Por favor, faça o login.']);
    // Encerra a execução de qualquer script que incluiu este arquivo
    exit();
}

// Se o script continuar, significa que o usuário está autenticado.
// Podemos até retornar os dados do usuário para o front-end.
function get_user_info()
{
    return [
        'id' => $_SESSION['user_id'],
        'email' => $_SESSION['email'],
        'departamento' => $_SESSION['departamento']
    ];
}
