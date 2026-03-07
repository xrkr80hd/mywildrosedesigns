<?php
// Enable error reporting for debugging (remove after site works)
error_reporting(E_ALL);
ini_set('display_errors', 1);

$page_title = "Wild Rose Design LLC — Home";
include 'includes/header.php';
?>

  <main class="hero">
    <div class="wrap">
      <div class="modern-hero">
        <div class="hero-content">
          <span class="pill">✨ Handmade • Fast Turnaround ✨</span>
          <h1 class="h1">Wild Rose Design LLC</h1>
          <p class="sub">Transform Your Ideas into Beautiful Custom Designs</p>
          <p class="sub">From school spirit wear to personalized gifts, we bring your vision to life with quality craftsmanship and lightning-fast turnaround times.</p>
          <div class="cta">
            <a class="btn" href="shop.php">🛍️ Shop Collections</a>
            <a class="btn alt" href="upload.php">🎨 Upload Your Design</a>
          </div>
        </div>
        <div class="hero-art" role="img" aria-label="Seasonal hero art">
          <img src="assets/img/WRD_hero.png" alt="Wild Rose Hero Banner" class="hero-img" data-speed="0.3" />
        </div>
      </div>
    </div>
  </main>

  <section>
    <div class="wrap">
      <h2>✨ Featured Products</h2>
      <div id="carouselMountHome" data-carousel data-src="get_products.php?featured=true"></div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <h2>🌟 Why Choose Wild Rose Design?</h2>
      <div class="grid cols-3">
        <div class="card fade-in-up">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #D63384, #FFC107); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 2rem;">🎨</div>
          </div>
          <h3>Custom Designs</h3>
          <p>Transform your ideas into reality! Upload your design or work with our team to create something truly unique. From simple text to complex artwork.</p>
          <a href="upload.php" class="btn">🚀 Start Custom Order</a>
        </div>
        
        <div class="card fade-in-up">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #20C997, #17A2B8); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 2rem;">🏫</div>
          </div>
          <h3>School & Team Spirit</h3>
          <p>Show your pride with custom spirit wear, team jerseys, band uniforms, and club merchandise. Perfect for schools, sports teams, and organizations.</p>
          <a href="shop.php?category=School" class="btn">📚 Shop School Gear</a>
        </div>
        
        <div class="card fade-in-up">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #FFC107, #FF6B35); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 2rem;">🎃</div>
          </div>
          <h3>Seasonal Collections</h3>
          <p>Discover our curated seasonal drops for every occasion - from Halloween to Christmas, summer fun to spring celebrations!</p>
          <a href="shop.php?category=Seasonal" class="btn">🍂 View Collections</a>
        </div>
      </div>
    </div>
  </section>

  <section style="background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);">
    <div class="wrap">
      <h2>⚡ Lightning Fast Process</h2>
      <div class="grid cols-4">
        <div class="card fade-in-up" style="text-align: center;">
          <div style="width: 60px; height: 60px; background: #D63384; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold; font-size: 1.5rem;">1</div>
          <h4>📤 Submit</h4>
          <p>Upload your design or browse our collections</p>
        </div>
        
        <div class="card fade-in-up" style="text-align: center;">
          <div style="width: 60px; height: 60px; background: #FFC107; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold; font-size: 1.5rem;">2</div>
          <h4>💬 Quote</h4>
          <p>Get pricing within 24 hours</p>
        </div>
        
        <div class="card fade-in-up" style="text-align: center;">
          <div style="width: 60px; height: 60px; background: #20C997; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold; font-size: 1.5rem;">3</div>
          <h4>✅ Approve</h4>
          <p>Review mockup and approve design</p>
        </div>
        
        <div class="card fade-in-up" style="text-align: center;">
          <div style="width: 60px; height: 60px; background: #6F42C1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold; font-size: 1.5rem;">4</div>
          <h4>📦 Receive</h4>
          <p>Get your items in 3-7 days</p>
        </div>
      </div>
    </div>
  </section>

<?php include 'includes/footer.php'; ?>