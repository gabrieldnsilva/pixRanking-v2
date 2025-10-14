<?php

/**
 * Formata e sanitiza o payload do relatório antes de persistir.
 * Agora salva os dados PRIMÁRIOS (operators, pixData, debitData) para permitir recriação completa.
 */
function shape_report_payload(array $dados_relatorio, array $ctx): array
{

    // Tratamento do caso de já estar no schema, retorna como está (idempotente)
    if (isset($dados_relatorio['schema_version']) && isset($dados_relatorio['primary_data'])) {
        return $dados_relatorio;
    }
    // Sanitiza os dados primários
    $operators = [];
    $pixData = [];
    $debitData = [];

    // Sanitiza operadores
    if (isset($dados_relatorio['operators']) && is_array($dados_relatorio['operators'])) {
        foreach ($dados_relatorio['operators'] as $op) {
            $operators[] = [
                'numero_operadora' => (int)($op['numero_operadora'] ?? 0),
                'nome_operadora' => (string)($op['nome_operadora'] ?? ''),
            ];
        }
    }

    // Sanitiza dados PIX
    if (isset($dados_relatorio['pixData']) && is_array($dados_relatorio['pixData'])) {
        foreach ($dados_relatorio['pixData'] as $pix) {
            $pixData[] = [
                'Operador' => (int)($pix['Operador'] ?? 0),
                'QuantidadePix' => (int)($pix['QuantidadePix'] ?? 0),
            ];
        }
    }

    // Sanitiza dados Débito
    if (isset($dados_relatorio['debitData']) && is_array($dados_relatorio['debitData'])) {
        foreach ($dados_relatorio['debitData'] as $debit) {
            $debitData[] = [
                'Operador' => (int)($debit['Operador'] ?? 0),
                'QuantidadeDebito' => (int)($debit['QuantidadeDebito'] ?? 0),
            ];
        }
    }

    // Calcula estatísticas básicas para coleta de metadados
    $totalPix = array_sum(array_column($pixData, 'QuantidadePix'));
    $totalDebit = array_sum(array_column($debitData, 'QuantidadeDebito'));

    // Contexto (período, usuário)
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
        'summary' => [
            'operators_count' => count($operators),
            'total_pix'       => $totalPix,
            'total_debit'     => $totalDebit,
            'total_transactions' => $totalPix + $totalDebit,
        ],
        // DADOS PRIMÁRIOS - permitirão recriar o relatório completamente
        'primary_data' => [
            'operators'  => $operators,
            'pixData'    => $pixData,
            'debitData'  => $debitData,
        ]
    ];
}
