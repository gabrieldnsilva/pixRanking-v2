<?php

/**
 * Moldar e sanitizar o payload do relatório antes da persistência
 * @param array $ranked linhas de operadores ranqueadas
 * @param array $ctx contexto do relatório
 */
function shape_report_payload(array $ranked, array $ctx): array
{

    // Tratamento do caso de já estar no schema, retorna como está (idempotente)
    if (isset($ranked['schema_version']) && isset($ranked['ranking'])) {
        return $ranked;
    }

    // Whitelist de campos por linha
    $rows = [];
    $pixTotal = 0;
    $debitTotal = 0;

    foreach ($ranked as $row) {

        // Aceita camelCase/underscore como usual
        $numero = $row['numero_operadora'] ?? $row['Operador'] ?? null;
        $nome   = $row['nome_operadora'] ?? $row['Operadora'] ?? null;

        $pix   = (int)($row['pixTransactions'] ?? 0);
        $debit = (int)($row['debitTransactions'] ?? 0);
        $total = (int)($row['totalTransactions'] ?? ($pix + $debit));
        $prop  = $total > 0 ? ($pix / $total) : 0;

        if ($numero === null || $nome === null) {
            // Ignora linhas sem identificador
            continue;
        }

        $pixTotal += $pix;
        $debitTotal += $debit;

        $rows[] = [
            'numero_operadora'  => (int)$numero,
            'nome_operadora'    => (string)$nome,
            'pixTransactions'   => $pix,
            'debitTransactions' => $debit,
            'totalTransactions' => $total,
            'pixProportion'     => (float)$prop,
        ];
    }

    // Resumo do conteúdo
    usort($rows, fn($a, $b) => $b['pixTransactions'] <=> $a['pixTransactions']);
    $top3 = array_slice(array_map(fn($r) => $r['numero_operadora'], $rows), 0, 3);
    $summary = [
        'operators'        => count($rows),
        'pixTotal'         => $pixTotal,
        'debitTotal'       => $debitTotal,
        'totalTransactions' => $pixTotal + $debitTotal,
        'top3'             => $top3,
    ];

    $generated_at = (new DateTimeImmutable('now'))->format(DateTime::ATOM);
    $period = [
        'start' => $ctx['period']['start'] ?? null,
        'end'   => $ctx['period']['end'] ?? null,
    ];
    $generated_by = [
        'id'           => $ctx['user']['id'] ?? null,
        'email'        => $ctx['user']['email'] ?? null,
        'departamento' => $ctx['user']['departamento'] ?? null,
    ];

    return [
        'schema_version' => 1,
        'generated_at'   => $generated_at,
        'generated_by'   => $generated_by,
        'period'         => $period,
        'summary'        => $summary,
        'ranking'        => $rows,
    ];
}
