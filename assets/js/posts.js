/**
 * TechBlitz Deals - Blog Posts Module
 * Handles loading and displaying blog posts from JSON data
 */

// ===== BLOG DATA MANAGEMENT =====
let allPosts = [];
let featuredPosts = [];
let currentBlogFilters = {
    category: 'all',
    sortBy: 'newest',
    search: ''
};

// ===== DOM ELEMENTS =====
const blogPostsContainer = document.getElementById('blog-posts');

// ===== BLOG DATA LOADING =====
/**
 * Load blog posts from JSON file
 */
const loadBlogPosts = async () => {
    try {
        const response = await fetch('data/posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allPosts = data.posts || [];
        featuredPosts = allPosts.filter(post => post.featured).slice(0, 3);
        
        console.log(`Loaded ${allPosts.length} blog posts, ${featuredPosts.length} featured`);
        
        // Display posts on appropriate pages
        if (blogPostsContainer) {
            displayBlogPosts();
        }
        
        // Initialize blog showcase if on blog page
        const blogShowcaseContainer = document.getElementById('blog-showcase');
        if (blogShowcaseContainer) {
            initializeBlogShowcase();
        }
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        showBlogLoadingError();
    }
};

/**
 * Display loading error message
 */
const showBlogLoadingError = () => {
    const containers = [
        document.getElementById('blog-posts'),
        document.getElementById('blog-showcase')
    ].filter(container => container);
    
    containers.forEach(container => {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to Load Blog Posts</h3>
                <p>Please check your internet connection and try again.</p>
                <button onclick="loadBlogPosts()" class="btn btn--primary">
                    <i class="fas fa-sync-alt"></i>
                    Retry
                </button>
            </div>
        `;
    });
};

// ===== BLOG DISPLAY FUNCTIONS =====
/**
 * Display blog posts (for homepage preview)
 */
const displayBlogPosts = () => {
    if (!blogPostsContainer || !featuredPosts.length) return;
    
    blogPostsContainer.innerHTML = featuredPosts.map(post => 
        createBlogCard(post)
    ).join('');
    
    // Add AOS animations to new cards
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    
    // Initialize lazy loading for new images
    initializeLazyLoadingForBlogContainer(blogPostsContainer);
};

/**
 * Create HTML for a blog post card
 */
const createBlogCard = (post) => {
    const publishDate = new Date(post.publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const readingTime = calculateReadingTime(post.content || post.excerpt);
    
    return `
        <div class="blog-card" data-aos="fade-up" data-aos-delay="${Math.random() * 200}">
            <div class="blog-card__image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
                ${post.featured ? '<div class="blog-card__featured-badge">Featured</div>' : ''}
            </div>
            
            <div class="blog-card__content">
                <div class="blog-card__meta">
                    <span class="blog-card__category">${post.category}</span>
                    <span class="blog-card__date">${publishDate}</span>
                </div>
                
                <h3 class="blog-card__title">
                    <a href="${generatePostUrl(post)}">${post.title}</a>
                </h3>
                
                <p class="blog-card__excerpt">${post.excerpt}</p>
                
                <div class="blog-card__footer">
                    <div class="blog-card__author">
                        <img src="${post.author.avatar}" alt="${post.author.name}" class="blog-card__author-avatar">
                        <span class="blog-card__author-name">${post.author.name}</span>
                    </div>
                    <span class="blog-card__read-time">
                        <i class="fas fa-clock"></i>
                        ${readingTime} min read
                    </span>
                </div>
                
                <div class="blog-card__actions">
                    <a href="${generatePostUrl(post)}" class="btn btn--primary btn--small">
                        <i class="fas fa-arrow-right"></i>
                        Read More
                    </a>
                    ${post.tags ? createTagsList(post.tags.slice(0, 2)) : ''}
                </div>
            </div>
        </div>
    `;
};

/**
 * Generate URL for blog post
 */
const generatePostUrl = (post) => {
    // For static site, we'll use a query parameter approach
    // In a real implementation, you might use different routing
    return `blog-post.html?slug=${post.slug}`;
};

/**
 * Calculate estimated reading time
 */
const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, readingTime);
};

/**
 * Create tags list HTML
 */
const createTagsList = (tags) => {
    if (!tags || tags.length === 0) return '';
    
    return `
        <div class="blog-card__tags">
            ${tags.map(tag => `<span class="blog-card__tag">${tag}</span>`).join('')}
        </div>
    `;
};

// ===== BLOG SHOWCASE (for blog.html) =====
/**
 * Initialize blog showcase page
 */
const initializeBlogShowcase = () => {
    const showcaseContainer = document.getElementById('blog-showcase');
    if (!showcaseContainer) return;
    
    displayAllBlogPosts();
    initializeBlogFilters();
    initializeBlogSearch();
    initializeBlogSorting();
    initializeBlogCategories();
};

/**
 * Display all blog posts in showcase
 */
const displayAllBlogPosts = () => {
    const showcaseContainer = document.getElementById('blog-showcase');
    if (!showcaseContainer) return;
    
    let filteredPosts = filterBlogPosts(allPosts);
    filteredPosts = sortBlogPosts(filteredPosts);
    
    if (filteredPosts.length === 0) {
        showcaseContainer.innerHTML = `
            <div class="no-posts-message">
                <i class="fas fa-search"></i>
                <h3>No Blog Posts Found</h3>
                <p>Try adjusting your filters or search criteria.</p>
                <button onclick="resetBlogFilters()" class="btn btn--primary">
                    Reset Filters
                </button>
            </div>
        `;
        return;
    }
    
    showcaseContainer.innerHTML = filteredPosts.map(post => 
        createBlogCard(post)
    ).join('');
    
    // Update results count
    updateBlogResultsCount(filteredPosts.length);
    
    // Refresh AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
    
    // Initialize lazy loading
    initializeLazyLoadingForBlogContainer(showcaseContainer);
};

/**
 * Filter blog posts based on current filters
 */
const filterBlogPosts = (posts) => {
    return posts.filter(post => {
        // Category filter
        if (currentBlogFilters.category !== 'all' && 
            post.category.toLowerCase() !== currentBlogFilters.category) {
            return false;
        }
        
        // Search filter
        if (currentBlogFilters.search) {
            const searchTerm = currentBlogFilters.search.toLowerCase();
            const searchableText = `${post.title} ${post.excerpt} ${post.category} ${post.tags?.join(' ') || ''}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
};

/**
 * Sort blog posts based on current sort option
 */
const sortBlogPosts = (posts) => {
    const sortedPosts = [...posts];
    
    switch (currentBlogFilters.sortBy) {
        case 'oldest':
            return sortedPosts.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
        case 'alphabetical':
            return sortedPosts.sort((a, b) => a.title.localeCompare(b.title));
        case 'popular':
            return sortedPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
        case 'newest':
        default:
            return sortedPosts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    }
};

// ===== BLOG FILTER FUNCTIONALITY =====
/**
 * Initialize blog filter controls
 */
const initializeBlogFilters = () => {
    // Category filters
    const categoryFilters = document.querySelectorAll('[data-blog-filter-category]');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            const category = filter.dataset.blogFilterCategory;
            updateBlogFilter('category', category);
            updateActiveBlogFilter(categoryFilters, filter);
        });
    });
};

/**
 * Initialize blog search functionality
 */
const initializeBlogSearch = () => {
    const searchInput = document.getElementById('blog-search');
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            updateBlogFilter('search', e.target.value.trim());
        }, 300); // Debounce search
    });
};

/**
 * Initialize blog sorting functionality
 */
const initializeBlogSorting = () => {
    const sortSelect = document.getElementById('blog-sort');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', (e) => {
        updateBlogFilter('sortBy', e.target.value);
    });
};

/**
 * Initialize blog categories display
 */
const initializeBlogCategories = () => {
    const categoriesContainer = document.getElementById('blog-categories');
    if (!categoriesContainer || !allPosts.length) return;
    
    // Get unique categories with post counts
    const categoryCount = {};
    allPosts.forEach(post => {
        const category = post.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // Sort categories by post count
    const sortedCategories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a);
    
    categoriesContainer.innerHTML = `
        <h4>Categories</h4>
        <ul class="blog-categories-list">
            <li><a href="#" data-blog-filter-category="all" class="active">All Posts (${allPosts.length})</a></li>
            ${sortedCategories.map(([category, count]) => 
                `<li><a href="#" data-blog-filter-category="${category.toLowerCase()}">${category} (${count})</a></li>`
            ).join('')}
        </ul>
    `;
    
    // Re-initialize filters after creating categories
    initializeBlogFilters();
};

/**
 * Update blog filter and refresh display
 */
const updateBlogFilter = (filterType, value) => {
    currentBlogFilters[filterType] = value;
    displayAllBlogPosts();
    
    // Track filter usage for analytics
    if (window.TechBlitzApp && window.TechBlitzApp.trackEvent) {
        window.TechBlitzApp.trackEvent('blog_filter_used', {
            filter_type: filterType,
            filter_value: value
        });
    }
};

/**
 * Update active blog filter button
 */
const updateActiveBlogFilter = (filterGroup, activeFilter) => {
    filterGroup.forEach(filter => filter.classList.remove('active'));
    activeFilter.classList.add('active');
};

/**
 * Reset all blog filters
 */
const resetBlogFilters = () => {
    currentBlogFilters = {
        category: 'all',
        sortBy: 'newest',
        search: ''
    };
    
    // Reset UI
    const searchInput = document.getElementById('blog-search');
    if (searchInput) searchInput.value = '';
    
    const sortSelect = document.getElementById('blog-sort');
    if (sortSelect) sortSelect.value = 'newest';
    
    // Reset filter buttons
    document.querySelectorAll('[data-blog-filter-category="all"]').forEach(btn => btn.classList.add('active'));
    
    displayAllBlogPosts();
};

/**
 * Update blog results count display
 */
const updateBlogResultsCount = (count) => {
    const countElement = document.getElementById('blog-results-count');
    if (countElement) {
        countElement.textContent = `${count} post${count !== 1 ? 's' : ''} found`;
    }
};

// ===== BLOG POST DETAILS =====
/**
 * Get blog post by slug
 */
const getBlogPostBySlug = (slug) => {
    return allPosts.find(post => post.slug === slug);
};

/**
 * Display individual blog post (for blog-post.html)
 */
const displayBlogPost = (slug) => {
    const post = getBlogPostBySlug(slug);
    if (!post) {
        showBlogPostNotFound();
        return;
    }
    
    const postContainer = document.getElementById('blog-post-content');
    if (!postContainer) return;
    
    const publishDate = new Date(post.publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const readingTime = calculateReadingTime(post.content);
    
    postContainer.innerHTML = `
        <article class="blog-post">
            <header class="blog-post__header">
                <div class="blog-post__meta">
                    <span class="blog-post__category">${post.category}</span>
                    <span class="blog-post__date">${publishDate}</span>
                    <span class="blog-post__read-time">
                        <i class="fas fa-clock"></i>
                        ${readingTime} min read
                    </span>
                </div>
                
                <h1 class="blog-post__title">${post.title}</h1>
                
                <div class="blog-post__excerpt">${post.excerpt}</div>
                
                <div class="blog-post__author">
                    <img src="${post.author.avatar}" alt="${post.author.name}" class="blog-post__author-avatar">
                    <div class="blog-post__author-info">
                        <span class="blog-post__author-name">${post.author.name}</span>
                        <span class="blog-post__author-bio">${post.author.bio}</span>
                    </div>
                </div>
            </header>
            
            <div class="blog-post__image">
                <img src="${post.image}" alt="${post.title}">
            </div>
            
            <div class="blog-post__content">
                ${post.content}
            </div>
            
            <footer class="blog-post__footer">
                ${post.tags ? createTagsList(post.tags) : ''}
                
                <div class="blog-post__share">
                    <h4>Share this post</h4>
                    <div class="share-buttons">
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}" 
                           target="_blank" class="share-btn share-btn--twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" 
                           target="_blank" class="share-btn share-btn--facebook">
                            <i class="fab fa-facebook"></i>
                        </a>
                        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" 
                           target="_blank" class="share-btn share-btn--linkedin">
                            <i class="fab fa-linkedin"></i>
                        </a>
                    </div>
                </div>
            </footer>
        </article>
    `;
    
    // Track blog post view
    trackBlogPostView(post.slug, post.title);
};

/**
 * Show blog post not found message
 */
const showBlogPostNotFound = () => {
    const postContainer = document.getElementById('blog-post-content');
    if (!postContainer) return;
    
    postContainer.innerHTML = `
        <div class="blog-post-not-found">
            <i class="fas fa-search"></i>
            <h2>Blog Post Not Found</h2>
            <p>The blog post you're looking for doesn't exist or has been moved.</p>
            <a href="blog.html" class="btn btn--primary">
                <i class="fas fa-arrow-left"></i>
                Back to Blog
            </a>
        </div>
    `;
};

// ===== UTILITY FUNCTIONS =====
/**
 * Initialize lazy loading for images in blog container
 */
const initializeLazyLoadingForBlogContainer = (container) => {
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
 * Track blog post view
 */
const trackBlogPostView = (slug, title) => {
    if (window.TechBlitzApp && window.TechBlitzApp.trackEvent) {
        window.TechBlitzApp.trackEvent('blog_post_view', {
            post_slug: slug,
            post_title: title,
            timestamp: new Date().toISOString()
        });
    }
    
    console.log(`Blog post view tracked: ${title} (${slug})`);
};

/**
 * Get related blog posts
 */
const getRelatedPosts = (currentPost, limit = 3) => {
    return allPosts
        .filter(post => post.slug !== currentPost.slug)
        .filter(post => post.category === currentPost.category || 
                       post.tags?.some(tag => currentPost.tags?.includes(tag)))
        .slice(0, limit);
};

// ===== INITIALIZATION =====
/**
 * Initialize blog posts module
 */
const initializeBlogPosts = () => {
    console.log('📝 Blog posts module initialized');
    loadBlogPosts();
    
    // Check if we're on a blog post detail page
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    if (slug && document.getElementById('blog-post-content')) {
        // Wait for posts to load before displaying individual post
        setTimeout(() => displayBlogPost(slug), 100);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBlogPosts);
} else {
    initializeBlogPosts();
}

// ===== EXPORT FOR OTHER MODULES =====
window.BlogModule = {
    loadBlogPosts,
    getBlogPostBySlug,
    getRelatedPosts,
    resetBlogFilters,
    getAllPosts: () => allPosts,
    getFeaturedPosts: () => featuredPosts
};