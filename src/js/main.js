// main.js - Main JavaScript file for Sleep Outside project

import CartAnimation from './cartAnimation.js';

// Initialize cart animation system
const cartAnimation = new CartAnimation();

// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sleep Outside - Main application loaded');

    // Initialize cart from localStorage
    initializeCart();

    // Set up event listeners for "Add to Cart" buttons
    setupAddToCartButtons();

    // Set up product card interactions
    setupProductCardInteractions();
});

// Initialize cart from localStorage
function initializeCart() {
    // Check if cart exists in localStorage, create if not
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
        console.log('Cart initialized in localStorage');
    }

    // Update cart count display
    updateCartCountDisplay();
}

// Set up event listeners for all "Add to Cart" buttons
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling to parent link

            // Get product data from button data attributes
            const product = {
                id: button.dataset.id || 'unknown',
                name: button.dataset.name || 'Unknown Product',
                price: parseFloat(button.dataset.price) || 0,
                quantity: 1,
                image: getProductImage(button),
                addedAt: new Date().toISOString()
            };

            // Add product to cart
            addProductToCart(product);

            // Show success notification
            showNotification(`${product.name} added to cart!`);

            // Button feedback animation
            animateAddButton(button);
        });
    });

    console.log(`Setup ${addToCartButtons.length} "Add to Cart" buttons`);
}

// Get product image from the product card
function getProductImage(button) {
    const productCard = button.closest('.product-card');
    if (productCard) {
        const img = productCard.querySelector('img');
        return img ? img.src : '/images/placeholder.jpg';
    }
    return '/images/placeholder.jpg';
}

// Add product to cart in localStorage
function addProductToCart(product) {
    // Get current cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        // Update quantity if product exists
        cart[existingProductIndex].quantity += 1;
        cart[existingProductIndex].updatedAt = new Date().toISOString();
    } else {
        // Add new product to cart
        cart.push(product);
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count display
    updateCartCountDisplay();

    // Trigger cart icon animation
    cartAnimation.triggerAddAnimation(product);

    console.log(`Product "${product.name}" added to cart. Cart now has ${cart.length} items.`);
}

// Update cart count display in header
function updateCartCountDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');

    if (cartCountElement) {
        cartCountElement.textContent = totalItems;

        // Show/hide counter based on items
        if (totalItems > 0) {
            cartCountElement.classList.add('has-items');
            cartCountElement.style.opacity = '1';
            cartCountElement.style.transform = 'scale(1)';

            // Add pulse animation
            cartCountElement.classList.add('cart-pulse');
            setTimeout(() => {
                cartCountElement.classList.remove('cart-pulse');
            }, 600);
        } else {
            cartCountElement.classList.remove('has-items');
            cartCountElement.style.opacity = '0';
            cartCountElement.style.transform = 'scale(0)';
        }
    }
}

// Show notification when item is added to cart
function showNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #2c5530;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
        max-width: 300px;
        border-left: 4px solid #dda15e;
    `;

    // Add view cart button
    const viewCartButton = document.createElement('button');
    viewCartButton.textContent = 'View Cart';
    viewCartButton.style.cssText = `
        margin-top: 8px;
        background: #dda15e;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        font-weight: 600;
        width: 100%;
        transition: background-color 0.2s;
    `;

    viewCartButton.addEventListener('mouseover', () => {
        viewCartButton.style.backgroundColor = '#bc8a4a';
    });

    viewCartButton.addEventListener('mouseout', () => {
        viewCartButton.style.backgroundColor = '#dda15e';
    });

    viewCartButton.addEventListener('click', () => {
        window.location.href = 'cart/index.html';
    });

    notification.appendChild(document.createElement('br'));
    notification.appendChild(viewCartButton);

    // Add to document
    document.body.appendChild(notification);

    // Add CSS animations if not already present
    addNotificationStyles();

    // Remove notification after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4000);

    // Close notification on click
    notification.addEventListener('click', (e) => {
        if (e.target !== viewCartButton) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    });
}

// Add CSS for notifications if not already present
function addNotificationStyles() {
    // Check if styles already exist
    if (document.querySelector('#notification-styles')) {
        return;
    }

    const styleElement = document.createElement('style');
    styleElement.id = 'notification-styles';
    styleElement.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(styleElement);
}

// Animate the add button when clicked
function animateAddButton(button) {
    // Add animation class
    button.classList.add('adding');

    // Change button text temporarily
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.disabled = true;
    button.style.backgroundColor = '#4a7c59';

    // Reset button after animation
    setTimeout(() => {
        button.classList.remove('adding');
        button.textContent = originalText;
        button.disabled = false;
        button.style.backgroundColor = '';
    }, 1000);
}

// Set up product card interactions
function setupProductCardInteractions() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        // Add hover delay for smoother transitions
        let hoverTimer;

        card.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                card.style.transform = 'translateY(-5px)';
            }, 50);
        });

        card.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
            card.style.transform = 'translateY(0)';
        });

        // Prevent card click when clicking add to cart button
        const addButton = card.querySelector('.add-to-cart');
        if (addButton) {
            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Make entire card clickable (except buttons)
        card.addEventListener('click', (e) => {
            // Only navigate if the click wasn't on a button
            if (!e.target.closest('.add-to-cart') && !e.target.closest('button')) {
                const link = card.querySelector('a[href]');
                if (link && link.href) {
                    window.location.href = link.href;
                }
            }
        });
    });
}

// Export functions for use in other modules
export {
    addProductToCart,
    updateCartCountDisplay,
    showNotification
};

// Add to global scope for debugging (optional)
if (window) {
    window.sleepOutside = {
        addProductToCart,
        updateCartCountDisplay,
        showNotification,
        cartAnimation
    };
}