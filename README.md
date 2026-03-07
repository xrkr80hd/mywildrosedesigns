# Wild Rose Design LLC - Pure PHP Ecommerce Site

A complete, modern PHP-based ecommerce website for Wild Rose Design LLC, featuring custom product management, secure admin system, and beautiful responsive design. Built entirely in PHP for maximum performance and maintainability.

## Features

### Customer Features
- Browse products by category
- Shopping cart functionality
- Custom design upload system
- Contact form
- Responsive design

### Admin Features
- Secure login system
- Product management (add/edit/delete)
- Order management
- Custom upload requests management
- Dashboard with statistics

## Setup Instructions

### 1. Server Requirements
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache web server (with mod_rewrite enabled)
- File upload permissions

### 2. Database Setup
1. Create a MySQL database named `wild_rose_db`
2. Update database credentials in `config/database.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   define('DB_NAME', 'wild_rose_db');
   ```

### 3. Initial Setup
1. Run the setup script in your browser: `http://yoursite.com/setup.php`
2. This will:
   - Create all necessary database tables
   - Import sample products
   - Create default admin user

### 4. Default Admin Login
- Email: `admin@wildrosedesign.com`
- Password: `admin123`

**Important: Change this password immediately after first login!**

### 5. Directory Structure (Pure PHP)
```
wild-rose-site/
├── config/
│   ├── database.php      # Database connection & configuration
│   └── auth.php         # Authentication & session management
├── includes/
│   ├── header.php       # Responsive site header with navigation
│   └── footer.php       # Modern footer with links
├── admin/
│   ├── dashboard.php    # Beautiful admin dashboard with stats
│   ├── products.php     # Complete product management system
│   ├── orders.php       # Order tracking & management
│   └── uploads.php      # Custom upload request management
├── assets/
│   ├── styles.css       # Enhanced modern CSS framework
│   ├── enhanced-styles.css # Additional beautiful styling
│   ├── app.js          # Interactive JavaScript with animations
│   ├── data/
│   │   └── products.json # Sample product data for setup
│   └── img/            # Site images and graphics
├── uploads/            # Custom design uploads (auto-created)
│   └── custom_designs/
├── index.php           # Stunning homepage with hero section
├── shop.php           # Interactive product catalog
├── cart.php           # Full-featured shopping cart
├── login.php          # Secure login system
├── upload.php         # Custom design upload interface
├── about.php          # About page with company info
├── contact.php        # Contact form with validation
├── get_products.php   # API endpoint for product data
├── process_order.php  # Order processing system
├── logout.php         # Secure logout
├── setup.php          # Database setup & initialization
└── .htaccess          # Apache config with clean URLs
```

## Admin Functions

### Product Management
- Add new products with images, categories, pricing
- Update existing products and inventory
- Activate/deactivate products
- Bulk operations

### Order Management
- View all customer orders
- Update order status
- Process payments
- Generate reports

### Custom Upload Management
- Review customer design requests
- Provide quotes
- Update project status
- Communicate with customers

## Configuration

### Email Setup
To enable email notifications, uncomment and configure the mail function in:
- `process_order.php` (order confirmations)
- `contact.php` (contact form submissions)

### File Upload Limits
Adjust in `.htaccess` or `php.ini`:
```
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

### Security Settings
1. Change default admin credentials
2. Update database passwords
3. Remove `setup.php` after initial setup
4. Enable HTTPS in production
5. Configure proper file permissions

## Database Tables

### users
- Admin and customer accounts
- Role-based permissions
- Login tracking

### products
- Product catalog
- Inventory management
- Category organization

### orders
- Customer orders
- Order status tracking
- Payment information

### order_items
- Individual order line items
- Product/quantity relationships

### custom_uploads
- Custom design requests
- File storage paths
- Project status tracking

## API Endpoints

### get_products.php
Returns product data in JSON format:
- `?category=CategoryName` - Filter by category
- `?featured=true` - Get featured products only

### process_order.php
Handles order submission and processing:
- Accepts JSON order data
- Creates order records
- Updates inventory
- Sends confirmation emails

## Customization

### Adding New Product Categories
1. Add products with new category names
2. Categories automatically appear in shop filters
3. Update navigation if needed

### Modifying Order Workflow
1. Edit order status options in database table definitions
2. Update admin order management interface
3. Customize email notifications

### Styling Changes
- Main styles: `assets/styles.css`
- Admin styles: Inline in admin pages
- Responsive breakpoints already configured

## Troubleshooting

### Database Connection Issues
- Check credentials in `config/database.php`
- Verify MySQL service is running
- Ensure database exists

### File Upload Problems
- Check directory permissions (755 or 777)
- Verify PHP upload limits
- Ensure uploads directory exists

### Login Issues
- Verify session configuration
- Check user table data
- Clear browser cookies/cache

### Email Not Working
- Uncomment mail() functions
- Configure SMTP settings
- Check server email capabilities

## Support

For support with this system:
1. Check error logs in your server panel
2. Review PHP error reporting
3. Verify database table structure
4. Test with sample data

## License

This is a custom ecommerce solution built specifically for Wild Rose Design LLC.

---

## 🚀 Quick Start

1. **Run Setup**: Visit `http://yoursite.com/setup.php`
2. **Login**: Use `admin@wildrosedesign.com` / `admin123`
3. **Start Managing**: Add products, handle orders, manage uploads!

## 🎨 Features Highlights

- **🔒 Secure Admin System** - Role-based authentication
- **📱 Fully Responsive** - Beautiful on all devices  
- **⚡ Lightning Fast** - Optimized PHP performance
- **🎯 SEO Friendly** - Clean URLs and structure
- **💫 Modern Animations** - Smooth, professional interactions
- **🛒 Complete Ecommerce** - Cart, checkout, orders
- **🎨 Custom Uploads** - Design request system
- **📊 Admin Dashboard** - Real-time statistics
- **📧 Contact Forms** - Built-in validation
- **🎪 Beautiful Design** - Rose & gold theme

**Important Security Notes:**
- Change all default passwords immediately  
- Remove setup.php after initial installation
- Enable HTTPS in production
- Regular backup your database
- Keep PHP and MySQL updated

---
🌹 **Built with love for Wild Rose Design LLC** 🌹