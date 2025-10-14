<?php

session_start();
header('Content-Type: application/json');

require_once "/home/gabrieldnsilva/projects/rankingPixDebito/config/dbConfig.php";
require_once "/home/gabrieldnsilva/projects/rankingPixDebito/php/core/auth_permissions.php";

try {
    requirePermission('view-reports');
    $pdo = connect_db();

    $stmt = $pdo->query(
        "SELECT id, usuario_id, data_inicial, data_final, data_geracao, dados_relatorio
         FROM ranking_relatorios_salvos
         ORDER BY data_geracao DESC, id DESC
         LIMIT 5"
    );
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $out = array_map(function ($r) {
        $json = json_decode($r['dados_relatorio'], true);
        return [
            'id'            => (int)$r['id'],
            'usuario_id'    => $r['usuario_id'],
            'data_inicial'  => $r['data_inicial'],
            'data_final'    => $r['data_final'],
            'data_geracao'  => $r['data_geracao'],
            'generated_by'  => $json['generated_by']['email'] ?? null,
            'total_tx'      => $json['summary']['total_transactions'] ?? null,
            'operators_cnt' => $json['summary']['operators_count'] ?? null,
        ];
    }, $rows);

    echo json_encode(['success' => true, 'data' => $out]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("list_saved_reports.php error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro ao listar relatórios.']);
}
