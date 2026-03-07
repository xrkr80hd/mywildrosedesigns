<?php
require_once 'config/database.php';

// Create database tables
try {
    $database = new Database();
    $conn = $database->conn;
    
    // Users table
    $sql_users = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'customer') DEFAULT 'customer',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
    )";
    $conn->exec($sql_users);
    
    // Products table
    $sql_products = "CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(255),
        description TEXT,
        stock INT DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $conn->exec($sql_products);
    
    // Orders table
    $sql_orders = "CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $conn->exec($sql_orders);
    
    // Order items table
    $sql_order_items = "CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id VARCHAR(50),
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )";
    $conn->exec($sql_order_items);
    
    // Custom uploads table
    $sql_uploads = "CREATE TABLE IF NOT EXISTS custom_uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        description TEXT,
        file_path VARCHAR(255),
        status ENUM('pending', 'quoted', 'approved', 'in_production', 'completed') DEFAULT 'pending',
        quote_amount DECIMAL(10,2) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql_uploads);
    
    // Insert default admin user (password: admin123)
    $admin_email = 'admin@wildrosedesign.com';
    $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
    
    $check_admin = $conn->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
    $check_admin->bindParam(':email', $admin_email);
    $check_admin->execute();
    
    if ($check_admin->fetchColumn() == 0) {
        $stmt = $conn->prepare("INSERT INTO users (email, password, role) VALUES (:email, :password, 'admin')");
        $stmt->bindParam(':email', $admin_email);
        $stmt->bindParam(':password', $admin_password);
        $stmt->execute();
        echo "Admin user created: admin@wildrosedesign.com / admin123\n";
    }
    
    // Insert sample products from JSON
    if (file_exists('assets/data/products.json')) {
        $products_json = file_get_contents('assets/data/products.json');
        $products = json_decode($products_json, true);
        
        foreach ($products as $product) {
            $stmt = $conn->prepare("INSERT IGNORE INTO products (id, title, category, price, image, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $product['id'],
                $product['title'],
                $product['category'],
                $product['price'],
                $product['image'],
                $product['description'],
                rand(10, 50) // Random stock
            ]);
        }
        echo "Sample products imported.\n";
    }
    
    echo "Database setup completed successfully!";
    
} catch(PDOException $e) {
    echo "Database setup failed: " . $e->getMessage();
}
?>