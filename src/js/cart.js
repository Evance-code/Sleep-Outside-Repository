// cart.js - Cart page functionality
import { getLocalStorage, setLocalStorage, getCartTotal, formatCurrency } from "./utils.mjs";

// Initialize cart
let cartItems = getLocalStorage("so-cart") || [];

// Main function to render cart contents
function renderCartContents() {
  // Get cart items
  cartItems = getLocalStorage("so-cart") || [];

  // Update cart count in header
  updateHeaderCartCount();

  // Render empty cart message or cart items
  if (cartItems.length === 0) {
    renderEmptyCart();
  } else {
    renderCartItems();
    updateCartSummary();
    setupCartInteractions();
  }

  // Dispatch cart update event for animation
  dispatchCartUpdate();
}

// Render empty cart message
function renderEmptyCart() {
  const cartContainer = document.querySelector(".product-list");
  const cartSummary = document.querySelector(".cart-summary");

  cartContainer.innerHTML = `
    <div class="empty-cart">
      <div class="empty-cart-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
          <path d="M35,30 L65,30 L70,45 L65,60 L35,60 L30,45 Z" fill="#e0e0e0" stroke="#b0b0b0" stroke-width="2"/>
          <path d="M40,30 Q45,20 50,20 Q55,20 60,30" fill="none" stroke="#b0b0b0" stroke-width="3"/>
          <path d="M40,60 Q45,70 50,70 Q55,70 60,60" fill="none" stroke="#b0b0b0" stroke-width="3"/>
        </svg>
      </div>
      <h2>Your Backpack is Empty</h2>
      <p>Looks like you haven't added any outdoor gear to your cart yet.</p>
      <a href="../index.html" class="continue-shopping-btn">Continue Shopping</a>
    </div>
  `;

  // Hide cart summary if empty
  if (cartSummary) {
    cartSummary.style.display = 'none';
  }
}

// Render cart items
function renderCartItems() {
  const htmlItems = cartItems.map((item, index) => cartItemTemplate(item, index));
  const cartContainer = document.querySelector(".product-list");

  if (cartContainer) {
    cartContainer.innerHTML = htmlItems.join("");

    // Show cart summary
    const cartSummary = document.querySelector(".cart-summary");
    if (cartSummary) {
      cartSummary.style.display = 'block';
    }
  }
}

// Cart item template with enhanced features
function cartItemTemplate(item, index) {
  // Calculate extended price
  const quantity = item.quantity || 1;
  const price = parseFloat(item.FinalPrice || item.price || 0);
  const extendedPrice = price * quantity;

  return `
  <li class="cart-card divider" data-id="${item.Id || item.id}" data-index="${index}">
    <div class="cart-card__image-container">
      <a href="/product_pages/${item.Id || item.id}" class="cart-card__image">
        <img
          src="${item.Images && item.Images.PrimaryMedium ? item.Images.PrimaryMedium : (item.Image || item.image || '/images/placeholder.jpg')}"
          alt="${item.Name || item.name}"
          loading="lazy"
        />
      </a>
      <button class="remove-item-btn" aria-label="Remove ${item.Name || item.name} from cart" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
    <div class="cart-card__content">
      <a href="/product_pages/${item.Id || item.id}">
        <h2 class="card__name">${item.Name || item.name}</h2>
      </a>
      <p class="cart-card__brand">${item.Brand || item.brand || ''}</p>
      ${item.Colors && item.Colors[0] ? `<p class="cart-card__color">Color: ${item.Colors[0].ColorName}</p>` : ''}
      
      <div class="cart-card__quantity-controls">
        <button class="quantity-btn minus-btn" data-index="${index}" aria-label="Decrease quantity">−</button>
        <input type="number" 
               class="cart-card__quantity-input" 
               value="${quantity}" 
               min="1" 
               max="10"
               data-index="${index}"
               aria-label="Quantity for ${item.Name || item.name}">
        <button class="quantity-btn plus-btn" data-index="${index}" aria-label="Increase quantity">+</button>
      </div>
      
      <div class="cart-card__pricing">
        <p class="cart-card__unit-price">${formatCurrency(price)} each</p>
        <p class="cart-card__price">${formatCurrency(extendedPrice)}</p>
      </div>
    </div>
  </li>`;
}

// Update cart summary
function updateCartSummary() {
  const subtotal = getCartTotal();
  const taxRate = 0.06; // 6% tax
  const tax = subtotal * taxRate;
  const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
  const total = subtotal + tax + shipping;

  const summaryHTML = `
    <div class="cart-summary-card">
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal (${getTotalItems()} items)</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>Tax</span>
        <span>${formatCurrency(tax)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span>${shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>${formatCurrency(total)}</span>
      </div>
      <div class="summary-actions">
        <button class="checkout-btn" ${cartItems.length === 0 ? 'disabled' : ''}>
          Proceed to Checkout
        </button>
        <a href="../index.html" class="continue-shopping-link">Continue Shopping</a>
      </div>
    </div>
  `;

  const cartSummary = document.querySelector(".cart-summary");
  if (cartSummary) {
    cartSummary.innerHTML = summaryHTML;

    // Add event listener to checkout button
    const checkoutBtn = cartSummary.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', handleCheckout);
    }
  }
}

// Get total number of items in cart
function getTotalItems() {
  return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
}

// Setup cart interactions
function setupCartInteractions() {
  // Quantity change handlers
  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', handleQuantityChange);
  });

  // Quantity input handlers
  document.querySelectorAll('.cart-card__quantity-input').forEach(input => {
    input.addEventListener('change', handleQuantityInputChange);
    input.addEventListener('blur', handleQuantityInputChange);
  });

  // Remove item handlers
  document.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', handleRemoveItem);
  });

  // Add animation to cart items on load
  animateCartItems();
}

// Handle quantity change via buttons
function handleQuantityChange(e) {
  const index = parseInt(e.target.dataset.index);
  const isPlus = e.target.classList.contains('plus-btn');

  if (!isNaN(index) && index >= 0 && index < cartItems.length) {
    // Update quantity
    if (!cartItems[index].quantity) {
      cartItems[index].quantity = 1;
    }

    if (isPlus) {
      cartItems[index].quantity = Math.min(10, cartItems[index].quantity + 1);
    } else {
      cartItems[index].quantity = Math.max(1, cartItems[index].quantity - 1);
    }

    // Save to localStorage
    setLocalStorage("so-cart", cartItems);

    // Re-render cart
    renderCartContents();

    // Show quantity update feedback
    showQuantityFeedback(e.target, isPlus ? 'increased' : 'decreased');
  }
}

// Handle quantity change via input
function handleQuantityInputChange(e) {
  const index = parseInt(e.target.dataset.index);
  let newQuantity = parseInt(e.target.value);

  if (!isNaN(index) && index >= 0 && index < cartItems.length && !isNaN(newQuantity)) {
    // Validate quantity
    newQuantity = Math.max(1, Math.min(10, newQuantity));

    // Update quantity
    cartItems[index].quantity = newQuantity;

    // Save to localStorage
    setLocalStorage("so-cart", cartItems);

    // Re-render cart
    renderCartContents();
  }
}

// Handle remove item
function handleRemoveItem(e) {
  const index = parseInt(e.target.closest('.remove-item-btn').dataset.index);

  if (!isNaN(index) && index >= 0 && index < cartItems.length) {
    const itemName = cartItems[index].Name || cartItems[index].name;

    // Animate removal
    const cartItem = e.target.closest('.cart-card');
    cartItem.style.transition = 'all 0.3s ease';
    cartItem.style.opacity = '0';
    cartItem.style.transform = 'translateX(-20px)';

    // Remove from cart after animation
    setTimeout(() => {
      cartItems.splice(index, 1);
      setLocalStorage("so-cart", cartItems);
      renderCartContents();

      // Show removal notification
      showRemovalNotification(itemName);
    }, 300);
  }
}

// Handle checkout
function handleCheckout() {
  if (cartItems.length === 0) {
    alert('Your cart is empty. Add some items before checkout.');
    return;
  }

  // In a real app, this would redirect to checkout page
  // For now, we'll show a confirmation and clear cart
  const confirmed = confirm(`Proceed to checkout with ${getTotalItems()} items for ${formatCurrency(getCartTotal())}?`);

  if (confirmed) {
    // Clear cart
    setLocalStorage("so-cart", []);

    // Show success message
    alert('Thank you for your order! Your outdoor adventure awaits!');

    // Redirect to home
    window.location.href = '../index.html';
  }
}

// Show quantity feedback
function showQuantityFeedback(element, action) {
  const feedback = document.createElement('div');
  feedback.className = 'quantity-feedback';
  feedback.textContent = action === 'increased' ? '+1' : '-1';
  feedback.style.cssText = `
    position: absolute;
    background: ${action === 'increased' ? '#2c5530' : '#dda15e'};
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.8rem;
    font-weight: bold;
    z-index: 10;
    animation: floatUp 0.5s ease forwards;
  `;

  element.parentElement.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, 500);
}

// Show removal notification
function showRemovalNotification(itemName) {
  const notification = document.createElement('div');
  notification.className = 'removal-notification';
  notification.innerHTML = `
    <span>${itemName} removed from cart</span>
    <button class="undo-btn">Undo</button>
  `;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 15px;
    animation: slideUp 0.3s ease;
  `;

  const undoBtn = notification.querySelector('.undo-btn');
  undoBtn.style.cssText = `
    background: #dda15e;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-weight: bold;
  `;

  // Store removed item for potential undo
  const removedItem = cartItems; // This would need to be implemented properly

  undoBtn.addEventListener('click', () => {
    // Undo logic would go here
    notification.remove();
  });

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
}

// Animate cart items on load
function animateCartItems() {
  const cartItems = document.querySelectorAll('.cart-card');

  cartItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';

    setTimeout(() => {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

// Update cart count in header
function updateHeaderCartCount() {
  const totalItems = getTotalItems();
  const cartCountElement = document.querySelector('#cart-count');

  if (cartCountElement) {
    cartCountElement.textContent = totalItems;

    if (totalItems > 0) {
      cartCountElement.classList.add('has-items');
      cartCountElement.style.opacity = '1';
      cartCountElement.style.transform = 'scale(1)';
    } else {
      cartCountElement.classList.remove('has-items');
      cartCountElement.style.opacity = '0';
      cartCountElement.style.transform = 'scale(0)';
    }
  }
}

// Dispatch cart update event for animation
function dispatchCartUpdate() {
  const event = new CustomEvent('cartUpdated', {
    detail: {
      cartItems,
      totalItems: getTotalItems(),
      totalAmount: getCartTotal()
    }
  });
  document.dispatchEvent(event);
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Cart page loaded');
  renderCartContents();

  // Add CSS animations if not already present
  addCartAnimations();
});

// Add CSS animations for cart
function addCartAnimations() {
  if (document.querySelector('#cart-animations')) return;

  const style = document.createElement('style');
  style.id = 'cart-animations';
  style.textContent = `
    @keyframes floatUp {
      0% {
        opacity: 0;
        transform: translateY(0);
      }
      50% {
        opacity: 1;
        transform: translateY(-10px);
      }
      100% {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes slideDown {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(100%);
        opacity: 0;
      }
    }
    
    .cart-card {
      transition: all 0.3s ease;
    }
    
    .cart-card:hover {
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    
    .quantity-btn {
      transition: all 0.2s ease;
    }
    
    .quantity-btn:active {
      transform: scale(0.95);
    }
    
    .remove-item-btn {
      transition: all 0.2s ease;
    }
    
    .remove-item-btn:hover {
      background-color: #ff6b6b;
      color: white;
    }
  `;

  document.head.appendChild(style);
}

// Export functions for use in other modules
export {
  renderCartContents,
  getTotalItems,
  updateCartSummary
};