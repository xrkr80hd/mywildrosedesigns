<?php
require_once 'config/database.php';
header('Content-Type: application/json');

try {
    $database = new Database();
    $conn = $database->conn;
    
    $category = $_GET['category'] ?? '';
    $featured = $_GET['featured'] ?? false;
    
    $sql = "SELECT * FROM products WHERE active = 1";
    $params = [];
    
    if ($category) {
        $sql .= " AND category = :category";
        $params['category'] = $category;
    }
    
    if ($featured) {
        $sql .= " ORDER BY created_at DESC LIMIT 6";
    } else {
        $sql .= " ORDER BY category, title";
    }
    
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
    echo json_encode($products);
    
} catch(Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>