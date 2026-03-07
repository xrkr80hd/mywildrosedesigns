<?php
header('Content-Type: application/json');
require_once 'config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid input data');
    }
    
    $database = new Database();
    $conn = $database->conn;
    
    // Start transaction
    $conn->beginTransaction();
    
    // Calculate total
    $subtotal = 0;
    foreach ($input['items'] as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }
    $shipping = 5.99;
    $total = $subtotal + $shipping;
    
    // Create order
    $stmt = $conn->prepare("INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $input['customer_name'],
        $input['customer_email'],
        $input['customer_phone'] ?? '',
        $total
    ]);
    
    $order_id = $conn->lastInsertId();
    
    // Add order items
    $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    
    foreach ($input['items'] as $item) {
        $stmt->execute([
            $order_id,
            $item['id'],
            $item['quantity'],
            $item['price']
        ]);
        
        // Update product stock
        $update_stmt = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        $update_stmt->execute([$item['quantity'], $item['id']]);
    }
    
    // Commit transaction
    $conn->commit();
    
    // Send confirmation email (simplified)
    $to = $input['customer_email'];
    $subject = "Order Confirmation - Wild Rose Design LLC";
    $message = "Thank you for your order! Order #$order_id has been received and will be processed within 1-2 business days.";
    $headers = "From: orders@wildrosedesign.com";
    
    // mail($to, $subject, $message, $headers); // Uncomment when email is configured
    
    echo json_encode(['success' => true, 'order_id' => $order_id]);
    
} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollback();
    }
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>