/**
 * TechBlitz Deals - Products Module
 * Handles loading and displaying products from JSON data
 */

// ===== PRODUCT DATA MANAGEMENT =====
let allProducts = [];
let featuredProducts = [];
let currentFilters = {
    category: 'all',
    priceRange: 'all',
    rating: 0,
    sortBy: 'featured'
};

// ===== DOM ELEMENTS =====
const featuredProductsContainer = document.getElementById('featured-products');

// ===== PRODUCT DATA LOADING =====
/**
 * Load products from JSON file
 */
const loadProducts = async () => {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allProducts = data.products || [];
        featuredProducts = allProducts.filter(product => product.featured);
        
        console.log(`Loaded ${allProducts.length} products, ${featuredProducts.length} featured`);
        
        // Display products on appropriate pages
        if (featuredProductsContainer) {
            displayFeaturedProducts();
        }
        
        // Initialize product showcase if on showcase page
        const showcaseContainer = document.getElementById('products-showcase');
        if (showcaseContainer) {
            initializeProductShowcase();
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        showProductLoadingError();
    }
};

/**
 * Display loading error message
 */
const showProductLoadingError = () => {
    const containers = [
        document.getElementById('featured-products'),
        document.getElementById('products-showcase')
    ].filter(container => container);
    
    containers.forEach(container => {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to Load Products</h3>
                <p>Please check your internet connection and try again.</p>
                <button onclick="loadProducts()" class="btn btn--primary">
                    <i class="fas fa-sync-alt"></i>
                    Retry
                </button>
            </div>
        `;
    });
};

// ===== PRODUCT DISPLAY FUNCTIONS =====
/**
 * Display featured products on homepage
 */
const displayFeaturedProducts = () => {
    if (!featuredProductsContainer || !featuredProducts.length) return;
    
    const productsToShow = featuredProducts.slice(0, 6); // Show max 6 featured products
    
    featuredProductsContainer.innerHTML = productsToShow.map(product => 
        createProductCard(product)
    ).join('');
    
    // Add AOS animations to new cards
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    
    // Initialize lazy loading for new images
    initializeLazyLoadingForContainer(featuredProductsContainer);
};

/**
 * Create HTML for a product card
 */
const createProductCard = (product) => {
    const discountPercentage = product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;
    
    const ratingStars = generateStarRating(product.rating);
    
    return `
        <div class="product-card" data-aos="fade-up" data-aos-delay="${Math.random() * 200}">
            <div class="product-card__image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                ${product.badge ? `<div class="product-card__badge">${product.badge}</div>` : ''}
                ${discountPercentage > 0 ? `<div class="product-card__discount">-${discountPercentage}%</div>` : ''}
            </div>
            
            <div class="product-card__content">
                <div class="product-card__category">${product.category}</div>
                <h3 class="product-card__title">${product.title}</h3>
                <p class="product-card__description">${product.description}</p>
                
                <div class="product-card__footer">
                    <div class="product-card__price">
                        <span class="product-card__price-current">$${product.price}</span>
                        ${product.originalPrice ? `<span class="product-card__price-original">$${product.originalPrice}</span>` : ''}
                    </div>
                    
                    <div class="product-card__rating">
                        <div class="product-card__stars">${ratingStars}</div>
                        <span class="product-card__rating-text">(${product.reviews})</span>
                    </div>
                </div>
                
                <div class="product-card__actions">
                    <a href="${product.affiliateUrl}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="btn btn--primary btn--small"
                       data-affiliate="true"
                       data-product-id="${product.id}"
                       onclick="trackAffiliateClick('${product.id}', '${product.title}')">
                        <i class="fas fa-external-link-alt"></i>
                        Get Deal
                    </a>
                    <a href="review.html?id=${product.id}" class="btn btn--outline btn--small">
                        <i class="fas fa-info-circle"></i>
                        Review
                    </a>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate star rating HTML
 */
const generateStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
};

// ===== PRODUCT SHOWCASE (for showcase.html) =====
/**
 * Initialize product showcase page
 */
const initializeProductShowcase = () => {
    const showcaseContainer = document.getElementById('products-showcase');
    if (!showcaseContainer) return;
    
    displayAllProducts();
    initializeFilters();
    initializeSearch();
    initializeSorting();
};

/**
 * Display all products in showcase
 */
const displayAllProducts = () => {
    const showcaseContainer = document.getElementById('products-showcase');
    if (!showcaseContainer) return;
    
    let filteredProducts = filterProducts(allProducts);
    filteredProducts = sortProducts(filteredProducts);
    
    if (filteredProducts.length === 0) {
        showcaseContainer.innerHTML = `
            <div class="no-products-message">
                <i class="fas fa-search"></i>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or search criteria.</p>
                <button onclick="resetFilters()" class="btn btn--primary">
                    Reset Filters
                </button>
            </div>
        `;
        return;
    }
    
    showcaseContainer.innerHTML = filteredProducts.map(product => 
        createProductCard(product)
    ).join('');
    
    // Update results count
    updateResultsCount(filteredProducts.length);
    
    // Refresh AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    
    // Initialize lazy loading
    initializeLazyLoadingForContainer(showcaseContainer);
};

/**
 * Filter products based on current filters
 */
const filterProducts = (products) => {
    return products.filter(product => {
        // Category filter
        if (currentFilters.category !== 'all' && product.category.toLowerCase() !== currentFilters.category) {
            return false;
        }
        
        // Price range filter
        if (currentFilters.priceRange !== 'all') {
            const price = parseFloat(product.price);
            const [min, max] = currentFilters.priceRange.split('-').map(Number);
            if (price < min || (max && price > max)) {
                return false;
            }
        }
        
        // Rating filter
        if (currentFilters.rating > 0 && product.rating < currentFilters.rating) {
            return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            const searchableText = `${product.title} ${product.description} ${product.category}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
};

/**
 * Sort products based on current sort option
 */
const sortProducts = (products) => {
    const sortedProducts = [...products];
    
    switch (currentFilters.sortBy) {
        case 'price-low':
            return sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        case 'price-high':
            return sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        case 'rating':
            return sortedProducts.sort((a, b) => b.rating - a.rating);
        case 'newest':
            return sortedProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        case 'featured':
        default:
            return sortedProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
};

// ===== FILTER FUNCTIONALITY =====
/**
 * Initialize filter controls
 */
const initializeFilters = () => {
    // Category filters
    const categoryFilters = document.querySelectorAll('[data-filter-category]');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            const category = filter.dataset.filterCategory;
            updateFilter('category', category);
            updateActiveFilter(categoryFilters, filter);
        });
    });
    
    // Price range filters
    const priceFilters = document.querySelectorAll('[data-filter-price]');
    priceFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            const priceRange = filter.dataset.filterPrice;
            updateFilter('priceRange', priceRange);
            updateActiveFilter(priceFilters, filter);
        });
    });
    
    // Rating filters
    const ratingFilters = document.querySelectorAll('[data-filter-rating]');
    ratingFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            const rating = parseFloat(filter.dataset.filterRating);
            updateFilter('rating', rating);
            updateActiveFilter(ratingFilters, filter);
        });
    });
};

/**
 * Initialize search functionality
 */
const initializeSearch = () => {
    const searchInput = document.getElementById('product-search');
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateFilter('search', e.target.value.trim());
        }, 300); // Debounce search
    });
};

/**
 * Initialize sorting functionality
 */
const initializeSorting = () => {
    const sortSelect = document.getElementById('product-sort');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', (e) => {
        updateFilter('sortBy', e.target.value);
    });
};

/**
 * Update filter and refresh display
 */
const updateFilter = (filterType, value) => {
    currentFilters[filterType] = value;
    displayAllProducts();
    
    // Track filter usage for analytics
    if (window.TechBlitzApp && window.TechBlitzApp.trackEvent) {
        window.TechBlitzApp.trackEvent('filter_used', {
            filter_type: filterType,
            filter_value: value
        });
    }
};

/**
 * Update active filter button
 */
const updateActiveFilter = (filterGroup, activeFilter) => {
    filterGroup.forEach(filter => filter.classList.remove('active'));
    activeFilter.classList.add('active');
};

/**
 * Reset all filters
 */
const resetFilters = () => {
    currentFilters = {
        category: 'all',
        priceRange: 'all',
        rating: 0,
        sortBy: 'featured',
        search: ''
    };
    
    // Reset UI
    const searchInput = document.getElementById('product-search');
    if (searchInput) searchInput.value = '';
    
    const sortSelect = document.getElementById('product-sort');
    if (sortSelect) sortSelect.value = 'featured';
    
    // Reset filter buttons
    document.querySelectorAll('[data-filter-category="all"]').forEach(btn => btn.classList.add('active'));
    document.querySelectorAll('[data-filter-price="all"]').forEach(btn => btn.classList.add('active'));
    document.querySelectorAll('[data-filter-rating="0"]').forEach(btn => btn.classList.add('active'));
    
    displayAllProducts();
};

/**
 * Update results count display
 */
const updateResultsCount = (count) => {
    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = `${count} product${count !== 1 ? 's' : ''} found`;
    }
};

// ===== UTILITY FUNCTIONS =====
/**
 * Initialize lazy loading for images in a specific container
 */
const initializeLazyLoadingForContainer = (container) => {
    const lazyImages = container.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
};

/**
 * Track affiliate link clicks
 */
const trackAffiliateClick = (productId, productTitle) => {
    if (window.TechBlitzApp && window.TechBlitzApp.trackEvent) {
        window.TechBlitzApp.trackEvent('affiliate_click', {
            product_id: productId,
            product_title: productTitle,
            timestamp: new Date().toISOString()
        });
    }
    
    console.log(`Affiliate click tracked: ${productTitle} (${productId})`);
};

/**
 * Get product by ID
 */
const getProductById = (id) => {
    return allProducts.find(product => product.id === id);
};

// ===== INITIALIZATION =====
/**
 * Initialize products module
 */
const initializeProducts = () => {
    console.log('📦 Products module initialized');
    loadProducts();
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProducts);
} else {
    initializeProducts();
}

// ===== EXPORT FOR OTHER MODULES =====
window.ProductsModule = {
    loadProducts,
    getProductById,
    trackAffiliateClick,
    resetFilters,
    getAllProducts: () => allProducts,
    getFeaturedProducts: () => featuredProducts
};