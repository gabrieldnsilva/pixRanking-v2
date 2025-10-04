# 📋 To-Do List - Ranking PIX - Atacadão

[![Progresso](https://img.shields.io/badge/Progresso-Em%20Andamento-blue.svg)](https://github.com/gabrieldnsilva/rankingPixDebito)
[![Prioridades](https://img.shields.io/badge/Prioridades-3%20Ativas-green.svg)](https://github.com/gabrieldnsilva/rankingPixDebito)

> 🚀 Lista de tarefas para otimizar e expandir o sistema de ranking de operadoras. Baseado nas funcionalidades descritas em [docs/features.md](https://github.com/gabrieldnsilva/pixRanking-v2/blob/main/docs/features.md) e alinhado com o roadmap do projeto.

## 🔄 Tarefas em Andamento

-   🔄 **CRUD para manipulação do operators.json** - Com o consumo do arquivo operators.json, deve ser disponibilizada uma forma de manipulá-lo de forma interativa.
-   🔄 **Autenticação para proteção de CREATE, UPDATE E DELETE** - Implementar um sistema de autenticação para garantir que apenas usuários autorizados possam modificar os dados.
-   🔄 **Melhorar a acessibilidade do dashboard** - Adicionar suporte a leitores de tela e navegação por teclado.

## 🚨 Crítico

-   ✅ **Implementar "Collapsable Sidebar"** - Sidebar dinâmica concluída e integrada ao UI.
-   ✅ **Importação automática do arquivo operators.json** - A importação dos dados de operadoras não pode ser manual.
-   ✅ **Adicionar funcionalidade de exportação de dados (CSV, PDF)** - Exportação básica implementada; refine para múltiplos formatos.
-   ✅ **Melhorar responsividade do sidebar** - Ajustes em andamento para dispositivos móveis.
-   🔄 **Atualizar documentação do projeto com novas funcionalidades** - Revisar README.md e adicionar seções em [docs/features.md](https://github.com/gabrieldnsilva/pixRanking-v2/blob/main/docs/features.md).

## 🚀 Futuras Melhorias

-   📊 **Implementar autenticação de usuário para acesso ao dashboard completo** - Adicionar níveis de acesso (admin/usuário) com segurança básica.
-   📈 **Adicionar gráficos de desempenho mensal** - Expandir dashboard com visualizações temporais.
-   🔍 **Implementar sistema de filtros para os dados exibidos** - Filtros avançados por operadora, período e tipo de transação. (Precisa da persistência dos dados)
-   ❓ **Adicionar seção de ajuda ou FAQ para usuários** - Página de suporte integrada ao dashboard.
-   💬 **Implementar sistema de feedback dos usuários** - Formulário para comentários e sugestões, com logs.
-   📊 **Adicionar gráficos de comparação entre operadoras** - Visualizações lado a lado no dashboard.
-   🌙 **Adicionar suporte a temas (claro/escuro)** - Personalização da interface para melhor UX.
-   📊 **Adicionar comparação de desempenho semanal** - Visualizar diferenças semana a semana dos números de operações das operadoras.

## 🧪 Testes

-   🔬 **Implementar testes automatizados para garantir a estabilidade do código** - Cobrir módulos como dataManager, analysis e uiManager com Jest ou similar.
