<?php
$page_title = "Shop — Wild Rose Design LLC";
include 'includes/header.php';

require_once 'config/database.php';

try {
    $database = new Database();
    $conn = $database->conn;
    
    $category = $_GET['category'] ?? '';
    
    // Get all categories for filter
    $cat_stmt = $conn->prepare("SELECT DISTINCT category FROM products WHERE active = 1 ORDER BY category");
    $cat_stmt->execute();
    $categories = $cat_stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Get products
    $sql = "SELECT * FROM products WHERE active = 1";
    $params = [];
    
    if ($category) {
        $sql .= " AND category = :category";
        $params['category'] = $category;
    }
    
    $sql .= " ORDER BY category, title";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
} catch(Exception $e) {
    $products = [];
    $categories = [];
}
?>

<main>
    <div class="wrap">
        <h2>🛒 Shop by Category</h2>
        
        <div class="category-filters">
            <a href="shop.php" class="btn <?php echo !$category ? 'active' : 'alt'; ?>">
                🛍️ All Products
            </a>
            <?php 
            $categoryIcons = [
                'Apparel' => '👕',
                'Toddler & Kids' => '🧸',
                'School' => '🏫',
                'Sports' => '⚽',
                'Lifestyle' => '☕',
                'Seasonal' => '🎃',
                'Custom' => '🎨',
                'Featured' => '⭐'
            ];
            ?>
            <?php foreach ($categories as $cat): ?>
                <a href="shop.php?category=<?php echo urlencode($cat); ?>" 
                   class="btn <?php echo $category === $cat ? 'active' : 'alt'; ?>">
                    <?php echo ($categoryIcons[$cat] ?? '📦') . ' ' . htmlspecialchars($cat); ?>
                </a>
            <?php endforeach; ?>
        </div>
        
        <?php if (empty($products)): ?>
            <p>No products found<?php echo $category ? ' in this category' : ''; ?>.</p>
        <?php else: ?>
            <div class="product-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
                <?php foreach ($products as $product): ?>
                    <div class="product-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem; text-align: center;">
                        <?php if ($product['image']): ?>
                            <img src="<?php echo htmlspecialchars($product['image']); ?>" 
                                 alt="<?php echo htmlspecialchars($product['title']); ?>"
                                 style="width: 100%; height: 200px; object-fit: cover; margin-bottom: 1rem;">
                        <?php endif; ?>
                        
                        <h3><?php echo htmlspecialchars($product['title']); ?></h3>
                        <p class="category" style="color: #666; margin: 0.5rem 0;"><?php echo htmlspecialchars($product['category']); ?></p>
                        <p class="description" style="margin: 1rem 0;"><?php echo htmlspecialchars($product['description']); ?></p>
                        <p class="price" style="font-size: 1.25rem; font-weight: bold; color: #007cba;">
                            $<?php echo number_format($product['price'], 2); ?>
                        </p>
                        
                        <?php if ($product['stock'] > 0): ?>
                            <button class="btn add-to-cart" 
                                    data-product-id="<?php echo htmlspecialchars($product['id']); ?>"
                                    data-product-title="<?php echo htmlspecialchars($product['title']); ?>"
                                    data-product-price="<?php echo $product['price']; ?>">
                                Add to Cart
                            </button>
                            <p class="stock" style="color: #666; margin-top: 0.5rem; font-size: 0.9rem;">
                                <?php echo $product['stock']; ?> in stock
                            </p>
                        <?php else: ?>
                            <button class="btn" disabled style="background: #ccc;">Out of Stock</button>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
        
        <div class="highlights-section" style="margin-top: 4rem;">
            <h2>✨ Featured Highlights</h2>
            <div id="carouselMountShop" data-carousel data-src="get_products.php?featured=true"></div>
        </div>
    </div>
</main>

<script>
// Add to cart functionality
document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const productTitle = this.dataset.productTitle;
            const productPrice = parseFloat(this.dataset.productPrice);
            
            // Get current cart from localStorage
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // Check if item already exists
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    title: productTitle,
                    price: productPrice,
                    quantity: 1
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Visual feedback
            this.textContent = 'Added!';
            this.style.background = '#28a745';
            setTimeout(() => {
                this.textContent = 'Add to Cart';
                this.style.background = '';
            }, 1500);
        });
    });
});
</script>

<?php include 'includes/footer.php'; ?>