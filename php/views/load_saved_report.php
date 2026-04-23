<?php

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once "../../config/dbConfig.php";
require_once "../../php/core/auth_permissions.php";

// Converte uma string para número float de forma estrita
function to_number_strict($value)
{
    if (is_numeric($value)) return (float)$value;
    if ($value === null) return 0.0;
    $s = trim((string)$value);
    if ($s === "") return 0.0;
    $clean = preg_replace('/[^\d,.\-]/', '', $s);

    // Heurística BR: vírgula como decimal
    if (strpos($clean, ',') !== false && strrpos($clean, ',') > strrpos($clean, '.')) {
        $normalized = str_replace(['.', ','], ['', '.'], $clean);
        return (float)$normalized;
    }

    // Formato US: ponto decimal, vírgula de milhar
    $normalized = str_replace(',', '', $clean);
    return (float)$normalized;
}
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

    // ⬇️ Normalizar pixData antes de enviar
    $pixData = $primary['pixData'] ?? [];
    foreach ($pixData as &$pix) {
        // Garante que ValorTotalPix seja número puro (corrige "R$ 2.355,78" legado)
        if (isset($pix['ValorTotalPix'])) {
            $pix['ValorTotalPix'] = to_number_strict($pix['ValorTotalPix']);
        }
        // Normaliza contadores também (aceita string)
        if (isset($pix['QuantidadePix'])) {
            $pix['QuantidadePix'] = (int)to_number_strict($pix['QuantidadePix']);
        }
    }
    unset($pix);

    // ⬇️ Normalizar debitData
    $debitData = $primary['debitData'] ?? [];
    foreach ($debitData as &$debit) {
        if (isset($debit['QuantidadeDebito'])) {
            $debit['QuantidadeDebito'] = (int)to_number_strict($debit['QuantidadeDebito']);
        }
    }
    unset($debit);

    echo json_encode([
        'success' => true,
        'data' => [
            'id'           => (int)$row['id'],
            'data_inicial' => $row['data_inicial'],
            'data_final'   => $row['data_final'],
            'data_geracao' => $row['data_geracao'],
            'operators'    => $primary['operators'] ?? [],
            'pixData'      => $pixData,      // ⬅️ normalizado
            'debitData'    => $debitData,    // ⬅️ normalizado
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log("load_saved_report.php error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro ao carregar relatório.']);
}
