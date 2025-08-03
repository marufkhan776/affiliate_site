/**
 * TechBlitz Deals - Main Application JavaScript
 * Handles navigation, scroll effects, animations, and general app functionality
 */

// ===== DOM ELEMENTS =====
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav__link');
const header = document.getElementById('header');
const scrollTopBtn = document.getElementById('scroll-top');
const newsletterForm = document.getElementById('newsletter-form');

// ===== MOBILE NAVIGATION =====
/**
 * Show mobile navigation menu
 */
const showMenu = () => {
    if (navToggle && navMenu) {
        navMenu.classList.add('show-menu');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
};

/**
 * Hide mobile navigation menu
 */
const hideMenu = () => {
    if (navMenu) {
        navMenu.classList.remove('show-menu');
        document.body.style.overflow = ''; // Restore scrolling
    }
};

// Event listeners for mobile navigation
if (navToggle) {
    navToggle.addEventListener('click', showMenu);
}

if (navClose) {
    navClose.addEventListener('click', hideMenu);
}

// Close menu when clicking on navigation links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hideMenu();
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('show-menu')) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            hideMenu();
        }
    }
});

// ===== HEADER SCROLL EFFECTS =====
/**
 * Add blur and background effects to header on scroll
 */
const handleHeaderScroll = () => {
    if (header) {
        if (window.scrollY >= 50) {
            header.style.background = 'rgba(10, 10, 15, 0.98)';
            header.style.backdropFilter = 'blur(20px)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(10, 10, 15, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.boxShadow = 'none';
        }
    }
};

// ===== SCROLL TO TOP BUTTON =====
/**
 * Show/hide scroll to top button based on scroll position
 */
const handleScrollTopButton = () => {
    if (scrollTopBtn) {
        if (window.scrollY >= 400) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }
};

/**
 * Smooth scroll to top when button is clicked
 */
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', scrollToTop);
}

// ===== SCROLL EVENT HANDLER =====
let scrollTimeout;
const handleScroll = () => {
    // Use requestAnimationFrame for better performance
    if (!scrollTimeout) {
        scrollTimeout = requestAnimationFrame(() => {
            handleHeaderScroll();
            handleScrollTopButton();
            scrollTimeout = null;
        });
    }
};

window.addEventListener('scroll', handleScroll);

// ===== SMOOTH SCROLLING FOR ANCHOR LINKS =====
/**
 * Add smooth scrolling behavior to anchor links
 */
const initSmoothScrolling = () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Skip empty anchors or just "#"
            if (href === '#' || href === '') return;
            
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                hideMenu();
            }
        });
    });
};

// ===== NEWSLETTER FORM HANDLING =====
/**
 * Handle newsletter form submission
 */
const handleNewsletterSubmission = (e) => {
    e.preventDefault();
    
    const emailInput = newsletterForm.querySelector('.newsletter__input');
    const submitBtn = newsletterForm.querySelector('.newsletter__btn');
    const email = emailInput.value.trim();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    submitBtn.disabled = true;
    
    // Simulate API call (replace with actual newsletter service)
    setTimeout(() => {
        // Success simulation
        showNotification('Successfully subscribed to our newsletter!', 'success');
        emailInput.value = '';
        
        // Reset button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        // Store subscription in localStorage for demo
        localStorage.setItem('newsletter_subscribed', 'true');
        localStorage.setItem('newsletter_email', email);
        
    }, 2000);
};

if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmission);
}

// ===== NOTIFICATION SYSTEM =====
/**
 * Show notification to user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'info')
 */
const showNotification = (message, type = 'info') => {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification__content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification__close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Manual close
    const closeBtn = notification.querySelector('.notification__close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeNotification(notification);
    });
};

/**
 * Get notification icon based on type
 */
const getNotificationIcon = (type) => {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    return icons[type] || icons.info;
};

/**
 * Get notification color based on type
 */
const getNotificationColor = (type) => {
    const colors = {
        success: '#00ff88',
        error: '#ef4444',
        info: '#0066ff',
        warning: '#fbbf24'
    };
    return colors[type] || colors.info;
};

/**
 * Remove notification with animation
 */
const removeNotification = (notification) => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
};

// ===== LAZY LOADING IMAGES =====
/**
 * Implement lazy loading for images
 */
const initLazyLoading = () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }
};

// ===== ACTIVE NAVIGATION HIGHLIGHTING =====
/**
 * Highlight active navigation based on current page
 */
const highlightActiveNavigation = () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === 'index.html' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
};

// ===== PERFORMANCE OPTIMIZATION =====
/**
 * Debounce function to limit the rate of function execution
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ===== KEYBOARD NAVIGATION =====
/**
 * Add keyboard navigation support
 */
const initKeyboardNavigation = () => {
    document.addEventListener('keydown', (e) => {
        // ESC key closes mobile menu
        if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) {
            hideMenu();
        }
        
        // Ctrl/Cmd + K for search (future feature)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            // Future: Open search modal
            console.log('Search functionality coming soon!');
        }
    });
};

// ===== THEME PREFERENCE =====
/**
 * Check for user's theme preference (future feature)
 */
const initThemePreference = () => {
    // For now, we're using dark theme only
    // Future: Add light/dark theme toggle
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('User prefers dark theme:', prefersDark);
};

// ===== ANALYTICS HELPERS =====
/**
 * Track user interactions (placeholder for analytics)
 */
const trackEvent = (eventName, properties = {}) => {
    // Placeholder for analytics tracking
    console.log('Event tracked:', eventName, properties);
    
    // Example: Google Analytics, Mixpanel, etc.
    // gtag('event', eventName, properties);
};

// Track click events on affiliate links
const trackAffiliateClicks = () => {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a[data-affiliate]');
        if (target) {
            trackEvent('affiliate_click', {
                product_id: target.dataset.productId,
                affiliate_url: target.href,
                source: window.location.pathname
            });
        }
    });
};

// ===== INITIALIZATION =====
/**
 * Initialize all app functionality when DOM is ready
 */
const initializeApp = () => {
    console.log('🚀 TechBlitz Deals - App Initialized');
    
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
    
    // Initialize all features
    initSmoothScrolling();
    initLazyLoading();
    highlightActiveNavigation();
    initKeyboardNavigation();
    initThemePreference();
    trackAffiliateClicks();
    
    // Initial scroll check
    handleHeaderScroll();
    handleScrollTopButton();
    
    // Show welcome message for new visitors
    if (!localStorage.getItem('visited_before')) {
        setTimeout(() => {
            showNotification('Welcome to TechBlitz Deals! 🚀', 'info');
            localStorage.setItem('visited_before', 'true');
        }, 1000);
    }
};

// ===== EVENT LISTENERS =====
// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('Page is now visible');
        // Refresh data if needed
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    showNotification('Connection restored!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('No internet connection', 'warning');
});

// ===== EXPORT FOR OTHER MODULES =====
// Make functions available globally for other scripts
window.TechBlitzApp = {
    showNotification,
    trackEvent,
    hideMenu,
    scrollToTop
};