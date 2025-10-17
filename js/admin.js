// Admin JavaScript file for Furuth e-commerce website
// Handles admin authentication and product management

class FuruthAdmin {
    constructor() {
        this.isLoggedIn = this.checkLoginStatus();
        this.products = this.getProducts();
        
        // Check if products might have been lost
        this.checkForDataLoss();
        
        this.init();
    }

    init() {
        this.setupPage();
        this.setupEventListeners();
        this.setupTabs();
        this.updateProductsList();
    }

    // Authentication
    checkLoginStatus() {
        const loginStatus = sessionStorage.getItem('furuth_admin_logged_in');
        return loginStatus === 'true';
    }

    login(username, password) {
        // Hardcoded credentials as specified
        const validUsername = 'Shoaib';
        const validPassword = 'AllAhu@3211';
        
        if (username === validUsername && password === validPassword) {
            sessionStorage.setItem('furuth_admin_logged_in', 'true');
            this.isLoggedIn = true;
            this.showDashboard();
            return true;
        }
        return false;
    }

    logout() {
        sessionStorage.removeItem('furuth_admin_logged_in');
        this.isLoggedIn = false;
        this.showLogin();
    }

    // UI Management
    setupPage() {
        const loginSection = document.getElementById('login-section');
        const adminDashboard = document.getElementById('admin-dashboard');
        const logoutBtn = document.getElementById('logout-btn');

        if (this.isLoggedIn) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        const loginSection = document.getElementById('login-section');
        const adminDashboard = document.getElementById('admin-dashboard');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginSection) loginSection.classList.remove('hidden');
        if (adminDashboard) adminDashboard.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }

    showDashboard() {
        const loginSection = document.getElementById('login-section');
        const adminDashboard = document.getElementById('admin-dashboard');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginSection) loginSection.classList.add('hidden');
        if (adminDashboard) adminDashboard.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    }

    showLoginError() {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.classList.remove('hidden');
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 3000);
        }
    }

    showSuccessMessage(message = 'Product added successfully!') {
        const successDiv = document.getElementById('success-message');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.classList.remove('hidden');
            setTimeout(() => {
                successDiv.classList.add('hidden');
            }, 3000);
        }
    }

    // Product Management
    getProducts() {
        // Use integrity verification to ensure data consistency
        return this.verifyProductsIntegrity();
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
            this.updateProductsList();
            
            // Refresh main store if it exists
            if (window.furuthStore) {
                window.furuthStore.refresh();
            }
            
            // Create backup
            this.createProductsBackup(validProducts);
            
            console.log(`Successfully saved ${validProducts.length} products`);
        } catch (error) {
            console.error('Error saving products:', error);
            alert('Error saving products. Please try again.');
        }
    }

    // Create backup of products
    createProductsBackup(products) {
        try {
            const backup = {
                products: products,
                timestamp: new Date().toISOString(),
                count: products.length
            };
            localStorage.setItem('furuth_products_backup', JSON.stringify(backup));
        } catch (error) {
            console.error('Error creating products backup:', error);
        }
    }

    // Restore from backup if needed
    restoreFromBackup() {
        try {
            const backup = localStorage.getItem('furuth_products_backup');
            if (backup) {
                const backupData = JSON.parse(backup);
                if (backupData.products && Array.isArray(backupData.products)) {
                    this.saveProducts(backupData.products);
                    alert(`Restored ${backupData.count} products from backup (${new Date(backupData.timestamp).toLocaleString()})`);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error restoring from backup:', error);
            return false;
        }
    }

    // Check for potential data loss
    checkForDataLoss() {
        try {
            const currentProducts = this.products.length;
            const backup = localStorage.getItem('furuth_products_backup');
            
            if (backup && currentProducts === 0) {
                const backupData = JSON.parse(backup);
                if (backupData.count > 0) {
                    console.warn('Detected potential data loss. Backup available.');
                    // Auto-restore if logged in as admin and products were lost
                    if (this.isLoggedIn) {
                        setTimeout(() => {
                            if (confirm(`It appears ${backupData.count} products may have been lost. Would you like to restore from backup?`)) {
                                this.restoreFromBackup();
                            }
                        }, 1000);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking for data loss:', error);
        }
    }

    generateProductId() {
        return 'prod_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    addProduct(productData) {
        // Clean and normalize the image path
        let imagePath = productData.image.trim();
        
        // Remove absolute path if provided and keep only the relative path
        if (imagePath.includes('\\images\\') || imagePath.includes('/images/')) {
            const parts = imagePath.split(/[\\\/]images[\\\/]/);
            if (parts.length > 1) {
                imagePath = 'images/' + parts[parts.length - 1];
            }
        }
        
        // Ensure it starts with images/
        if (!imagePath.startsWith('images/') && imagePath.length > 0) {
            imagePath = 'images/' + imagePath;
        }

        const newProduct = {
            id: this.generateProductId(),
            name: productData.name.trim(),
            price: parseFloat(productData.price),
            image: imagePath,
            description: productData.description.trim(),
            dateAdded: new Date().toISOString()
        };

        // Validate required fields
        if (!newProduct.name || !newProduct.price || !newProduct.image) {
            alert('Please fill in all required fields (Name, Price, Image Path)');
            return false;
        }

        // Validate price
        if (newProduct.price <= 0) {
            alert('Price must be greater than 0');
            return false;
        }

        // Validate image path
        if (!newProduct.image.startsWith('images/')) {
            alert('Image path must start with "images/" (e.g., images/product1.jpg)');
            return false;
        }

        // Validate image format
        const validFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
        const imageLower = newProduct.image.toLowerCase();
        const hasValidFormat = validFormats.some(format => imageLower.endsWith(format));
        
        if (!hasValidFormat) {
            alert('Please use a valid image format: JPG, JPEG, PNG, WebP, GIF, or SVG');
            return false;
        }

        this.products.push(newProduct);
        this.saveProducts(this.products);
        this.clearForm();
        this.showSuccessMessage();
        
        return true;
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts(this.products);
        }
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            alert('Product not found!');
            return;
        }

        // Fill the form with existing product data
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-category').value = product.category || '';

        // Set price in USD (products are stored in USD)
        this.switchInputCurrency('USD');
        document.getElementById('product-price').value = product.price;

        // Change form title and button
        const formTitle = document.querySelector('#admin-dashboard h2');
        const submitButton = document.querySelector('#add-product-form button[type="submit"]');
        
        if (formTitle) formTitle.textContent = 'Edit Product';
        if (submitButton) submitButton.textContent = 'Update Product';

        // Store the product ID for updating
        document.getElementById('add-product-form').setAttribute('data-editing-id', productId);

        // Scroll to form
        document.getElementById('add-product-form').scrollIntoView({ behavior: 'smooth' });

        // Show edit indicator
        this.showEditIndicator(product.name);
    }

    showEditIndicator(productName) {
        // Remove existing indicator
        const existingIndicator = document.getElementById('edit-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Create edit indicator
        const indicator = document.createElement('div');
        indicator.id = 'edit-indicator';
        indicator.className = 'mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded';
        indicator.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                    </svg>
                    <span><strong>Editing:</strong> ${productName}</span>
                </div>
                <button onclick="furuthAdmin.cancelEdit()" class="text-yellow-800 hover:text-yellow-900 font-medium">
                    Cancel Edit
                </button>
            </div>
        `;

        // Insert before the form
        const form = document.getElementById('add-product-form');
        form.parentNode.insertBefore(indicator, form);
    }

    cancelEdit() {
        // Reset form
        this.clearForm();
        
        // Reset form title and button
        const formTitle = document.querySelector('#admin-dashboard h2');
        const submitButton = document.querySelector('#add-product-form button[type="submit"]');
        
        if (formTitle) formTitle.textContent = 'Add New Product';
        if (submitButton) submitButton.textContent = 'Add Product';

        // Remove editing ID
        document.getElementById('add-product-form').removeAttribute('data-editing-id');

        // Remove edit indicator
        const indicator = document.getElementById('edit-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    updateProduct(productId, productData) {
        const productIndex = this.products.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            alert('Product not found!');
            return false;
        }

        // Clean and normalize the image path
        let imagePath = productData.image.trim();
        
        // Remove absolute path if provided and keep only the relative path
        if (imagePath.includes('\\images\\') || imagePath.includes('/images/')) {
            const parts = imagePath.split(/[\\\/]images[\\\/]/);
            if (parts.length > 1) {
                imagePath = 'images/' + parts[parts.length - 1];
            }
        }
        
        // Ensure it starts with images/
        if (!imagePath.startsWith('images/') && imagePath.length > 0) {
            imagePath = 'images/' + imagePath;
        }

        // Update the product
        this.products[productIndex] = {
            ...this.products[productIndex],
            name: productData.name.trim(),
            price: parseFloat(productData.price),
            image: imagePath,
            description: productData.description.trim(),
            lastModified: new Date().toISOString()
        };

        // Validate updated product
        const updatedProduct = this.products[productIndex];
        
        if (!updatedProduct.name || !updatedProduct.price || !updatedProduct.image) {
            alert('Please fill in all required fields (Name, Price, Image Path)');
            return false;
        }

        if (updatedProduct.price <= 0) {
            alert('Price must be greater than 0');
            return false;
        }

        // Validate image format
        const validFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
        const imageLower = updatedProduct.image.toLowerCase();
        const hasValidFormat = validFormats.some(format => imageLower.endsWith(format));
        
        if (!hasValidFormat) {
            alert('Please use a valid image format: JPG, JPEG, PNG, WebP, GIF, or SVG');
            return false;
        }

        this.saveProducts(this.products);
        this.cancelEdit();
        this.showSuccessMessage('Product updated successfully!');
        
        return true;
    }

    clearForm() {
        const form = document.getElementById('add-product-form');
        if (form) {
            form.reset();
            // Reset currency to USD
            this.switchInputCurrency('USD');
        }
    }

    // Product Display
    updateProductsList() {
        const container = document.getElementById('admin-products-list');
        const emptyState = document.getElementById('admin-empty-state');

        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            container.innerHTML = this.products.map(product => this.createProductListItem(product)).join('');
        }
    }

    createProductListItem(product) {
        const dateAdded = product.dateAdded ? new Date(product.dateAdded).toLocaleDateString() : 'Unknown';
        
        return `
            <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0">
                        <img src="${product.image}" alt="${product.name}" 
                             class="w-16 h-16 object-cover rounded-lg"
                             onerror="this.src='https://via.placeholder.com/64x64?text=No+Image'">
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="text-lg font-medium text-gray-900 dark:text-white truncate">${product.name}</h4>
                            ${product.category ? `<span class="px-2 py-1 text-xs font-medium rounded-full ${this.getCategoryColor(product.category)} text-white">${this.getCategoryDisplayName(product.category)}</span>` : ''}
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${product.description || 'No description'}</p>
                        <div class="flex items-center justify-between mt-2">
                            <div class="flex items-center space-x-4">
                                <span class="text-lg font-semibold text-primary">$${product.price.toFixed(2)}</span>
                                <span class="text-xs text-gray-500 dark:text-gray-400">Added: ${dateAdded}</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <a href="product.html?id=${product.id}" target="_blank"
                                   class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                                    View
                                </a>
                                <button onclick="furuthAdmin.editProduct('${product.id}')" 
                                        class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium">
                                    Edit
                                </button>
                                <button onclick="furuthAdmin.deleteProduct('${product.id}')" 
                                        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <strong>Image Path:</strong> ${product.image}
                </div>
            </div>
        `;
    }

    // Event Listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                if (this.login(username, password)) {
                    // Login successful
                } else {
                    this.showLoginError();
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Add product form
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                
                // Get price and convert to USD if needed
                const inputPrice = parseFloat(formData.get('productPrice'));
                const inputCurrency = document.getElementById('price-currency').value;
                const priceInUSD = inputCurrency === 'BDT' ? inputPrice / 110 : inputPrice;
                
                const productData = {
                    name: formData.get('productName'),
                    price: priceInUSD,
                    image: formData.get('productImage'),
                    description: formData.get('productDescription'),
                    category: formData.get('productCategory')
                };
                
                // Check if we're editing or adding
                const editingId = e.target.getAttribute('data-editing-id');
                
                if (editingId) {
                    // Update existing product
                    this.updateProduct(editingId, productData);
                } else {
                    // Add new product
                    this.addProduct(productData);
                }
            });
        }

        // Currency toggle buttons
        this.setupCurrencyToggle();

        // Image path helper with preview
        const imageInput = document.getElementById('product-image');
        const pathPreview = document.getElementById('path-preview');
        const cleanPath = document.getElementById('clean-path');
        
        if (imageInput) {
            imageInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                const validFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
                
                // Clean and normalize the path for preview
                let cleanedPath = value;
                if (cleanedPath.includes('\\images\\') || cleanedPath.includes('/images/')) {
                    const parts = cleanedPath.split(/[\\\/]images[\\\/]/);
                    if (parts.length > 1) {
                        cleanedPath = 'images/' + parts[parts.length - 1];
                    }
                }
                if (!cleanedPath.startsWith('images/') && cleanedPath.length > 0) {
                    cleanedPath = 'images/' + cleanedPath;
                }
                
                // Show preview if path was cleaned
                if (cleanedPath !== value && cleanedPath.length > 0) {
                    if (pathPreview && cleanPath) {
                        cleanPath.textContent = cleanedPath;
                        pathPreview.classList.remove('hidden');
                    }
                } else {
                    if (pathPreview) {
                        pathPreview.classList.add('hidden');
                    }
                }
                
                // Validation
                if (value && !cleanedPath.startsWith('images/')) {
                    e.target.setCustomValidity('Image path must start with "images/" (e.g., images/product1.jpg)');
                } else if (value && !validFormats.some(format => cleanedPath.toLowerCase().endsWith(format))) {
                    e.target.setCustomValidity('Please use a valid image format: JPG, JPEG, PNG, WebP, GIF, or SVG');
                } else {
                    e.target.setCustomValidity('');
                }
            });
        }

        // Real-time form validation
        const priceInput = document.getElementById('product-price');
        if (priceInput) {
            priceInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (value <= 0) {
                    e.target.setCustomValidity('Price must be greater than 0');
                } else {
                    e.target.setCustomValidity('');
                }
                // Update price preview when typing
                this.updatePricePreview();
            });
        }
    }

    // Setup currency toggle functionality
    setupCurrencyToggle() {
        const usdBtn = document.getElementById('usd-input-btn');
        const bdtBtn = document.getElementById('bdt-input-btn');
        const priceInput = document.getElementById('product-price');
        const currencySymbol = document.getElementById('price-currency-symbol');
        const currencyInput = document.getElementById('price-currency');

        if (!usdBtn || !bdtBtn || !priceInput || !currencySymbol || !currencyInput) return;

        // USD button click
        usdBtn.addEventListener('click', () => {
            this.switchInputCurrency('USD');
        });

        // BDT button click
        bdtBtn.addEventListener('click', () => {
            this.switchInputCurrency('BDT');
        });

        // Initialize with USD
        this.switchInputCurrency('USD');
    }

    // Switch input currency
    switchInputCurrency(currency) {
        const usdBtn = document.getElementById('usd-input-btn');
        const bdtBtn = document.getElementById('bdt-input-btn');
        const priceInput = document.getElementById('product-price');
        const currencySymbol = document.getElementById('price-currency-symbol');
        const currencyInput = document.getElementById('price-currency');
        const currentValue = parseFloat(priceInput.value) || 0;

        if (currency === 'USD') {
            // Switch to USD input
            usdBtn.className = 'flex-1 px-3 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-blue-700 transition-colors';
            bdtBtn.className = 'flex-1 px-3 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors';
            currencySymbol.textContent = '$';
            currencyInput.value = 'USD';
            priceInput.step = '0.01';
            priceInput.placeholder = '0.00';
            
            // Convert current BDT value to USD if switching from BDT
            if (currencyInput.value === 'BDT' && currentValue > 0) {
                priceInput.value = (currentValue / 110).toFixed(2);
            }
        } else {
            // Switch to BDT input
            bdtBtn.className = 'flex-1 px-3 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-blue-700 transition-colors';
            usdBtn.className = 'flex-1 px-3 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors';
            currencySymbol.textContent = '৳';
            currencyInput.value = 'BDT';
            priceInput.step = '1';
            priceInput.placeholder = '0';
            
            // Convert current USD value to BDT if switching from USD
            if (currencyInput.value === 'USD' && currentValue > 0) {
                priceInput.value = Math.round(currentValue * 110);
            }
        }

        // Update price preview
        this.updatePricePreview();
    }

    // Update price preview showing equivalent in other currency
    updatePricePreview() {
        const priceInput = document.getElementById('product-price');
        const currencyInput = document.getElementById('price-currency');
        const pricePreview = document.getElementById('price-preview');
        const priceEquivalent = document.getElementById('price-equivalent');
        
        if (!priceInput || !currencyInput || !pricePreview || !priceEquivalent) return;

        const inputValue = parseFloat(priceInput.value);
        
        if (inputValue > 0) {
            const inputCurrency = currencyInput.value;
            let equivalentText = '';
            
            if (inputCurrency === 'USD') {
                const bdtValue = Math.round(inputValue * 110);
                equivalentText = `৳${bdtValue} BDT`;
            } else {
                const usdValue = (inputValue / 110).toFixed(2);
                equivalentText = `$${usdValue} USD`;
            }
            
            priceEquivalent.textContent = equivalentText;
            pricePreview.classList.remove('hidden');
        } else {
            pricePreview.classList.add('hidden');
        }
    }

    // Utility Methods
    exportProducts() {
        const dataStr = JSON.stringify(this.products, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `furuth_products_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importProducts(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const products = JSON.parse(e.target.result);
                if (Array.isArray(products)) {
                    // Validate products structure
                    const validProducts = products.filter(p => 
                        p.name && typeof p.price === 'number' && p.image
                    );
                    
                    if (validProducts.length > 0) {
                        this.products = validProducts;
                        this.saveProducts(this.products);
                        alert(`Successfully imported ${validProducts.length} products`);
                    } else {
                        alert('No valid products found in the file');
                    }
                } else {
                    alert('Invalid file format');
                }
            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Verify localStorage integrity
    verifyProductsIntegrity() {
        const products = localStorage.getItem('furuth_products');
        if (products) {
            try {
                const parsedProducts = JSON.parse(products);
                if (!Array.isArray(parsedProducts)) {
                    console.error('Products data is not an array in admin, fixing...');
                    localStorage.setItem('furuth_products', JSON.stringify([]));
                    return [];
                }
                return parsedProducts;
            } catch (error) {
                console.error('Corrupted products data in admin, clearing...', error);
                localStorage.setItem('furuth_products', JSON.stringify([]));
                return [];
            }
        }
        return [];
    }

    // Initialize sample products (for demo purposes)
    initializeSampleProducts() {
        if (this.products.length === 0) {
            const sampleProducts = [
                {
                    id: this.generateProductId(),
                    name: 'Men\'s Classic T-Shirt',
                    price: 29.99,
                    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
                    description: 'Comfortable cotton t-shirt perfect for everyday wear.',
                    category: 'men',
                    dateAdded: new Date().toISOString()
                },
                {
                    id: this.generateProductId(),
                    name: 'Women\'s Summer Dress',
                    price: 49.99,
                    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
                    description: 'Elegant summer dress made from lightweight fabric.',
                    category: 'women',
                    dateAdded: new Date().toISOString()
                },
                {
                    id: this.generateProductId(),
                    name: 'Kids Colorful Sneakers',
                    price: 35.99,
                    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop',
                    description: 'Fun and comfortable sneakers for active kids.',
                    category: 'kids',
                    dateAdded: new Date().toISOString()
                }
            ];
            
            this.saveProducts(sampleProducts);
        }
    }

    // Tab Management
    setupTabs() {
        const productsTab = document.getElementById('products-tab');
        const ordersTab = document.getElementById('orders-tab');
        const productsContent = document.getElementById('products-content');
        const ordersContent = document.getElementById('orders-content');

        if (productsTab && ordersTab) {
            productsTab.addEventListener('click', () => {
                this.showTab('products');
            });

            ordersTab.addEventListener('click', () => {
                this.showTab('orders');
                this.loadOrders();
            });
        }
    }

    showTab(tabName) {
        // Update tab buttons
        const tabs = document.querySelectorAll('.tab-button');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.classList.remove('active', 'border-primary', 'text-primary');
            tab.classList.add('border-transparent', 'text-gray-500');
        });

        contents.forEach(content => {
            content.classList.add('hidden');
        });

        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        const selectedContent = document.getElementById(`${tabName}-content`);

        if (selectedTab) {
            selectedTab.classList.add('active', 'border-primary', 'text-primary');
            selectedTab.classList.remove('border-transparent', 'text-gray-500');
        }

        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }
    }

    // Order Management
    getOrders() {
        const orders = localStorage.getItem('furuth_orders');
        return orders ? JSON.parse(orders) : [];
    }

    loadOrders() {
        const orders = this.getOrders();
        this.updateOrderStats(orders);
        this.displayOrders(orders);
    }

    updateOrderStats(orders) {
        const totalOrders = document.getElementById('total-orders');
        const pendingOrders = document.getElementById('pending-orders');
        const approvedOrders = document.getElementById('approved-orders');
        const deliveredOrders = document.getElementById('delivered-orders');

        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            approved: orders.filter(o => o.status === 'approved').length,
            delivered: orders.filter(o => o.status === 'delivered').length
        };

        if (totalOrders) totalOrders.textContent = stats.total;
        if (pendingOrders) pendingOrders.textContent = stats.pending;
        if (approvedOrders) approvedOrders.textContent = stats.approved;
        if (deliveredOrders) deliveredOrders.textContent = stats.delivered;
    }

    displayOrders(orders) {
        const ordersList = document.getElementById('orders-list');
        const emptyState = document.getElementById('orders-empty-state');

        if (!ordersList) return;

        if (orders.length === 0) {
            ordersList.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            ordersList.innerHTML = orders.map(order => this.createOrderCard(order)).join('');
        }
    }

    createOrderCard(order) {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            delivered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
        };

        const orderDate = new Date(order.orderDate).toLocaleString();
        const totalDisplay = order.payment.currency === 'BDT' ? 
            `৳${Math.round(order.totals.total * 110)}` : 
            `$${order.totals.total.toFixed(2)}`;

        return `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="font-semibold text-gray-900 dark:text-white">${order.id}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${orderDate}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}">
                            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <div class="relative">
                            <button onclick="furuthAdmin.toggleOrderActions('${order.id}')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                                </svg>
                            </button>
                            <div id="actions-${order.id}" class="hidden absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
                                ${order.status === 'pending' ? `<button onclick="furuthAdmin.updateOrderStatus('${order.id}', 'approved')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Approve Order</button>` : ''}
                                ${order.status === 'approved' ? `<button onclick="furuthAdmin.updateOrderStatus('${order.id}', 'delivered')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Mark as Delivered</button>` : ''}
                                <button onclick="furuthAdmin.viewOrderDetails('${order.id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500 dark:text-gray-400">Customer:</span>
                        <span class="text-gray-900 dark:text-white">${order.customer.name}</span>
                    </div>
                    <div>
                        <span class="text-gray-500 dark:text-gray-400">Phone:</span>
                        <span class="text-gray-900 dark:text-white">${order.customer.phone}</span>
                    </div>
                    <div>
                        <span class="text-gray-500 dark:text-gray-400">Payment:</span>
                        <span class="text-gray-900 dark:text-white">${order.payment.method.toUpperCase()}</span>
                    </div>
                    <div>
                        <span class="text-gray-500 dark:text-gray-400">Total:</span>
                        <span class="text-gray-900 dark:text-white font-semibold">${totalDisplay}</span>
                    </div>
                </div>
                
                <div class="mt-3">
                    <span class="text-gray-500 dark:text-gray-400 text-sm">Transaction ID:</span>
                    <span class="text-gray-900 dark:text-white text-sm font-mono">${order.payment.transactionId}</span>
                </div>
                
                <div class="mt-3">
                    <span class="text-gray-500 dark:text-gray-400 text-sm">Items:</span>
                    <span class="text-gray-900 dark:text-white text-sm">${order.items.length} item(s)</span>
                </div>
            </div>
        `;
    }

    toggleOrderActions(orderId) {
        // Close all other dropdowns first
        document.querySelectorAll('[id^="actions-"]').forEach(el => {
            if (el.id !== `actions-${orderId}`) {
                el.classList.add('hidden');
            }
        });

        // Toggle current dropdown
        const actions = document.getElementById(`actions-${orderId}`);
        if (actions) {
            actions.classList.toggle('hidden');
        }
    }

    updateOrderStatus(orderId, newStatus) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            orders[orderIndex].lastUpdated = new Date().toISOString();
            
            localStorage.setItem('furuth_orders', JSON.stringify(orders));
            
            // Refresh display
            this.loadOrders();
            
            // Hide actions dropdown
            const actions = document.getElementById(`actions-${orderId}`);
            if (actions) actions.classList.add('hidden');
            
            alert(`Order ${orderId} status updated to ${newStatus}`);
        }
    }

    viewOrderDetails(orderId) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            const items = order.items.map(item => `- ${item.name} x${item.quantity} ($${item.price})`).join('\n');
            const orderDate = new Date(order.orderDate).toLocaleString();
            const lastUpdated = new Date(order.lastUpdated).toLocaleString();
            
            alert(`Order Details: ${order.id}\n\nCustomer: ${order.customer.name}\nPhone: ${order.customer.phone}\nAddress: ${order.customer.address}\n\nPayment Method: ${order.payment.method.toUpperCase()}\nTransaction ID: ${order.payment.transactionId}\nTotal: $${order.totals.total.toFixed(2)}\n\nItems:\n${items}\n\nOrder Date: ${orderDate}\nLast Updated: ${lastUpdated}\nStatus: ${order.status.toUpperCase()}`);
        }
        
        // Hide actions dropdown
        const actions = document.getElementById(`actions-${orderId}`);
        if (actions) actions.classList.add('hidden');
    }

    refreshOrders() {
        this.loadOrders();
        alert('Orders refreshed!');
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
}

// Initialize admin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.furuthAdmin = new FuruthAdmin();
    
    // Add sample products button (for demo purposes)
    if (document.querySelector('.border-4.border-dashed')) {
        const sampleBtn = document.createElement('button');
        sampleBtn.textContent = 'Add Sample Products (Demo)';
        sampleBtn.className = 'mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors text-sm';
        sampleBtn.onclick = () => {
            furuthAdmin.initializeSampleProducts();
            sampleBtn.style.display = 'none';
        };
        
        const dashboard = document.getElementById('admin-dashboard');
        if (dashboard && furuthAdmin.products.length === 0) {
            const container = dashboard.querySelector('.border-4.border-dashed');
            if (container) {
                container.appendChild(sampleBtn);
            }
        }
    }
});

// Keyboard shortcuts for admin
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+A to focus on add product form
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        const nameInput = document.getElementById('product-name');
        if (nameInput && window.furuthAdmin && window.furuthAdmin.isLoggedIn) {
            nameInput.focus();
        }
    }
    
    // Escape to cancel edit (if editing)
    if (e.key === 'Escape') {
        const form = document.getElementById('add-product-form');
        if (form && form.hasAttribute('data-editing-id')) {
            if (confirm('Cancel editing? Unsaved changes will be lost.')) {
                window.furuthAdmin.cancelEdit();
            }
        }
    }
    
    // Escape to logout (if logged in and not editing)
    if (e.key === 'Escape' && e.ctrlKey) {
        const form = document.getElementById('add-product-form');
        if (!form || !form.hasAttribute('data-editing-id')) {
            if (window.furuthAdmin && window.furuthAdmin.isLoggedIn) {
                if (confirm('Are you sure you want to logout?')) {
                    window.furuthAdmin.logout();
                }
            }
        }
    }
});