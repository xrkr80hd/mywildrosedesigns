<?php
$page_title = "Login — Wild Rose Design LLC";
include 'includes/header.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $error = 'Please fill in all fields.';
    } else {
        if ($auth->login($email, $password)) {
            $redirect = $_GET['redirect'] ?? ($_SESSION['user_role'] === 'admin' ? 'admin/dashboard.php' : 'index.php');
            header("Location: $redirect");
            exit();
        } else {
            $error = 'Invalid email or password.';
        }
    }
}
?>

<main>
    <div class="wrap">
        <div class="login-container" style="max-width: 400px; margin: 2rem auto; padding: 2rem; background: #f9f9f9; border-radius: 8px;">
            <h2>Login</h2>
            
            <?php if ($error): ?>
                <div class="alert alert-error" style="background: #fee; color: #c33; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>
            
            <?php if ($success): ?>
                <div class="alert alert-success" style="background: #efe; color: #363; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
                    <?php echo htmlspecialchars($success); ?>
                </div>
            <?php endif; ?>
            
            <form method="POST" action="">
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label for="email" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email:</label>
                    <input type="email" id="email" name="email" required 
                           value="<?php echo htmlspecialchars($email ?? ''); ?>"
                           style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label for="password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password:</label>
                    <input type="password" id="password" name="password" required
                           style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                
                <button type="submit" class="btn" style="width: 100%; padding: 0.75rem; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Login
                </button>
            </form>
            
            <p style="text-align: center; margin-top: 1rem; color: #666;">
                Default admin login:<br>
                Email: <strong>admin@wildrosedesign.com</strong><br>
                Password: <strong>admin123</strong>
            </p>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>