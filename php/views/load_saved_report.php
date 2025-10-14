<?php

session_start();
header('Content-Type: application/json');

require_once "/home/gabrieldnsilva/projects/rankingPixDebito/config/dbConfig.php";
require_once "/home/gabrieldnsilva/projects/rankingPixDebito/php/core/auth_permissions.php";

try {
    requirePermission('view-reports');
    $pdo = connect_db();

    $reportId = $_GET['id'] ?? null;
    if (!$reportId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID do relatório é obrigatório.']);
        exit();
    }

    $stmt = $pdo->prepare(
        "SELECT id, data_inicial, data_final, data_geracao, dados_relatorio 
         FROM ranking_relatorios_salvos 
         WHERE id = ?"
    );
    $stmt->execute([$reportId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Relatório não encontrado.']);
        exit();
    }

    $dados_relatorio = json_decode($row['dados_relatorio'], true);
    $primary = $dados_relatorio['primary_data'] ?? [];

    echo json_encode([
        'success' => true,
        'data' => [
            'id'           => (int)$row['id'],
            'data_inicial' => $row['data_inicial'],
            'data_final'   => $row['data_final'],
            'data_geracao' => $row['data_geracao'],
            'operators'    => $primary['operators'] ?? [],
            'pixData'      => $primary['pixData'] ?? [],
            'debitData'    => $primary['debitData'] ?? [],
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("load_saved_report.php error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro ao carregar relatório.']);
}
