<?php
$page_title = "Contact — Wild Rose Design LLC";
include 'includes/header.php';

$message = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $msg = trim($_POST['message'] ?? '');
    
    if (empty($name) || empty($email) || empty($subject) || empty($msg)) {
        $message = 'Please fill in all fields.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'Please enter a valid email address.';
    } else {
        // In a real application, you'd send an email here
        // For now, we'll just show a success message
        $success = true;
        $message = 'Thank you for your message! We\'ll get back to you within 24 hours.';
        
        // Optional: Log the message to a file or database
        $log_entry = date('Y-m-d H:i:s') . " - Contact from: $name ($email) - Subject: $subject\n";
        file_put_contents('contact_log.txt', $log_entry, FILE_APPEND | LOCK_EX);
    }
}
?>

<main>
    <div class="wrap">
        <h2>Contact Us</h2>
        <p class="sub">Have questions? Need a quote? We'd love to hear from you!</p>
        
        <div class="contact-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 2rem;">
            
            <!-- Contact Form -->
            <div class="contact-form">
                <h3>Send Us a Message</h3>
                
                <?php if ($message): ?>
                    <div class="alert <?php echo $success ? 'alert-success' : 'alert-error'; ?>" 
                         style="background: <?php echo $success ? '#efe' : '#fee'; ?>; 
                                color: <?php echo $success ? '#363' : '#c33'; ?>; 
                                padding: 1rem; margin-bottom: 1.5rem; border-radius: 4px;">
                        <?php echo htmlspecialchars($message); ?>
                    </div>
                <?php endif; ?>
                
                <?php if (!$success): ?>
                <form method="POST" style="display: grid; gap: 1rem;">
                    <div>
                        <label for="name" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Name *</label>
                        <input type="text" id="name" name="name" required
                               value="<?php echo htmlspecialchars($name ?? ''); ?>"
                               style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div>
                        <label for="email" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email *</label>
                        <input type="email" id="email" name="email" required
                               value="<?php echo htmlspecialchars($email ?? ''); ?>"
                               style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div>
                        <label for="subject" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Subject *</label>
                        <select id="subject" name="subject" required
                                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Select a subject...</option>
                            <option value="Custom Order Inquiry" <?php echo ($subject ?? '') === 'Custom Order Inquiry' ? 'selected' : ''; ?>>Custom Order Inquiry</option>
                            <option value="Pricing Question" <?php echo ($subject ?? '') === 'Pricing Question' ? 'selected' : ''; ?>>Pricing Question</option>
                            <option value="Order Status" <?php echo ($subject ?? '') === 'Order Status' ? 'selected' : ''; ?>>Order Status</option>
                            <option value="General Question" <?php echo ($subject ?? '') === 'General Question' ? 'selected' : ''; ?>>General Question</option>
                            <option value="Bulk Order" <?php echo ($subject ?? '') === 'Bulk Order' ? 'selected' : ''; ?>>Bulk Order (10+ items)</option>
                            <option value="Other" <?php echo ($subject ?? '') === 'Other' ? 'selected' : ''; ?>>Other</option>
                        </select>
                    </div>
                    
                    <div>
                        <label for="message" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Message *</label>
                        <textarea id="message" name="message" rows="6" required
                                  placeholder="Tell us about your project, ask a question, or let us know how we can help!"
                                  style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"><?php echo htmlspecialchars($msg ?? ''); ?></textarea>
                    </div>
                    
                    <button type="submit" class="btn" style="justify-self: start; padding: 0.75rem 2rem;">
                        Send Message
                    </button>
                </form>
                <?php else: ?>
                <div style="text-align: center; padding: 2rem;">
                    <p><strong>Message sent successfully!</strong></p>
                    <a href="contact.php" class="btn alt">Send Another Message</a>
                </div>
                <?php endif; ?>
            </div>
            
            <!-- Contact Information -->
            <div class="contact-info">
                <h3>Get In Touch</h3>
                
                <div class="contact-methods" style="display: grid; gap: 1.5rem;">
                    <div class="contact-method" style="padding: 1rem; background: #f9f9f9; border-radius: 8px;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #007cba;">📧 Email</h4>
                        <p style="margin: 0;">orders@wildrosedesign.com</p>
                        <small style="color: #666;">We typically respond within 4-6 hours during business days</small>
                    </div>
                    
                    <div class="contact-method" style="padding: 1rem; background: #f9f9f9; border-radius: 8px;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #007cba;">📱 Text/Call</h4>
                        <p style="margin: 0;">(555) 123-WILD</p>
                        <small style="color: #666;">Monday - Friday: 9 AM - 6 PM<br>Saturday: 10 AM - 4 PM</small>
                    </div>
                    
                    <div class="contact-method" style="padding: 1rem; background: #f9f9f9; border-radius: 8px;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #007cba;">⏰ Response Times</h4>
                        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                            <li>Custom quotes: 24-48 hours</li>
                            <li>General questions: 4-6 hours</li>
                            <li>Order status: Same day</li>
                        </ul>
                    </div>
                </div>
                
                <div class="business-hours" style="margin-top: 2rem; padding: 1.5rem; background: #e7f3ff; border-radius: 8px;">
                    <h4 style="margin: 0 0 1rem 0;">Business Hours</h4>
                    <div style="display: grid; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>Monday - Friday:</span>
                            <span>9:00 AM - 6:00 PM</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Saturday:</span>
                            <span>10:00 AM - 4:00 PM</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Sunday:</span>
                            <span>Closed</span>
                        </div>
                    </div>
                    <small style="display: block; margin-top: 1rem; color: #666;">
                        *Rush orders and urgent requests may be accommodated outside normal hours
                    </small>
                </div>
                
                <div class="quick-links" style="margin-top: 2rem;">
                    <h4>Quick Links</h4>
                    <div style="display: grid; gap: 0.5rem;">
                        <a href="upload.php" class="btn alt" style="text-align: center;">Upload Custom Design</a>
                        <a href="shop.php" class="btn alt" style="text-align: center;">Browse Products</a>
                        <a href="about.php" class="btn alt" style="text-align: center;">Learn About Us</a>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="faq-section" style="margin-top: 3rem;">
            <h3>Frequently Asked Questions</h3>
            <div class="faq-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1rem;">
                <div class="faq-item" style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
                    <h4>What's your typical turnaround time?</h4>
                    <p>Most orders are completed within 3-7 business days. Rush orders can often be accommodated for an additional fee.</p>
                </div>
                
                <div class="faq-item" style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
                    <h4>Do you offer bulk discounts?</h4>
                    <p>Yes! We offer tiered pricing for orders of 12+ items. Contact us for a custom quote.</p>
                </div>
                
                <div class="faq-item" style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
                    <h4>What file formats do you accept?</h4>
                    <p>We accept JPG, PNG, PDF, AI, and PSD files. For best results, provide high-resolution vector files when possible.</p>
                </div>
                
                <div class="faq-item" style="padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
                    <h4>Can you help design something from scratch?</h4>
                    <p>Absolutely! Our design services start at $25. Just describe your idea and we'll create something custom for you.</p>
                </div>
            </div>
        </div>
    </div>
</main>

<?php include 'includes/footer.php'; ?>