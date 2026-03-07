<?php
$page_title = "Shopping Cart — Wild Rose Design LLC";
include 'includes/header.php';
?>

<main>
    <div class="wrap">
        <h2>Shopping Cart</h2>
        
        <div id="cart-container">
            <div id="empty-cart" style="text-align: center; padding: 3rem; display: none;">
                <h3>Your cart is empty</h3>
                <p>Add some items from our shop to get started!</p>
                <a href="shop.php" class="btn">Continue Shopping</a>
            </div>
            
            <div id="cart-items" style="display: none;">
                <div class="cart-header" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px; margin-bottom: 1rem; font-weight: bold;">
                    <div>Product</div>
                    <div>Price</div>
                    <div>Quantity</div>
                    <div>Total</div>
                    <div></div>
                </div>
                
                <div id="cart-list"></div>
                
                <div class="cart-summary" style="margin-top: 2rem; padding: 1.5rem; background: #f9f9f9; border-radius: 8px;">
                    <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Subtotal:</span>
                        <span id="cart-subtotal">$0.00</span>
                    </div>
                    <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Shipping:</span>
                        <span>$5.99</span>
                    </div>
                    <div class="summary-row total" style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold; border-top: 1px solid #ddd; padding-top: 0.5rem;">
                        <span>Total:</span>
                        <span id="cart-total">$5.99</span>
                    </div>
                    
                    <div class="checkout-actions" style="margin-top: 1.5rem; text-align: center;">
                        <button id="checkout-btn" class="btn" style="padding: 1rem 2rem; font-size: 1.1rem;">
                            Proceed to Checkout
                        </button>
                        <a href="shop.php" class="btn alt" style="margin-left: 1rem;">Continue Shopping</a>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Checkout Modal -->
        <div id="checkout-modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
            <div class="modal-content" style="background: white; margin: 2rem auto; padding: 2rem; max-width: 600px; border-radius: 8px; max-height: 90vh; overflow-y: auto;">
                <h3>Checkout</h3>
                <form id="checkout-form">
                    <div class="form-section">
                        <h4>Customer Information</h4>
                        <div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
                            <div>
                                <label>Full Name *</label>
                                <input type="text" name="customer_name" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div>
                                <label>Email *</label>
                                <input type="email" name="customer_email" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div style="grid-column: 1 / -1;">
                                <label>Phone</label>
                                <input type="tel" name="customer_phone" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section" style="margin-top: 2rem;">
                        <h4>Shipping Address</h4>
                        <div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
                            <div style="grid-column: 1 / -1;">
                                <label>Street Address *</label>
                                <input type="text" name="address" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div>
                                <label>City *</label>
                                <input type="text" name="city" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div>
                                <label>State *</label>
                                <input type="text" name="state" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div>
                                <label>ZIP Code *</label>
                                <input type="text" name="zip" required style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section" style="margin-top: 2rem;">
                        <h4>Order Summary</h4>
                        <div id="checkout-items"></div>
                        <div class="checkout-total" style="font-weight: bold; font-size: 1.2rem; margin-top: 1rem; text-align: right;">
                            Total: <span id="checkout-total-amount">$0.00</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem; text-align: right;">
                        <button type="button" onclick="closeCheckoutModal()" class="btn alt">Cancel</button>
                        <button type="submit" class="btn">Place Order</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</main>

<script>
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.init();
    }
    
    init() {
        this.renderCart();
        this.bindEvents();
    }
    
    bindEvents() {
        document.getElementById('checkout-btn')?.addEventListener('click', () => this.showCheckoutModal());
        document.getElementById('checkout-form')?.addEventListener('submit', (e) => this.submitOrder(e));
    }
    
    renderCart() {
        const container = document.getElementById('cart-container');
        const emptyCart = document.getElementById('empty-cart');
        const cartItems = document.getElementById('cart-items');
        const cartList = document.getElementById('cart-list');
        
        if (this.cart.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.style.display = 'none';
            return;
        }
        
        emptyCart.style.display = 'none';
        cartItems.style.display = 'block';
        
        let subtotal = 0;
        cartList.innerHTML = '';
        
        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 1rem; padding: 1rem; border-bottom: 1px solid #eee; align-items: center;';
            
            itemElement.innerHTML = `
                <div>
                    <h4 style="margin: 0; font-size: 1rem;">${item.title}</h4>
                    <small style="color: #666;">ID: ${item.id}</small>
                </div>
                <div>$${item.price.toFixed(2)}</div>
                <div>
                    <button onclick="cart.updateQuantity(${index}, ${item.quantity - 1})" style="padding: 0.25rem 0.5rem; border: 1px solid #ddd; background: white; cursor: pointer;">-</button>
                    <span style="margin: 0 0.5rem;">${item.quantity}</span>
                    <button onclick="cart.updateQuantity(${index}, ${item.quantity + 1})" style="padding: 0.25rem 0.5rem; border: 1px solid #ddd; background: white; cursor: pointer;">+</button>
                </div>
                <div style="font-weight: bold;">$${itemTotal.toFixed(2)}</div>
                <div>
                    <button onclick="cart.removeItem(${index})" style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;">×</button>
                </div>
            `;
            
            cartList.appendChild(itemElement);
        });
        
        const shipping = 5.99;
        const total = subtotal + shipping;
        
        document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
    }
    
    updateQuantity(index, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(index);
        } else {
            this.cart[index].quantity = newQuantity;
            this.saveCart();
            this.renderCart();
        }
    }
    
    removeItem(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        this.renderCart();
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    
    showCheckoutModal() {
        // Populate checkout items
        const checkoutItems = document.getElementById('checkout-items');
        let subtotal = 0;
        
        checkoutItems.innerHTML = '';
        
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 0.5rem; padding: 0.5rem; background: #f9f9f9;';
            itemDiv.innerHTML = `
                <span>${item.title} × ${item.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            `;
            checkoutItems.appendChild(itemDiv);
        });
        
        const total = subtotal + 5.99;
        document.getElementById('checkout-total-amount').textContent = `$${total.toFixed(2)}`;
        
        document.getElementById('checkout-modal').style.display = 'block';
    }
    
    async submitOrder(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const orderData = Object.fromEntries(formData);
        orderData.items = this.cart;
        
        try {
            const response = await fetch('process_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Order placed successfully! You will receive a confirmation email shortly.');
                this.cart = [];
                this.saveCart();
                this.renderCart();
                this.closeCheckoutModal();
            } else {
                alert('Error placing order: ' + result.message);
            }
        } catch (error) {
            alert('Error placing order. Please try again.');
        }
    }
    
    closeCheckoutModal() {
        document.getElementById('checkout-modal').style.display = 'none';
    }
}

// Initialize cart
const cart = new ShoppingCart();

function closeCheckoutModal() {
    cart.closeCheckoutModal();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('checkout-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
</script>

<?php include 'includes/footer.php'; ?>