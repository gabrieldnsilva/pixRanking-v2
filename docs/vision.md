Problema:

A loja possui sistema de vendas com várias operadoras, múltiplas formas de pagamento.
Inicialmente o projeto era premiar as 3 operadoras com mais transações em PIX (quantidade)
Agora a intenção é ampliar. Analisar as operações em PIX e Débito e compará-las.
Calcular a proporção de transações: Pix / Total (Entre Pix e débito) para avaliar a possível melhora dos resultados

O programa deve ter o cadastro das operadoras, assim como as mesmas deverão ser armazenadas com seus nomes e número de operadora
A persistência desses dados de operadoras pode ser feita de forma simples ou através de banco de dados.
A preferência é que seja construído um JSON, pois não são dados sensíveis nem críticos.

O programa deve ler arquivos CSV da quantidade de transações de cada uma das formas de pagamento (Pix / Débito)
Será formado um ranking das operadoras com maior quantidade de transações em PIX.
Será calculada a percentagem de transações em PIX em relação ao total de transações.

A intenção é que seja também gerado um "dashboard" por cada operadora.
O dashboard pode ser em "pizza" comparando o total de operações entre as operações de pix/débito
As operações em débito são potenciais operações em pix, que deverá ser mostrado para a operadora que aqueles números podem melhorar.


Como o sistema será de acesso interno e somente em desktop, a intenção não é desenvolver um sistema multiplataforma.

O sistema deverá gerar um PDF para impressão e visualização posterior dos responsáveis pelo setor.