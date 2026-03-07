<?php
$page_title = "Manage Products — Wild Rose Design LLC";
require_once '../config/auth.php';

$auth = new Auth();
$auth->requireAdmin();

require_once '../config/database.php';

$message = '';
$database = new Database();
$conn = $database->conn;

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add') {
        try {
            $stmt = $conn->prepare("INSERT INTO products (id, title, category, price, description, stock, image) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['id'],
                $_POST['title'],
                $_POST['category'],
                $_POST['price'],
                $_POST['description'],
                $_POST['stock'],
                $_POST['image']
            ]);
            $message = "Product added successfully!";
        } catch(Exception $e) {
            $message = "Error adding product: " . $e->getMessage();
        }
    } elseif ($action === 'update') {
        try {
            $stmt = $conn->prepare("UPDATE products SET title=?, category=?, price=?, description=?, stock=?, image=?, active=? WHERE id=?");
            $stmt->execute([
                $_POST['title'],
                $_POST['category'],
                $_POST['price'],
                $_POST['description'],
                $_POST['stock'],
                $_POST['image'],
                isset($_POST['active']) ? 1 : 0,
                $_POST['product_id']
            ]);
            $message = "Product updated successfully!";
        } catch(Exception $e) {
            $message = "Error updating product: " . $e->getMessage();
        }
    } elseif ($action === 'delete') {
        try {
            $stmt = $conn->prepare("UPDATE products SET active = 0 WHERE id = ?");
            $stmt->execute([$_POST['product_id']]);
            $message = "Product deactivated successfully!";
        } catch(Exception $e) {
            $message = "Error deactivating product: " . $e->getMessage();
        }
    }
}

// Get products
$stmt = $conn->query("SELECT * FROM products ORDER BY category, title");
$products = $stmt->fetchAll();

// Get categories
$stmt = $conn->query("SELECT DISTINCT category FROM products ORDER BY category");
$categories = $stmt->fetchAll(PDO::FETCH_COLUMN);

include '../includes/header.php';
?>

<main>
    <div class="wrap">
        <h2>Manage Products</h2>
        
        <div class="admin-nav" style="margin: 2rem 0; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
            <a href="dashboard.php" class="btn alt">Dashboard</a>
            <a href="products.php" class="btn">Manage Products</a>
            <a href="orders.php" class="btn alt">View Orders</a>
            <a href="uploads.php" class="btn alt">Custom Uploads</a>
            <a href="users.php" class="btn alt">Manage Users</a>
        </div>
        
        <?php if ($message): ?>
            <div class="alert" style="background: #efe; color: #363; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>
        
        <!-- Add New Product Form -->
        <div class="add-product-form" style="background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h3>Add New Product</h3>
            <form method="POST" style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
                <input type="hidden" name="action" value="add">
                
                <div>
                    <label>Product ID:</label>
                    <input type="text" name="id" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div>
                    <label>Title:</label>
                    <input type="text" name="title" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div>
                    <label>Category:</label>
                    <input type="text" name="category" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div>
                    <label>Price:</label>
                    <input type="number" step="0.01" name="price" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div>
                    <label>Stock:</label>
                    <input type="number" name="stock" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div>
                    <label>Image URL:</label>
                    <input type="text" name="image" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div style="grid-column: 1 / -1;">
                    <label>Description:</label>
                    <textarea name="description" rows="3" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                </div>
                
                <div style="grid-column: 1 / -1;">
                    <button type="submit" class="btn">Add Product</button>
                </div>
            </form>
        </div>
        
        <!-- Products List -->
        <div class="products-list">
            <h3>Existing Products</h3>
            <div class="products-table" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">ID</th>
                            <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Title</th>
                            <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Category</th>
                            <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Price</th>
                            <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Stock</th>
                            <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Status</th>
                            <th style="padding: 0.75rem; border: 1px solid #ddd; text-align: left;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($products as $product): ?>
                            <tr>
                                <td style="padding: 0.75rem; border: 1px solid #ddd;"><?php echo htmlspecialchars($product['id']); ?></td>
                                <td style="padding: 0.75rem; border: 1px solid #ddd;"><?php echo htmlspecialchars($product['title']); ?></td>
                                <td style="padding: 0.75rem; border: 1px solid #ddd;"><?php echo htmlspecialchars($product['category']); ?></td>
                                <td style="padding: 0.75rem; border: 1px solid #ddd;">$<?php echo number_format($product['price'], 2); ?></td>
                                <td style="padding: 0.75rem; border: 1px solid #ddd;"><?php echo $product['stock']; ?></td>
                                <td style="padding: 0.75rem; border: 1px solid #ddd;">
                                    <span class="<?php echo $product['active'] ? 'text-green' : 'text-red'; ?>">
                                        <?php echo $product['active'] ? 'Active' : 'Inactive'; ?>
                                    </span>
                                </td>
                                <td style="padding: 0.75rem; border: 1px solid #ddd;">
                                    <button class="btn-small edit-btn" data-product='<?php echo json_encode($product); ?>'>Edit</button>
                                    <form method="POST" style="display: inline;" onsubmit="return confirm('Deactivate this product?')">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="product_id" value="<?php echo $product['id']; ?>">
                                        <button type="submit" class="btn-small btn-danger">Deactivate</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>

<!-- Edit Product Modal -->
<div id="editModal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
    <div class="modal-content" style="background: white; margin: 2rem auto; padding: 2rem; max-width: 600px; border-radius: 8px;">
        <h3>Edit Product</h3>
        <form id="editForm" method="POST">
            <input type="hidden" name="action" value="update">
            <input type="hidden" name="product_id" id="edit_product_id">
            
            <div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
                <div>
                    <label>Title:</label>
                    <input type="text" name="title" id="edit_title" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div>
                    <label>Category:</label>
                    <input type="text" name="category" id="edit_category" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div>
                    <label>Price:</label>
                    <input type="number" step="0.01" name="price" id="edit_price" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div>
                    <label>Stock:</label>
                    <input type="number" name="stock" id="edit_stock" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div style="grid-column: 1 / -1;">
                    <label>Image URL:</label>
                    <input type="text" name="image" id="edit_image" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div style="grid-column: 1 / -1;">
                    <label>Description:</label>
                    <textarea name="description" id="edit_description" rows="3" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                </div>
                
                <div style="grid-column: 1 / -1;">
                    <label>
                        <input type="checkbox" name="active" id="edit_active"> Active
                    </label>
                </div>
            </div>
            
            <div style="margin-top: 1rem; text-align: right;">
                <button type="button" onclick="closeEditModal()" class="btn alt">Cancel</button>
                <button type="submit" class="btn">Update Product</button>
            </div>
        </form>
    </div>
</div>

<style>
.btn-small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
.btn-danger { background: #dc3545; color: white; }
.text-green { color: #28a745; }
.text-red { color: #dc3545; }
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const editButtons = document.querySelectorAll('.edit-btn');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = JSON.parse(this.dataset.product);
            
            document.getElementById('edit_product_id').value = product.id;
            document.getElementById('edit_title').value = product.title;
            document.getElementById('edit_category').value = product.category;
            document.getElementById('edit_price').value = product.price;
            document.getElementById('edit_stock').value = product.stock;
            document.getElementById('edit_image').value = product.image || '';
            document.getElementById('edit_description').value = product.description || '';
            document.getElementById('edit_active').checked = product.active == 1;
            
            document.getElementById('editModal').style.display = 'block';
        });
    });
});

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
</script>

<?php include '../includes/footer.php'; ?>