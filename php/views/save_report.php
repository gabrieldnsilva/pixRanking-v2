<?php

session_start();

header('Content-Type: application/json');

require_once "/home/gabrieldnsilva/projects/rankingPixDebito/config/dbConfig.php";
require_once "/home/gabrieldnsilva/projects/rankingPixDebito/php/core/report_schema.php";
require_once "/home/gabrieldnsilva/projects/rankingPixDebito/php/core/auth_permissions.php";

$pdo = connect_db();

set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    requirePermission("upload-csv"); // 401/403 handled inside

    if (!isset($pdo) || !($pdo instanceof PDO)) {
        throw new RuntimeException('PDO connection ($pdo) is not available. Check config/dbConfig.php');
    }

    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

    if (
        empty($data['data_inicial']) ||
        empty($data['data_final']) ||
        !isset($data['dados_relatorio'])
    ) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
        exit();
    }

    $usuario_id = $_SESSION['user_id'] ?? null;
    if (!$usuario_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No user in session.']);
        exit();
    }

    // Shape payload (accept either {ranking:[...]} or raw array)
    $incoming = $data['dados_relatorio'];
    $rankedArray = is_array($incoming) && array_is_list($incoming)
        ? $incoming
        : (is_array($incoming) && isset($incoming['ranking']) && is_array($incoming['ranking']) ? $incoming['ranking'] : []);

    $shaped = shape_report_payload($rankedArray, [
        'period' => ['start' => $data['data_inicial'], 'end' => $data['data_final']],
        'user'   => [
            'id'           => $_SESSION['user_id'] ?? null,
            'email'        => $_SESSION['email'] ?? null,
            'departamento' => $_SESSION['departamento'] ?? null,
        ],
    ]);

    // Quick sanity check: table exists
    // Quick sanity check: table exists
    $pdo->query("SELECT 1 FROM ranking_relatorios_salvos LIMIT 0");

    $stmt = $pdo->prepare(
        "INSERT INTO ranking_relatorios_salvos
            (usuario_id, data_inicial, data_final, data_geracao, dados_relatorio)
         VALUES (:usuario_id, :data_inicial, :data_final, :data_geracao, :dados_relatorio)"
    );

    $stmt->execute([
        ':usuario_id'      => $usuario_id,
        ':data_inicial'    => $data['data_inicial'],
        ':data_final'      => $data['data_final'],
        ':data_geracao'    => date('Y-m-d H:i:s'),
        ':dados_relatorio' => json_encode($shaped, JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION),
    ]);

    echo json_encode(['success' => true, 'message' => 'Relatório salvo com sucesso.']);

    echo json_encode(['success' => true, 'message' => 'Relatório salvo com sucesso.']);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("save_report.php error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server error while saving report.']);
}
