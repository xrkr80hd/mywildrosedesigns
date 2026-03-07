<?php
$page_title = "Admin Dashboard — Wild Rose Design LLC";
require_once '../config/auth.php';

$auth = new Auth();
$auth->requireAdmin();

include '../includes/header.php';

require_once '../config/database.php';

try {
    $database = new Database();
    $conn = $database->conn;
    
    // Get statistics
    $stats = [];
    
    // Product count
    $stmt = $conn->query("SELECT COUNT(*) FROM products WHERE active = 1");
    $stats['products'] = $stmt->fetchColumn();
    
    // Order count
    $stmt = $conn->query("SELECT COUNT(*) FROM orders");
    $stats['orders'] = $stmt->fetchColumn();
    
    // Pending uploads
    $stmt = $conn->query("SELECT COUNT(*) FROM custom_uploads WHERE status = 'pending'");
    $stats['pending_uploads'] = $stmt->fetchColumn();
    
    // Recent orders
    $stmt = $conn->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
    $recent_orders = $stmt->fetchAll();
    
} catch(Exception $e) {
    $stats = ['products' => 0, 'orders' => 0, 'pending_uploads' => 0];
    $recent_orders = [];
}
?>

<main>
    <div class="wrap">
        <h2>📊 Admin Dashboard</h2>
        <p style="text-align: center; color: var(--gray); margin-bottom: 3rem;">Welcome back! Here's what's happening with your Wild Rose Design business.</p>
        
        <div class="admin-nav">
            <a href="dashboard.php" class="btn">📊 Dashboard</a>
            <a href="products.php" class="btn alt">📦 Manage Products</a>
            <a href="orders.php" class="btn alt">🛍️ View Orders</a>
            <a href="uploads.php" class="btn alt">🎨 Custom Uploads</a>
            <a href="users.php" class="btn alt">👥 Manage Users</a>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card fade-in-up" style="background: linear-gradient(135deg, #007cba, #0056b3);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📦</div>
                <h3><?php echo $stats['products']; ?></h3>
                <p>Active Products</p>
            </div>
            
            <div class="stat-card fade-in-up" style="background: linear-gradient(135deg, #28a745, #20c997);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛍️</div>
                <h3><?php echo $stats['orders']; ?></h3>
                <p>Total Orders</p>
            </div>
            
            <div class="stat-card fade-in-up" style="background: linear-gradient(135deg, #ffc107, #fd7e14);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎨</div>
                <h3><?php echo $stats['pending_uploads']; ?></h3>
                <p>Pending Uploads</p>
            </div>
        </div>
        
        <div class="recent-activity">
            <h3>Recent Orders</h3>
            <?php if (empty($recent_orders)): ?>
                <p>No recent orders found.</p>
            <?php else: ?>
                <div class="orders-table" style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                        <thead>
                            <tr style="background: #f5f5f5;">
                                <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Order ID</th>
                                <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Customer</th>
                                <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Total</th>
                                <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Status</th>
                                <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($recent_orders as $order): ?>
                                <tr>
                                    <td style="padding: 0.75rem; border: 1px solid #ddd;">#<?php echo $order['id']; ?></td>
                                    <td style="padding: 0.75rem; border: 1px solid #ddd;"><?php echo htmlspecialchars($order['customer_name']); ?></td>
                                    <td style="padding: 0.75rem; border: 1px solid #ddd;">$<?php echo number_format($order['total_amount'], 2); ?></td>
                                    <td style="padding: 0.75rem; border: 1px solid #ddd;">
                                        <span class="status-badge status-<?php echo $order['status']; ?>">
                                            <?php echo ucfirst($order['status']); ?>
                                        </span>
                                    </td>
                                    <td style="padding: 0.75rem; border: 1px solid #ddd;">
                                        <?php echo date('M j, Y', strtotime($order['created_at'])); ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
        
        <div class="quick-actions" style="margin-top: 2rem; padding: 1.5rem; background: #f9f9f9; border-radius: 8px;">
            <h3>Quick Actions</h3>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <a href="products.php?action=add" class="btn">Add New Product</a>
                <a href="uploads.php" class="btn alt">Review Custom Uploads</a>
                <a href="orders.php?status=pending" class="btn alt">Process Pending Orders</a>
            </div>
        </div>
    </div>
</main>

<style>
.status-pending { background: #ffc107; color: #333; padding: 0.25rem 0.5rem; border-radius: 4px; }
.status-processing { background: #007cba; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; }
.status-shipped { background: #28a745; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; }
.status-delivered { background: #6c757d; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; }
.status-cancelled { background: #dc3545; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; }
</style>

<?php include '../includes/footer.php'; ?>