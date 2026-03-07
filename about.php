<?php
$page_title = "About — Wild Rose Design LLC";
include 'includes/header.php';
?>

<main>
    <div class="wrap">
        <h2>About Wild Rose Design LLC</h2>
        
        <div class="about-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; margin-bottom: 3rem;">
            <div>
                <h3>Our Story</h3>
                <p>Wild Rose Design LLC was born out of a passion for creating unique, high-quality custom apparel and gifts. We specialize in bringing your ideas to life, whether it's school spirit wear, sports team gear, seasonal collections, or personalized designs.</p>
                
                <p>With years of experience in the custom printing industry, we pride ourselves on fast turnaround times, excellent customer service, and attention to detail. Every piece we create is crafted with care and designed to last.</p>
                
                <h3>What We Do</h3>
                <ul>
                    <li><strong>Custom Apparel:</strong> T-shirts, hoodies, long sleeves, and more</li>
                    <li><strong>School & Organizations:</strong> Spirit wear, band uniforms, club merchandise</li>
                    <li><strong>Sports Teams:</strong> Jerseys, warm-ups, fan gear</li>
                    <li><strong>Seasonal Collections:</strong> Holiday and seasonal themed items</li>
                    <li><strong>Personalized Gifts:</strong> Mugs, totes, hats, home décor</li>
                </ul>
            </div>
            
            <div>
                <img src="assets/img/WRD_hero.png" alt="Wild Rose Design workspace" 
                     style="width: 100%; border-radius: 8px; margin-bottom: 2rem;">
                
                <div class="highlight-box" style="background: #f9f9f9; padding: 1.5rem; border-radius: 8px;">
                    <h4>Why Choose Wild Rose Design?</h4>
                    <ul style="margin: 0; padding-left: 1.5rem;">
                        <li>Fast turnaround times (3-7 business days)</li>
                        <li>High-quality materials and printing</li>
                        <li>Competitive pricing</li>
                        <li>Personalized customer service</li>
                        <li>Local business supporting the community</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="services-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 3rem;">
            <div class="service-card" style="background: #f5f5f5; padding: 2rem; border-radius: 8px; text-align: center;">
                <h4>Custom Design</h4>
                <p>Upload your artwork or work with us to create something unique</p>
            </div>
            
            <div class="service-card" style="background: #f5f5f5; padding: 2rem; border-radius: 8px; text-align: center;">
                <h4>Screen Printing</h4>
                <p>High-quality screen printing for bulk orders and detailed designs</p>
            </div>
            
            <div class="service-card" style="background: #f5f5f5; padding: 2rem; border-radius: 8px; text-align: center;">
                <h4>Vinyl Graphics</h4>
                <p>Durable vinyl applications perfect for names, numbers, and simple graphics</p>
            </div>
            
            <div class="service-card" style="background: #f5f5f5; padding: 2rem; border-radius: 8px; text-align: center;">
                <h4>Embroidery</h4>
                <p>Professional embroidery services for a premium, lasting finish</p>
            </div>
        </div>
        
        <div class="cta-section" style="text-align: center; margin-top: 3rem; padding: 2rem; background: #e7f3ff; border-radius: 8px;">
            <h3>Ready to Get Started?</h3>
            <p>Whether you have a design ready or just an idea, we're here to help bring it to life.</p>
            <div style="margin-top: 1.5rem;">
                <a href="upload.php" class="btn">Upload Your Design</a>
                <a href="contact.php" class="btn alt">Contact Us</a>
            </div>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>