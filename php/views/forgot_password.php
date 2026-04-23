<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../config/dbConfig.php";

/**
 * Envia e-mail de recuperação usando Postfix local
 * @param string $toEmail E-mail destinatário
 * @param string $resetUrl URL completa do reset
 * @return bool Sucesso do envio
 */
function sendResetEmail($toEmail, $resetUrl)
{
    $subject = "Recuperação de senha - Ranking PIX";

    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background: #f58a42; 
                color: #fff; 
                text-decoration: none; 
                border-radius: 4px; 
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>Recuperação de senha</h2>
            <p>Olá,</p>
            <p>Você solicitou a redefinição de senha para o sistema <strong>Ranking PIX</strong>.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p><a href='{$resetUrl}' class='button'>Redefinir minha senha</a></p>
            <p>Ou copie e cole este link no navegador:</p>
            <p><a href='{$resetUrl}'>{$resetUrl}</a></p>
            <div class='footer'>
                <p><strong>Este link expira em 1 hora.</strong></p>
                <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Ranking PIX <no-reply@servicos.atacadao.com.br>\r\n";
    $headers .= "Reply-To: no-reply@servicos.atacadao.com.br\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    return mail($toEmail, $subject, $message, $headers);
}

try {
    $body = json_decode(file_get_contents("php://input"), true);
    $email = isset($body["email"]) ? trim($body["email"]) : "";

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "E-mail inválido"]);
        exit;
    }

    // Valida domínio corporativo
    if (!str_ends_with(strtolower($email), "@atacadao.com.br")) {
        http_response_code(400);
        echo json_encode(["message" => "Use seu e-mail corporativo @atacadao.com.br"]);
        exit;
    }

    $pdo = connect_db();

    // Busca usuário
    $stmt = $pdo->prepare("SELECT id FROM ranking_usuarios WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Resposta genérica (evita enumeração de e-mails)
    $genericResponse = [
        "message" => "Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha."
    ];

    if (!$user) {
        // Log (opcional): error_log("Tentativa de reset para e-mail não cadastrado: {$email}");
        echo json_encode($genericResponse);
        exit;
    }

    // Gera token seguro
    $token = bin2hex(random_bytes(32)); // 64 caracteres
    $tokenHash = hash("sha256", $token);
    $expiresAt = (new DateTime("+1 hour"))->format("Y-m-d H:i:s");

    // Salva hash do token no banco
    $upd = $pdo->prepare("
        UPDATE ranking_usuarios 
           SET reset_token_hash = :h, 
               reset_token_expires_at = :e 
         WHERE id = :id
    ");
    $upd->execute([
        ":h" => $tokenHash,
        ":e" => $expiresAt,
        ":id" => $user["id"],
    ]);

    // Monta URL de reset
    $baseUrl = "https://srvsave945/ranking-pix";
    $resetUrl = "{$baseUrl}/reset.html?token={$token}&email=" . urlencode($email);

    // Envia e-mail (não lança exceção em caso de erro)
    $mailSent = sendResetEmail($email, $resetUrl);

    if (!$mailSent) {
        error_log("Falha ao enviar e-mail de reset para: {$email}");
        // Não revela erro ao usuário (segurança)
    }

    echo json_encode($genericResponse);
} catch (Throwable $e) {
    error_log("Erro em forgot_password.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Erro no servidor. Tente novamente mais tarde."]);
}
