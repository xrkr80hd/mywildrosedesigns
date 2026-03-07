<?php
if (!isset($page_title)) $page_title = "Wild Rose Design LLC";
if (!isset($page_description)) $page_description = "Wild Rose Design LLC — custom apparel, school spirit wear, seasonal collections, and personalized gifts.";

require_once 'config/auth.php';
$auth = new Auth();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title><?php echo htmlspecialchars($page_title); ?></title>
  <meta name="description" content="<?php echo htmlspecialchars($page_description); ?>" />
  <link rel="stylesheet" href="assets/styles.css" />
  <link rel="stylesheet" href="assets/enhanced-styles.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body>
  <header>
    <div class="wrap top">
      <div class="brand">
        <img src="assets/img/logo.svg" alt="Wild Rose Design LLC" class="logo" />
        <div>
          <div class="title">Wild Rose Design LLC</div>
          <div class="muted muted-sm">Custom • Seasonal • School & Sports</div>
        </div>
      </div>
      <nav class="nav" aria-label="Primary">
        <ul>
          <li><a href="index.php">Home</a></li>
          <li><a href="shop.php">Shop</a></li>
          <li><a href="upload.php">Upload</a></li>
          <li><a href="about.php">About</a></li>
          <li><a href="contact.php">Contact</a></li>
          <?php if ($auth->isLoggedIn()): ?>
            <?php if ($auth->getUserRole() === 'admin'): ?>
              <li><a href="admin/dashboard.php">Admin</a></li>
            <?php endif; ?>
            <li><a href="logout.php">Logout</a></li>
          <?php else: ?>
            <li><a href="login.php">Login</a></li>
          <?php endif; ?>
          <li><a href="cart.php">Cart</a></li>
        </ul>
      </nav>
    </div>
  </header>