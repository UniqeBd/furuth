// Main JavaScript file for Furuth e-commerce website
// Handles product display, cart management, search, and localStorage operations

class FuruthStore {
    constructor() {
        this.products = this.getProducts();
        this.cart = this.getCart();
        this.filteredProducts = [...this.products];
        this.currentSort = 'name-asc';
        this.currentSearch = '';
        this.currentCategory = 'all';
        this.currentCurrency = this.getCurrency();
        this.exchangeRate = 110; // 1 USD = 110 BDT (you can update this rate)
        
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupCurrency();
        this.setupMobileMenu();
        this.updateCartCount();
        this.loadPageContent();
        this.setupEventListeners();
    }

    // Theme Management
    setupTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                const isDark = document.documentElement.classList.contains('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            });
        }
    }

    // Currency Management
    setupCurrency() {
        const currencyToggle = document.getElementById('currency-toggle');
        const currencyText = document.getElementById('currency-text');
        
        // Update currency display
        if (currencyText) {
            currencyText.textContent = this.currentCurrency;
        }

        if (currencyToggle) {
            currencyToggle.addEventListener('click', () => {
                const newCurrency = this.currentCurrency === 'USD' ? 'BDT' : 'USD';
                this.setCurrency(newCurrency);
                
                // Update button text
                if (currencyText) {
                    currencyText.textContent = newCurrency;
                }
            });
        }
    }

    // Mobile Menu
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }

    // LocalStorage Methods
    getProducts() {
        // Use integrity verification
        let products = this.verifyProductsIntegrity();
        
        // If no products or old products without categories, initialize with sample products
        if (products.length === 0 || !products[0].category) {
            this.initializeSampleProductsToStorage();
            products = this.verifyProductsIntegrity();
        }
        
        return products;
    }

    saveProducts(products) {
        try {
            // Ensure we have valid products array
            const validProducts = Array.isArray(products) ? products : [];
            
            // Save to localStorage with error handling
            localStorage.setItem('furuth_products', JSON.stringify(validProducts));
            
            // Verify the save was successful
            const savedProducts = localStorage.getItem('furuth_products');
            if (!savedProducts) {
                throw new Error('Failed to save products to localStorage');
            }
            
            this.products = validProducts;
            this.filteredProducts = [...validProducts];
            
            console.log(`Successfully saved ${validProducts.length} products to main store`);
        } catch (error) {
            console.error('Error saving products in main store:', error);
        }
    }

    getCart() {
        const cart = localStorage.getItem('furuth_cart');
        return cart ? JSON.parse(cart) : [];
    }

    saveCart(cart) {
        localStorage.setItem('furuth_cart', JSON.stringify(cart));
        this.cart = cart;
        this.updateCartCount();
    }

    getCurrency() {
        return localStorage.getItem('furuth_currency') || 'USD';
    }

    setCurrency(currency) {
        localStorage.setItem('furuth_currency', currency);
        this.currentCurrency = currency;
        this.updateAllPrices();
    }

    // Currency Methods
    formatPrice(priceUSD) {
        if (this.currentCurrency === 'BDT') {
            const priceBDT = priceUSD * this.exchangeRate;
            return `৳${priceBDT.toFixed(0)}`;
        } else {
            return `$${priceUSD.toFixed(2)}`;
        }
    }

    formatDualPrice(priceUSD) {
        const priceBDT = priceUSD * this.exchangeRate;
        return {
            usd: `$${priceUSD.toFixed(2)}`,
            bdt: `৳${priceBDT.toFixed(0)}`,
            primary: this.currentCurrency === 'BDT' ? `৳${priceBDT.toFixed(0)}` : `$${priceUSD.toFixed(2)}`,
            secondary: this.currentCurrency === 'BDT' ? `$${priceUSD.toFixed(2)}` : `৳${priceBDT.toFixed(0)}`
        };
    }

    updateAllPrices() {
        // Refresh the current page to update all prices
        this.loadPageContent();
    }

    // Verify localStorage integrity
    verifyProductsIntegrity() {
        const products = localStorage.getItem('furuth_products');
        if (products) {
            try {
                const parsedProducts = JSON.parse(products);
                if (!Array.isArray(parsedProducts)) {
                    console.error('Products data is not an array, fixing...');
                    localStorage.setItem('furuth_products', JSON.stringify([]));
                    return [];
                }
                return parsedProducts;
            } catch (error) {
                console.error('Corrupted products data, clearing...', error);
                localStorage.setItem('furuth_products', JSON.stringify([]));
                return [];
            }
        }
        return [];
    }

    // Cart Management
    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return false;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }

        this.saveCart(this.cart);
        return true;
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart(this.cart);
    }

    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart(this.cart);
            }
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    updateCartCount() {
        const cartCounts = document.querySelectorAll('#cart-count, .cart-count');
        const count = this.getCartItemCount();
        cartCounts.forEach(element => {
            if (element) element.textContent = count;
        });
    }

    // Product Display
    createProductCard(product) {
        const prices = this.formatDualPrice(product.price);
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden product-card h-full flex flex-col" data-product-id="${product.id}">
                <div class="relative w-full h-56 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" 
                         class="absolute inset-0 w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                         onerror="this.src='https://via.placeholder.com/300x224/4A90E2/FFFFFF?text=${encodeURIComponent(product.name)}'">
                </div>
                <div class="p-4 flex-1 flex flex-col">
                    ${product.category ? `<div class="mb-2"><span class="px-2 py-1 text-xs font-medium rounded-full ${this.getCategoryColor(product.category)} text-white">${this.getCategoryDisplayName(product.category)}</span></div>` : ''}
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-primary transition-colors line-clamp-2" onclick="window.location.href='product.html?id=${product.id}'">${product.name}</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3 flex-1">${product.description || 'No description available'}</p>
                    <div class="flex items-center justify-between mt-auto">
                        <div class="price-container">
                            <span class="text-xl font-bold text-primary block">${prices.primary}</span>
                            <span class="text-sm text-gray-500 dark:text-gray-400">${prices.secondary}</span>
                        </div>
                        <button onclick="furuthStore.addToCart('${product.id}')" 
                                class="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 002 2h8a2 2 0 002-2v-6"></path>
                            </svg>
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    displayProducts(containerId = 'products-grid') {
        const container = document.getElementById(containerId);
        const emptyState = document.getElementById('empty-state');
        const loadingState = document.getElementById('loading-state');
        const noResults = document.getElementById('no-results');

        if (!container) return;

        // Initialize sample products if none exist
        if (this.products.length === 0) {
            this.initializeSampleProducts();
        }

        // Hide loading state
        if (loadingState) loadingState.classList.add('hidden');

        if (this.filteredProducts.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            if (noResults && this.currentSearch) {
                emptyState.classList.add('hidden');
                noResults.classList.remove('hidden');
            }
        } else {
            container.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
            if (emptyState) emptyState.classList.add('hidden');
            if (noResults) noResults.classList.add('hidden');
        }

        // Update product count
        const productCount = document.getElementById('product-count');
        if (productCount) {
            const count = this.filteredProducts.length;
            productCount.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
        }
    }

    // Search and Filter
    searchProducts(query) {
        this.currentSearch = query.toLowerCase();
        this.filterProducts();
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.filterProducts();
    }

    sortProducts(sortBy) {
        this.currentSort = sortBy;
        
        switch (sortBy) {
            case 'name-asc':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
        }
        
        this.displayProducts();
    }

    filterProducts() {
        this.filteredProducts = this.products.filter(product => {
            // Search filter
            const matchesSearch = !this.currentSearch || 
                product.name.toLowerCase().includes(this.currentSearch) ||
                (product.description && product.description.toLowerCase().includes(this.currentSearch));
            
            // Category filter
            const matchesCategory = this.currentCategory === 'all' || 
                product.category === this.currentCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        this.sortProducts(this.currentSort);
    }

    // Cart Display
    displayCart() {
        const cartItems = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const subtotal = document.getElementById('subtotal');
        const tax = document.getElementById('tax');
        const total = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '';
            if (emptyCart) emptyCart.classList.remove('hidden');
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            if (emptyCart) emptyCart.classList.add('hidden');
            if (checkoutBtn) checkoutBtn.disabled = false;

            cartItems.innerHTML = this.cart.map(item => this.createCartItem(item)).join('');
        }

        // Update totals with dual currency
        const subtotalAmount = this.getCartTotal();
        const taxAmount = subtotalAmount * 0.08; // 8% tax
        const shippingAmount = subtotalAmount > 0 ? 5.00 : 0;
        const totalAmount = subtotalAmount + taxAmount + shippingAmount;

        const shipping = document.getElementById('shipping');

        if (this.currentCurrency === 'BDT') {
            // Show BDT as primary, USD as secondary
            const subtotalBDT = subtotalAmount * this.exchangeRate;
            const taxBDT = taxAmount * this.exchangeRate;
            const shippingBDT = shippingAmount * this.exchangeRate;
            const totalBDT = totalAmount * this.exchangeRate;

            if (subtotal) subtotal.innerHTML = `৳${subtotalBDT.toFixed(0)}<br><span class="text-xs text-gray-500">$${subtotalAmount.toFixed(2)}</span>`;
            if (tax) tax.innerHTML = `৳${taxBDT.toFixed(0)}<br><span class="text-xs text-gray-500">$${taxAmount.toFixed(2)}</span>`;
            if (shipping) shipping.innerHTML = `৳${shippingBDT.toFixed(0)}<br><span class="text-xs text-gray-500">$${shippingAmount.toFixed(2)}</span>`;
            if (total) total.innerHTML = `৳${totalBDT.toFixed(0)}<br><span class="text-xs text-gray-500">$${totalAmount.toFixed(2)}</span>`;
        } else {
            // Show USD as primary, BDT as secondary
            const subtotalBDT = subtotalAmount * this.exchangeRate;
            const taxBDT = taxAmount * this.exchangeRate;
            const shippingBDT = shippingAmount * this.exchangeRate;
            const totalBDT = totalAmount * this.exchangeRate;

            if (subtotal) subtotal.innerHTML = `$${subtotalAmount.toFixed(2)}<br><span class="text-xs text-gray-500">৳${subtotalBDT.toFixed(0)}</span>`;
            if (tax) tax.innerHTML = `$${taxAmount.toFixed(2)}<br><span class="text-xs text-gray-500">৳${taxBDT.toFixed(0)}</span>`;
            if (shipping) shipping.innerHTML = `$${shippingAmount.toFixed(2)}<br><span class="text-xs text-gray-500">৳${shippingBDT.toFixed(0)}</span>`;
            if (total) total.innerHTML = `$${totalAmount.toFixed(2)}<br><span class="text-xs text-gray-500">৳${totalBDT.toFixed(0)}</span>`;
        }
    }

    createCartItem(item) {
        const itemPrices = this.formatDualPrice(item.price);
        const totalPrices = this.formatDualPrice(item.price * item.quantity);
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                        <img src="${item.image}" alt="${item.name}" 
                             class="w-full h-full object-cover cursor-pointer"
                             onclick="window.location.href='product.html?id=${item.id}'"
                             onerror="this.src='https://via.placeholder.com/80x80/4A90E2/FFFFFF?text=${encodeURIComponent(item.name)}'">
                    </div>
                    <div class="ml-4 flex-1">
                        <div class="flex justify-between">
                            <div>
                                <h4 class="text-lg font-medium text-gray-900 dark:text-white cursor-pointer hover:text-primary transition-colors" 
                                    onclick="window.location.href='product.html?id=${item.id}'">${item.name}</h4>
                                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    ${itemPrices.primary} each
                                    <span class="text-xs text-gray-400 ml-1">(${itemPrices.secondary})</span>
                                </p>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button onclick="furuthStore.updateCartQuantity('${item.id}', ${item.quantity - 1})" 
                                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                                    </svg>
                                </button>
                                <span class="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md text-sm font-medium text-gray-900 dark:text-white min-w-[3rem] text-center">${item.quantity}</span>
                                <button onclick="furuthStore.updateCartQuantity('${item.id}', ${item.quantity + 1})" 
                                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="mt-2 flex justify-between items-center">
                            <div class="price-container">
                                <p class="text-lg font-semibold text-gray-900 dark:text-white">${totalPrices.primary}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${totalPrices.secondary}</p>
                            </div>
                            <button onclick="furuthStore.removeFromCart('${item.id}')" 
                                    class="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Product Detail Page
    displayProductDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        const loadingState = document.getElementById('loading-state');
        const notFound = document.getElementById('not-found');
        const productContent = document.getElementById('product-content');

        if (!productId) {
            if (loadingState) loadingState.classList.add('hidden');
            if (notFound) notFound.classList.remove('hidden');
            return;
        }

        const product = this.products.find(p => p.id === productId);
        
        if (!product) {
            if (loadingState) loadingState.classList.add('hidden');
            if (notFound) notFound.classList.remove('hidden');
            return;
        }

        // Hide loading and show content
        if (loadingState) loadingState.classList.add('hidden');
        if (productContent) productContent.classList.remove('hidden');

        // Update page content
        document.title = `${product.name} - Furuth`;
        
        const productImage = document.getElementById('product-image');
        const productTitle = document.getElementById('product-title');
        const productPrice = document.getElementById('product-price');
        const productDescription = document.getElementById('product-description');
        const productBreadcrumb = document.getElementById('product-breadcrumb');

        if (productImage) {
            productImage.src = product.image;
            productImage.alt = product.name;
            productImage.onerror = () => productImage.src = `https://via.placeholder.com/500x500/4A90E2/FFFFFF?text=${encodeURIComponent(product.name)}`;
        }
        if (productTitle) productTitle.textContent = product.name;
        const prices = this.formatDualPrice(product.price);
        if (productPrice) {
            productPrice.innerHTML = `
                <span class="block">${prices.primary}</span>
                <span class="text-lg text-gray-500 dark:text-gray-400">${prices.secondary}</span>
            `;
        }
        if (productDescription) productDescription.innerHTML = `<p>${product.description || 'No description available for this product.'}</p>`;
        if (productBreadcrumb) productBreadcrumb.textContent = product.name;

        // Setup add to cart functionality
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(document.getElementById('quantity').value);
                if (this.addToCart(productId, quantity)) {
                    this.showAddToCartSuccess();
                }
            });
        }

        // Show related products
        this.displayRelatedProducts(product.id);
    }

    showAddToCartSuccess() {
        const successMessage = document.getElementById('add-to-cart-success');
        if (successMessage) {
            successMessage.classList.remove('hidden');
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 3000);
        }
    }

    displayRelatedProducts(currentProductId) {
        const relatedSection = document.getElementById('related-products');
        const relatedGrid = document.getElementById('related-products-grid');
        
        if (!relatedSection || !relatedGrid) return;

        const relatedProducts = this.products
            .filter(p => p.id !== currentProductId)
            .slice(0, 4);

        if (relatedProducts.length > 0) {
            relatedGrid.innerHTML = relatedProducts.map(product => this.createProductCard(product)).join('');
            relatedSection.classList.remove('hidden');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortProducts(e.target.value);
            });
        }

        // Category filter functionality
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }

        // Clear search
        const clearSearch = document.getElementById('clear-search');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                this.searchProducts('');
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                alert('Checkout functionality would be implemented here. This is a demo version.');
            });
        }
    }

    // Page-specific content loading
    loadPageContent() {
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index.html':
            case '':
                this.displayProducts();
                break;
            case 'products.html':
                this.displayProducts();
                break;
            case 'cart.html':
                this.displayCart();
                break;
            case 'product.html':
                this.displayProductDetail();
                break;
            case 'orders.html':
                this.initOrdersPage();
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    }

    // Refresh displays (useful for admin operations)
    refresh() {
        this.products = this.getProducts();
        this.filteredProducts = [...this.products];
        this.cart = this.getCart();
        this.updateCartCount();
        this.loadPageContent();
    }

    // Payment System
    showPaymentModal() {
        const modal = document.getElementById('payment-modal');
        const paymentTotal = document.getElementById('payment-total');
        const paymentAmount = document.getElementById('payment-amount');
        
        if (!modal) return;

        // Calculate total
        const subtotal = this.getCartTotal();
        const tax = subtotal * 0.08;
        const shipping = subtotal > 0 ? 5.00 : 0;
        const total = subtotal + tax + shipping;

        // Update display
        const totalDisplay = this.formatDualPrice(total);
        if (paymentTotal) paymentTotal.textContent = totalDisplay.primary;
        if (paymentAmount) paymentAmount.textContent = totalDisplay.primary;

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Setup payment method listeners
        this.setupPaymentMethodListeners();
    }

    closePaymentModal() {
        const modal = document.getElementById('payment-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            this.resetPaymentForm();
        }
    }

    setupPaymentMethodListeners() {
        const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
        const instructions = document.getElementById('payment-instructions');
        const transactionSection = document.getElementById('transaction-section');
        const selectedMethodSpan = document.getElementById('selected-method');
        const confirmBtn = document.getElementById('confirm-payment-btn');

        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                const selectedMethod = e.target.value;
                
                if (selectedMethod) {
                    // Show instructions
                    if (instructions) instructions.classList.remove('hidden');
                    if (transactionSection) transactionSection.classList.remove('hidden');
                    if (selectedMethodSpan) {
                        selectedMethodSpan.textContent = selectedMethod === 'bkash' ? 'bKash' : 'Nagad';
                    }
                    
                    this.validatePaymentForm();
                } else {
                    if (instructions) instructions.classList.add('hidden');
                    if (transactionSection) transactionSection.classList.add('hidden');
                    if (confirmBtn) confirmBtn.disabled = true;
                }
            });
        });

        // Add input listeners for validation
        const requiredFields = ['transaction-id', 'customer-name', 'customer-phone', 'customer-address'];
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.validatePaymentForm());
            }
        });
    }

    validatePaymentForm() {
        const transactionId = document.getElementById('transaction-id')?.value.trim();
        const customerName = document.getElementById('customer-name')?.value.trim();
        const customerPhone = document.getElementById('customer-phone')?.value.trim();
        const customerAddress = document.getElementById('customer-address')?.value.trim();
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
        const confirmBtn = document.getElementById('confirm-payment-btn');

        const isValid = transactionId && customerName && customerPhone && customerAddress && selectedMethod;

        if (confirmBtn) {
            confirmBtn.disabled = !isValid;
        }
    }

    confirmPayment() {
        // Get form data
        const transactionId = document.getElementById('transaction-id').value.trim();
        const customerName = document.getElementById('customer-name').value.trim();
        const customerPhone = document.getElementById('customer-phone').value.trim();
        const customerAddress = document.getElementById('customer-address').value.trim();
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

        // Calculate totals
        const subtotal = this.getCartTotal();
        const tax = subtotal * 0.08;
        const shipping = subtotal > 0 ? 5.00 : 0;
        const total = subtotal + tax + shipping;

        // Create order
        const order = {
            id: this.generateOrderId(),
            items: [...this.cart],
            customer: {
                name: customerName,
                phone: customerPhone,
                address: customerAddress
            },
            payment: {
                method: paymentMethod,
                transactionId: transactionId,
                amount: total,
                currency: this.currentCurrency
            },
            totals: {
                subtotal: subtotal,
                tax: tax,
                shipping: shipping,
                total: total
            },
            status: 'pending',
            orderDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        // Save order
        this.saveOrder(order);

        // Show success message
        this.showOrderConfirmation(order.id);

        // Clear cart and close modal
        this.cart = [];
        this.saveCart(this.cart);
        this.closePaymentModal();
        this.displayCart();
    }

    generateOrderId() {
        return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    saveOrder(order) {
        const orders = this.getOrders();
        orders.push(order);
        localStorage.setItem('furuth_orders', JSON.stringify(orders));
    }

    getOrders() {
        const orders = localStorage.getItem('furuth_orders');
        return orders ? JSON.parse(orders) : [];
    }

    showOrderConfirmation(orderId) {
        alert(`Order confirmed! Your Order ID is: ${orderId}\n\nYour order is now pending approval. You will receive updates on your order status.\n\nThank you for shopping with Furuth!`);
    }

    resetPaymentForm() {
        // Reset form fields
        const fields = ['transaction-id', 'customer-name', 'customer-phone', 'customer-address'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });

        // Reset payment method
        const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
        paymentMethods.forEach(method => method.checked = false);

        // Hide sections
        const instructions = document.getElementById('payment-instructions');
        const transactionSection = document.getElementById('transaction-section');
        const confirmBtn = document.getElementById('confirm-payment-btn');

        if (instructions) instructions.classList.add('hidden');
        if (transactionSection) transactionSection.classList.add('hidden');
        if (confirmBtn) confirmBtn.disabled = true;
    }

    // Order Tracking
    searchOrder() {
        const searchInput = document.getElementById('order-search');
        const orderId = searchInput ? searchInput.value.trim().toUpperCase() : '';
        
        if (!orderId) {
            alert('Please enter an Order ID');
            return;
        }

        const orders = this.getOrders();
        const order = orders.find(o => o.id.toUpperCase() === orderId);
        
        if (order) {
            this.displayOrderResult(order);
        } else {
            this.showNoOrderFound(orderId);
        }
    }

    displayOrderResult(order) {
        const resultsContainer = document.getElementById('order-results');
        const noOrdersState = document.getElementById('no-orders-state');
        
        if (!resultsContainer) return;

        // Hide no orders state
        if (noOrdersState) noOrdersState.classList.add('hidden');

        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            delivered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
        };

        const statusMessages = {
            pending: 'Your payment is being verified. We will approve your order soon.',
            approved: 'Your order has been approved and is being prepared for delivery.',
            delivered: 'Your order has been delivered successfully!'
        };

        const orderDate = new Date(order.orderDate).toLocaleString();
        const lastUpdated = new Date(order.lastUpdated).toLocaleString();
        const totalDisplay = this.formatDualPrice(order.totals.total);

        resultsContainer.innerHTML = `
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Order ${order.id}</h3>
                        <span class="px-3 py-1 text-sm font-medium rounded-full ${statusColors[order.status]}">
                            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Placed on ${orderDate}</p>
                </div>
                
                <div class="px-6 py-4">
                    <div class="mb-6">
                        <div class="flex items-center mb-2">
                            <div class="w-3 h-3 rounded-full ${order.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'} mr-3"></div>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">Payment ${order.status === 'pending' ? 'Verification' : 'Verified'}</span>
                        </div>
                        <div class="flex items-center mb-2">
                            <div class="w-3 h-3 rounded-full ${order.status === 'approved' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'} mr-3"></div>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">Order Approved</span>
                        </div>
                        <div class="flex items-center">
                            <div class="w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'} mr-3"></div>
                            <span class="text-sm font-medium text-gray-900 dark:text-white">Delivered</span>
                        </div>
                        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p class="text-blue-800 dark:text-blue-200 text-sm">${statusMessages[order.status]}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h4 class="font-medium text-gray-900 dark:text-white mb-3">Customer Information</h4>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <span class="text-gray-500 dark:text-gray-400">Name:</span>
                                    <span class="text-gray-900 dark:text-white ml-2">${order.customer.name}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 dark:text-gray-400">Phone:</span>
                                    <span class="text-gray-900 dark:text-white ml-2">${order.customer.phone}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 dark:text-gray-400">Address:</span>
                                    <span class="text-gray-900 dark:text-white ml-2">${order.customer.address}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-medium text-gray-900 dark:text-white mb-3">Payment Information</h4>
                            <div class="space-y-2 text-sm">
                                <div>
                                    <span class="text-gray-500 dark:text-gray-400">Method:</span>
                                    <span class="text-gray-900 dark:text-white ml-2">${order.payment.method.toUpperCase()}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                                    <span class="text-gray-900 dark:text-white ml-2 font-mono">${order.payment.transactionId}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500 dark:text-gray-400">Total:</span>
                                    <span class="text-gray-900 dark:text-white ml-2 font-semibold">${totalDisplay.primary}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-medium text-gray-900 dark:text-white mb-3">Order Items</h4>
                        <div class="space-y-3">
                            ${order.items.map(item => {
                                const itemTotal = this.formatDualPrice(item.price * item.quantity);
                                return `
                                    <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                        <div class="flex-1">
                                            <h5 class="font-medium text-gray-900 dark:text-white">${item.name}</h5>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">Quantity: ${item.quantity}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-medium text-gray-900 dark:text-white">${itemTotal.primary}</p>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">${itemTotal.secondary}</p>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        Last updated: ${lastUpdated}
                    </div>
                </div>
            </div>
        `;
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    showNoOrderFound(orderId) {
        const resultsContainer = document.getElementById('order-results');
        const noOrdersState = document.getElementById('no-orders-state');
        
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
                    <div class="text-red-400 mb-4">
                        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Order Not Found</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">
                        We couldn't find an order with ID: <strong>${orderId}</strong>
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Please check your Order ID and try again. Order IDs are case-sensitive and typically start with "ORD-".
                    </p>
                </div>
            `;
        }
        
        if (noOrdersState) noOrdersState.classList.add('hidden');
    }

    initOrdersPage() {
        // Setup enter key for search
        const orderSearch = document.getElementById('order-search');
        if (orderSearch) {
            orderSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchOrder();
                }
            });
        }

        // Load all orders by default
        this.loadAllOrders();
    }

    showOrderTab(tabName) {
        // Update tab buttons
        const tabs = document.querySelectorAll('.order-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active', 'border-primary', 'text-primary');
            tab.classList.add('border-transparent', 'text-gray-500');
        });

        // Update tab contents
        const contents = document.querySelectorAll('.tab-content');
        contents.forEach(content => {
            content.classList.add('hidden');
        });

        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-orders-tab`);
        const selectedContent = document.getElementById(`${tabName}-orders-content`);

        if (selectedTab) {
            selectedTab.classList.add('active', 'border-primary', 'text-primary');
            selectedTab.classList.remove('border-transparent', 'text-gray-500');
        }

        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }

        // Clear search results when switching tabs
        if (tabName === 'all') {
            const orderResults = document.getElementById('order-results');
            if (orderResults) orderResults.innerHTML = '';
        }
    }

    loadAllOrders() {
        const orders = this.getOrders();
        const allOrdersList = document.getElementById('all-orders-list');
        const noOrdersState = document.getElementById('no-orders-state');
        
        if (!allOrdersList) return;

        if (orders.length === 0) {
            allOrdersList.innerHTML = '';
            if (noOrdersState) noOrdersState.classList.remove('hidden');
        } else {
            if (noOrdersState) noOrdersState.classList.add('hidden');
            
            // Sort orders by date (newest first)
            const sortedOrders = orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
            
            allOrdersList.innerHTML = sortedOrders.map(order => this.createOrderSummaryCard(order)).join('');
        }
    }

    createOrderSummaryCard(order) {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            delivered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
        };

        const orderDate = new Date(order.orderDate).toLocaleDateString();
        const totalDisplay = this.formatDualPrice(order.totals.total);

        return `
            <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">${order.id}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Ordered on ${orderDate}</p>
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]} mb-2">
                            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <div class="text-right">
                            <p class="text-lg font-semibold text-gray-900 dark:text-white">${totalDisplay.primary}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${totalDisplay.secondary}</p>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Items (${order.items.length}):</h4>
                    <div class="flex flex-wrap gap-2">
                        ${order.items.slice(0, 3).map(item => `
                            <div class="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-sm">
                                <img src="${item.image}" alt="${item.name}" class="w-8 h-8 rounded object-cover mr-2" 
                                     onerror="this.src='https://via.placeholder.com/32x32/4A90E2/FFFFFF?text=${encodeURIComponent(item.name.charAt(0))}'">
                                <span class="text-gray-900 dark:text-white">${item.name} (${item.quantity})</span>
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? `<span class="text-sm text-gray-500 dark:text-gray-400 self-center">+${order.items.length - 3} more</span>` : ''}
                    </div>
                </div>

                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-600 dark:text-gray-300">
                        <span class="font-medium">${order.payment.method.toUpperCase()}</span> • 
                        <span>TxID: ${order.payment.transactionId}</span>
                    </div>
                    <button onclick="furuthStore.viewOrderDetails('${order.id}')" 
                            class="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-blue-700 transition-colors">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    viewOrderDetails(orderId) {
        // Switch to search tab and show the order details
        this.showOrderTab('search');
        
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            this.displayOrderResult(order);
            
            // Scroll to the results
            const orderResults = document.getElementById('order-results');
            if (orderResults) {
                orderResults.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    getCategoryColor(category) {
        switch(category) {
            case 'men': return 'bg-blue-500';
            case 'women': return 'bg-pink-500';
            case 'kids': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    }

    getCategoryDisplayName(category) {
        switch(category) {
            case 'men': return 'Men';
            case 'women': return 'Women';  
            case 'kids': return 'Kids';
            default: return 'General';
        }
    }

    initializeSampleProducts() {
        const sampleProducts = [
            {
                id: 'sample-' + Date.now() + '-1',
                name: 'Men\'s Classic T-Shirt',
                price: 29.99,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
                description: 'Comfortable cotton t-shirt perfect for everyday wear.',
                category: 'men',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'sample-' + Date.now() + '-2',
                name: 'Women\'s Summer Dress',
                price: 49.99,
                image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
                description: 'Elegant summer dress made from lightweight fabric.',
                category: 'women',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'sample-' + Date.now() + '-3',
                name: 'Kids Colorful Sneakers',
                price: 35.99,
                image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop',
                description: 'Fun and comfortable sneakers for active kids.',
                category: 'kids',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'sample-' + Date.now() + '-4',
                name: 'Men\'s Casual Jeans',
                price: 79.99,
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
                description: 'Premium denim jeans with perfect fit.',
                category: 'men',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'sample-' + Date.now() + '-5',
                name: 'Women\'s Elegant Blouse',
                price: 55.99,
                image: 'https://images.unsplash.com/photo-1564557287817-3785e38ec2d5?w=300&h=300&fit=crop',
                description: 'Stylish blouse for professional occasions.',
                category: 'women',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'sample-' + Date.now() + '-6',
                name: 'Kids Rainbow Backpack',
                price: 25.99,
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
                description: 'Colorful and durable backpack for school.',
                category: 'kids',
                dateAdded: new Date().toISOString()
            }
        ];

        this.saveProducts(sampleProducts);
        this.products = sampleProducts;
        this.filteredProducts = [...sampleProducts];
    }

    initializeSampleProductsToStorage() {
        const sampleProducts = [
            {
                id: 'sample-' + Date.now() + '-1',
                name: 'Men\'s Classic T-Shirt',
                price: 29.99,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
                description: 'Comfortable cotton t-shirt perfect for everyday wear.',
                category: 'men',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'sample-' + Date.now() + '-2',
                name: 'Women\'s Summer Dress',
                price: 49.99,
                image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
                description: 'Elegant summer dress made from lightweight fabric.',
                category: 'women',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'sample-' + Date.now() + '-3',
                name: 'Kids Colorful Sneakers',
                price: 35.99,
                image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop',
                description: 'Fun and comfortable sneakers for active kids.',
                category: 'kids',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'sample-' + Date.now() + '-4',
                name: 'Men\'s Casual Jeans',
                price: 79.99,
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
                description: 'Premium denim jeans with perfect fit.',
                category: 'men',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'sample-' + Date.now() + '-5',
                name: 'Women\'s Elegant Blouse',
                price: 55.99,
                image: 'https://images.unsplash.com/photo-1564557287817-3785e38ec2d5?w=300&h=300&fit=crop',
                description: 'Stylish blouse for professional occasions.',
                category: 'women',
                dateAdded: new Date().toISOString()
            },
            {
                id: 'sample-' + Date.now() + '-6',
                name: 'Kids Rainbow Backpack',
                price: 25.99,
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
                description: 'Colorful and durable backpack for school.',
                category: 'kids',
                dateAdded: new Date().toISOString()
            }
        ];

        this.saveProducts(sampleProducts);
        localStorage.setItem('furuth_initialized', 'true');
    }
}

// Initialize the store when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.furuthStore = new FuruthStore();
});

// Show cart notification when items are added
document.addEventListener('click', (e) => {
    if (e.target.matches('[onclick*="addToCart"]') || e.target.closest('[onclick*="addToCart"]')) {
        // Small delay to allow cart update
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
            notification.textContent = 'Item added to cart!';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }, 100);
    }
});

// Handle cart updates on cart page
document.addEventListener('click', (e) => {
    if (window.location.pathname.includes('cart.html')) {
        if (e.target.matches('[onclick*="updateCartQuantity"]') || 
            e.target.matches('[onclick*="removeFromCart"]') ||
            e.target.closest('[onclick*="updateCartQuantity"]') ||
            e.target.closest('[onclick*="removeFromCart"]')) {
            // Small delay to allow cart update
            setTimeout(() => {
                window.furuthStore.displayCart();
            }, 100);
        }
    }
});