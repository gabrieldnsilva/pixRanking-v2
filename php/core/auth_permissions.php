<?php

// Permissões para diferentes níveis de usuário com base em departamento
function getPermitionsForRole(string $role): array
{

    $role = trim($role);

    switch ($role) {
        case 'Informatica': // Admin
            return [
                'manage-operators' => true,
                'upload-csv' => true,
                'view-reports' => true,
            ];
        case 'Cadastro':
            return [
                'manage-operators' => false,
                'upload-csv' => true,
                'view-reports' => true,
            ];
        case 'Gerencia':
        case 'Frente de Caixa':
            return [
                'manage-operators' => false,
                'upload-csv' => false,
                'view-reports' => true,
            ];
        default:
            return [
                'manage-operators' => false,
                'upload-csv' => false,
                'view-reports' => true,
            ];
    }
}

// Verifica se o usuário tem permissão para uma ação específica
function requirePermission(string $perm)
{
    if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }
    $perms = getPermitionsForRole($_SESSION['departamento'] ?? '');
    if (empty($perms[$perm])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden']);
        exit();
    }
}
