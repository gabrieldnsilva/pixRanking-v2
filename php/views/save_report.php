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
    requirePermission('upload-csv');
    $pdo = connect_db();

    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);

    if (empty($data['data_inicial']) || empty($data['data_final']) || !isset($data['dados_relatorio'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Campos obrigatórios ausentes.']);
        exit();
    }

    $usuario_id = $_SESSION['user_id'] ?? null;
    if (!$usuario_id) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Sessão inválida.']);
        exit();
    }

    // Shape: cria schema com primary_data
    $shaped = shape_report_payload($data['dados_relatorio'], [
        'period' => ['start' => $data['data_inicial'], 'end' => $data['data_final']],
        'user'   => [
            'id'           => $_SESSION['user_id'] ?? null,
            'email'        => $_SESSION['email'] ?? null,
            'departamento' => $_SESSION['departamento'] ?? null,
        ],
    ]);

    $pdo->beginTransaction();

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

    // Mantém apenas os 5 mais recentes (globais)
    $pdo->exec("
        DELETE rr FROM ranking_relatorios_salvos rr
        LEFT JOIN (
            SELECT id FROM ranking_relatorios_salvos
            ORDER BY data_geracao DESC, id DESC
            LIMIT 5
        ) keepers ON rr.id = keepers.id
        WHERE keepers.id IS NULL
    ");

    $pdo->commit();

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    error_log("save_report.php error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar relatório.']);
}
