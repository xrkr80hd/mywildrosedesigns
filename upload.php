<?php
$page_title = "Upload Custom Design — Wild Rose Design LLC";
include 'includes/header.php';

$message = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $customer_name = trim($_POST['customer_name'] ?? '');
    $customer_email = trim($_POST['customer_email'] ?? '');
    $description = trim($_POST['description'] ?? '');
    
    if (empty($customer_name) || empty($customer_email) || empty($description)) {
        $message = 'Please fill in all required fields.';
    } else {
        try {
            require_once 'config/database.php';
            $database = new Database();
            $conn = $database->conn;
            
            $file_path = null;
            
            // Handle file upload
            if (isset($_FILES['design_file']) && $_FILES['design_file']['error'] === UPLOAD_ERR_OK) {
                $upload_dir = 'uploads/custom_designs/';
                if (!is_dir($upload_dir)) {
                    mkdir($upload_dir, 0755, true);
                }
                
                $file_extension = strtolower(pathinfo($_FILES['design_file']['name'], PATHINFO_EXTENSION));
                $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'ai', 'psd'];
                
                if (in_array($file_extension, $allowed_extensions)) {
                    $filename = time() . '_' . uniqid() . '.' . $file_extension;
                    $file_path = $upload_dir . $filename;
                    
                    if (!move_uploaded_file($_FILES['design_file']['tmp_name'], $file_path)) {
                        $message = 'Error uploading file.';
                    }
                } else {
                    $message = 'Invalid file type. Please upload JPG, PNG, GIF, PDF, AI, or PSD files.';
                }
            }
            
            if (empty($message)) {
                $stmt = $conn->prepare("INSERT INTO custom_uploads (customer_name, customer_email, description, file_path) VALUES (?, ?, ?, ?)");
                $stmt->execute([$customer_name, $customer_email, $description, $file_path]);
                
                $success = true;
                $message = 'Your custom design request has been submitted! We\'ll get back to you within 24 hours with a quote.';
            }
            
        } catch(Exception $e) {
            $message = 'Error submitting request. Please try again.';
        }
    }
}
?>

<main>
    <div class="wrap">
        <h2>Upload Your Custom Design</h2>
        <p class="sub">Have a custom design idea? Upload your file or describe what you want, and we'll bring it to life!</p>
        
        <?php if ($message): ?>
            <div class="alert <?php echo $success ? 'alert-success' : 'alert-error'; ?>" 
                 style="background: <?php echo $success ? '#efe' : '#fee'; ?>; 
                        color: <?php echo $success ? '#363' : '#c33'; ?>; 
                        padding: 1rem; margin-bottom: 2rem; border-radius: 4px;">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>
        
        <?php if (!$success): ?>
        <form method="POST" enctype="multipart/form-data" class="upload-form" 
              style="max-width: 600px; margin: 0 auto; padding: 2rem; background: #f9f9f9; border-radius: 8px;">
            
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label for="customer_name" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                    Your Name *
                </label>
                <input type="text" id="customer_name" name="customer_name" required
                       value="<?php echo htmlspecialchars($customer_name ?? ''); ?>"
                       style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label for="customer_email" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                    Your Email *
                </label>
                <input type="email" id="customer_email" name="customer_email" required
                       value="<?php echo htmlspecialchars($customer_email ?? ''); ?>"
                       style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label for="description" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                    Design Description *
                </label>
                <textarea id="description" name="description" rows="6" required
                          placeholder="Describe your design idea, what item you want it on, colors, size, quantity, etc."
                          style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"><?php echo htmlspecialchars($description ?? ''); ?></textarea>
            </div>
            
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label for="design_file" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">
                    Upload Design File (Optional)
                </label>
                <input type="file" id="design_file" name="design_file" 
                       accept=".jpg,.jpeg,.png,.gif,.pdf,.ai,.psd"
                       style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; background: white;">
                <small style="color: #666; margin-top: 0.5rem; display: block;">
                    Supported formats: JPG, PNG, GIF, PDF, AI, PSD (Max 10MB)
                </small>
            </div>
            
            <div class="pricing-info" style="background: #e7f3ff; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem;">
                <h4 style="margin: 0 0 0.5rem 0; color: #007cba;">Pricing Information:</h4>
                <ul style="margin: 0; padding-left: 1.5rem; color: #555;">
                    <li>Simple text designs: Starting at $15</li>
                    <li>Logo/graphic designs: Starting at $25</li>
                    <li>Complex custom artwork: Quote provided</li>
                    <li>Rush orders (24hr): Additional 50%</li>
                </ul>
            </div>
            
            <button type="submit" class="btn" style="width: 100%; padding: 1rem; font-size: 1.1rem;">
                Submit Custom Request
            </button>
        </form>
        <?php else: ?>
        <div class="success-message" style="text-align: center; padding: 2rem;">
            <h3>Thank you for your custom design request!</h3>
            <p>We've received your submission and will review it within 24 hours.</p>
            <p>You'll receive a quote and timeline via email at: <strong><?php echo htmlspecialchars($customer_email ?? ''); ?></strong></p>
            <div style="margin-top: 2rem;">
                <a href="shop.php" class="btn">Continue Shopping</a>
                <a href="upload.php" class="btn alt">Submit Another Request</a>
            </div>
        </div>
        <?php endif; ?>
        
        <div class="process-info" style="margin-top: 3rem; text-align: center;">
            <h3>How It Works</h3>
            <div class="process-steps" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-top: 2rem;">
                <div class="step">
                    <div class="step-number" style="background: #007cba; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold;">1</div>
                    <h4>Submit Request</h4>
                    <p>Upload your design or describe your idea</p>
                </div>
                <div class="step">
                    <div class="step-number" style="background: #007cba; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold;">2</div>
                    <h4>Get Quote</h4>
                    <p>Receive pricing and timeline within 24 hours</p>
                </div>
                <div class="step">
                    <div class="step-number" style="background: #007cba; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold;">3</div>
                    <h4>Approve & Pay</h4>
                    <p>Review the design mockup and approve</p>
                </div>
                <div class="step">
                    <div class="step-number" style="background: #007cba; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold;">4</div>
                    <h4>Receive Order</h4>
                    <p>Get your custom items in 3-7 business days</p>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>