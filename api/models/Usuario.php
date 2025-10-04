<?php

class Usuario
{
    private $pdo;
    private $table_name = "ranking_usuarios";

    public function __construct($db)
    {
        $this->pdo = $db;
    }

    /**
     * Busca um usuário pelo endereço de e-mail
     * @param string $email 
     * @return mixed Retorna os dados do usuário ou false se não encontrado
     */
    public function findByEmail($email)
    {
        $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Cria um novo usuário no banco de dados
     * @param array $data Contém "id", "departamento", "email", "senha_hash"
     * @return bool Retorna true se a criação foi bem-sucedida, false caso contrário
     */
    public function create($data)
    {
        $query = "INSERT INTO " . $this->table_name . " (id, departamento, email, senha) VALUES (:id, :departamento, :email, :senha)";
        $stmt = $this->pdo->prepare($query);

        // Limpa e vincula os parâmetros
        $stmt->bindParam(':id', $data['id']);
        $stmt->bindParam(':departamento', $data['departamento']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':senha', $data['senha_hash']);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}
