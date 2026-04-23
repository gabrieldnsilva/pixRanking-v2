<?php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=atc_portal", "filial945", "senhafilial");
    echo "Conexão bem-sucedida!";
} catch (PDOException $e) {
    echo "Erro ao conectar ao banco de dados: " . $e->getMessage();
}
