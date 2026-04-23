# AI Coding Agent Instructions - Ranking PIX Portal

## Project Overview

Full-stack web application for ranking retail store operators based on PIX vs debit transaction performance. Analyzes CSV transaction data to identify digital payment adoption opportunities and saves historical reports.

**Stack**: Vanilla JavaScript (ES6+ modules), PHP (vanilla), Bootstrap 5.3.3, jQuery, Chart.js, PapaParse, jsPDF, MySQL/MariaDB.

## Critical Architecture

### Server Environment

-   **Server**: Apache on Ubuntu (`srvsave945` at `10.111.88.1`)
-   **Base path**: `\\10.111.88.1\files\portal\ranking-pix\`
-   **Database**: `atc_portal` (MariaDB) with tables `ranking_usuarios`, `ranking_operadoras`, `ranking_relatorios_salvos`
-   **Config**: `config/dbConfig.php` defines `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`

### Module Import Structure (CRITICAL ⚠️)

All imports use **relative paths from `src/js/modules/`** organized by domain:

```javascript
// Correct pattern in initializeApp.js
import { loadInitialOperators, readCsvFile } from "./data/dataManager.js";
import { processAndRankData } from "./data/analysis.js";
import { displayRanking } from "./ui/uiManager.js";
```

**File organization**: `src/js/modules/[auth|data|ui|utils]/filename.js`

### Data Flow Architecture

**Entry Point Chain**:

1. `main.js` → `app.js::startApp()` → `auth/auth.js::checkAuthStatus()`
2. If authenticated → `initializeApp.js` → initializes app state
3. `loadInitialOperators()` loads from **database first**, fallback to JSON

**Central State** (in `initializeApp.js`):

```javascript
let appData = { operators: null, pixData: null, debitData: null };

function checkAndProcessData() {
	if (appData.operators && appData.pixData && appData.debitData) {
		const rankedData = processAndRankData(appData);
		displayRanking(rankedData);
	}
}
```

**Critical**: Processing only triggers when **all 3 data sources** loaded. Refresh loses uploaded CSV data (not persisted).

### Authentication Flow

**PHP Session-Based** (NOT localStorage):

1. `php/views/session_status.php` validates session via `$_SESSION['loggedin']`
2. Returns `{ success: true, data: { id, email, departamento } }` or 401
3. `auth/roles.js` applies UI visibility based on department permissions
4. Unauthorized → redirect to `login.html`

Database table: `ranking_usuarios` (columns: `id`, `email`, `senha_hash`, `departamento`)

## Key Data Structures

### Operator Data (Database-Driven)

**Source**: `php/core/ranking_operadoras.php` (GET endpoint)

```json
[{ "nome_operadora": "Raquel", "numero_operadora": 9627 }]
```

**Primary key**: `numero_operadora` (INT) - must match CSV operator numbers **exactly**

**CRUD Operations**:

-   Frontend: `data/crudManager.js` manages local `appData.operators` array
-   Save changes: POST to `php/core/ranking_operadoras.php` with full array → TRUNCATE + bulk INSERT
-   Fallback: `data/operators.json` if database unavailable

### CSV Processing (PapaParse)

```javascript
// dataManager.js - Dynamic column renaming
export function readCsvFile(file, type) {
	// Finds first column matching "quantidade" (case-insensitive)
	// Renames to: QuantidadePix or QuantidadeDebito based on type parameter
}
```

**Expected CSV columns**:

-   `Operador` (operator number)
-   Column containing "quantidade" (transaction count) - gets renamed dynamically

**Critical**: Operator numbers in CSV must exist in `appData.operators` or row is excluded from ranking.

### Ranking Algorithm (`data/analysis.js`)

```javascript
export function processAndRankData({ operators, pixData, debitData }) {
	// Creates Maps for O(1) lookup: operatorNumber → transactionCount
	// Joins operators with transaction counts
	// Calculates: pixProportion = pixCount / (pixCount + debitCount)
	// Sorts by pixTransactions DESC
}
```

**Output**: Array of operators with calculated metrics (`pixTransactions`, `debitTransactions`, `totalTransactions`, `pixProportion`)

## Development Patterns

### URL Paths (CRITICAL for AJAX)

**Correct pattern** (relative from root):

```javascript
$.ajax({ url: "php/core/ranking_operadoras.php" }); // ✅ Resolves to /files/portal/ranking-pix/php/core/
```

**Common mistakes**:

```javascript
url: "/php/core/ranking_operadoras.php"; // ❌ Looks from Apache root
url: "../../../../php/core/ranking_operadoras.php"; // ❌ Brittle relative path
```

### PHP Endpoints

**Pattern** (all in `php/core/` or `php/views/`):

```php
require_once __DIR__ . "/../../config/dbConfig.php"; // From php/core/ → up 2 levels
$pdo = connect_db(); // Function from dbConfig.php
// Handle GET, POST, etc.
echo json_encode($response);
```

**Headers**: Already set in `dbConfig.php` (CORS, JSON content-type)

### jQuery + Bootstrap Pattern

```javascript
// Event delegation for dynamic content
$("#crud-table-body").on("click", ".edit-operator-btn", function () {
	const id = $(this).data("id");
	operatorModal.show(); // Bootstrap 5 API
});
```

**Bootstrap Modals**: Always use `new bootstrap.Modal($("#modal-id"))` instance, then `.show()`, `.hide()`

### Chart.js Lifecycle

```javascript
// uiManager.js - Always destroy before recreating
if (chartInstance) chartInstance.destroy();
chartInstance = new Chart(ctx, { type: "pie", data: {...} });
```

**State**: `chartInstance` and `individualChartInstance` stored at module level

### SweetAlert2 Feedback (via `feedbackManager.js`)

```javascript
import {
	showSuccessToast,
	showErrorAlert,
	showUploadStatus,
} from "../ui/feedbackManager.js";

showSuccessToast("Operadoras carregadas"); // Toast (top-right, auto-close)
showErrorAlert("Erro ao salvar", "Título"); // Modal alert
showUploadStatus(); // Progress modal
```

## Common Issues & Debugging

### Import Resolution Failures

-   **Symptom**: `Failed to load module` console errors
-   **Cause**: Wrong relative path in `import` statement
-   **Fix**: All imports from `src/js/modules/` use `./` (same folder) or `../` (parent folder) notation

### PHP Endpoint 404 Errors

-   **Symptom**: `GET /php/core/ranking_operadoras.php 404`
-   **Cause**: Wrong URL path in AJAX call
-   **Fix**: Use relative path from HTML file location: `"php/core/ranking_operadoras.php"`
-   **Test**: Access `https://srvsave945/files/portal/ranking-pix/php/core/ranking_operadoras.php` directly in browser

### PHP Endpoint 500 Errors

-   **Cause 1**: Wrong `require_once` path to `dbConfig.php`
    -   From `php/core/`: Use `__DIR__ . "/../../config/dbConfig.php"` (up 2 levels)
    -   From `php/views/`: Use `__DIR__ . "/../../config/dbConfig.php"`
-   **Cause 2**: Database credentials incorrect in `config/dbConfig.php`
-   **Debug**: Check Apache error logs, access endpoint directly for PHP error output

### Data Processing Not Triggering

-   **Cause**: `checkAndProcessData()` requires **all 3** data sources non-null
-   **Debug**: Check `appData` object in console: `{ operators: [...], pixData: [...], debitData: [...] }`
-   **Common**: CSV missing "quantidade" column → parsing succeeds but data empty

### Chart Not Updating

-   **Cause**: Forgot to destroy previous Chart.js instance
-   **Fix**: Always call `chartInstance.destroy()` before creating new chart
-   **Location**: `uiManager.js` functions `displayRanking()` and `displayIndividualMetrics()`

### Modal Form Persistence

-   **Cause**: Bootstrap modal not reset after save
-   **Fix**: Call `$("#operator-form")[0].reset()` and clear hidden fields
-   **Location**: `crudManager.js` button handlers

## Key Files for Modification

-   `src/js/main.js`: Entry point (imports `app.js`)
-   `src/js/app.js`: Auth check → `initializeApp()`
-   `src/js/modules/initializeApp.js`: App orchestration, event listeners (**CHECK IMPORTS FIRST**)
-   `src/js/modules/data/analysis.js`: Ranking algorithm (`processAndRankData`)
-   `src/js/modules/data/dataManager.js`: CSV/JSON parsing, operator loading
-   `src/js/modules/data/crudManager.js`: Operator CRUD UI logic
-   `src/js/modules/ui/uiManager.js`: Chart.js, pagination, ranking display
-   `php/core/ranking_operadoras.php`: GET/POST operators from database
-   `php/views/session_status.php`: Authentication check
-   `config/dbConfig.php`: Database connection (defines constants, `connect_db()` function)
