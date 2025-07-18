// Tool Connect - Interactive JavaScript

// Translation functionality
let currentLanguage = 'en';

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
}

function translatePage(lang) {
    currentLanguage = lang;
    
    // Update all elements with data-translate attribute
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = getNestedValue(translations[lang], key);
        if (translation) {
            // Check if translation contains HTML tags
            if (translation.includes('<') && translation.includes('>')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        const translation = getNestedValue(translations[lang], key);
        if (translation) {
            element.placeholder = translation;
        }
    });
    
    // Update current language display
    const currentLangElement = document.querySelector('.current-lang');
    if (currentLangElement) {
        currentLangElement.textContent = lang.toUpperCase();
    }
    
    // Update active state in language menu
    const languageLinks = document.querySelectorAll('.language-menu a');
    languageLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-lang') === lang) {
            link.classList.add('active');
        }
    });
    
    // Update meta tags
    const metaTitle = document.querySelector('title');
    const metaDescription = document.querySelector('meta[name="description"]');
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    
    if (metaTitle && translations[lang].meta.title) {
        metaTitle.textContent = translations[lang].meta.title;
    }
    if (metaDescription && translations[lang].meta.description) {
        metaDescription.setAttribute('content', translations[lang].meta.description);
    }
    if (metaKeywords && translations[lang].meta.keywords) {
        metaKeywords.setAttribute('content', translations[lang].meta.keywords);
    }
    
    // Save language preference to localStorage
    localStorage.setItem('preferredLanguage', lang);
}

function initializeLanguage() {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    } else {
        // Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (translations[browserLang]) {
            currentLanguage = browserLang;
        }
    }
    
    // Apply initial translation
    translatePage(currentLanguage);
    
    // Set up language switcher event listeners
    const languageLinks = document.querySelectorAll('.language-menu a');
    languageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            if (translations[lang]) {
                translatePage(lang);
            }
        });
    });
}

// Language dropdown toggle
function setupLanguageDropdownToggle() {
    // Remove any previous listeners
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.onclick = null;
    });
    
    // Add click event for all language buttons
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Close all other dropdowns
            document.querySelectorAll('.language-dropdown.open').forEach(dd => {
                if (dd !== btn.closest('.language-dropdown')) dd.classList.remove('open');
            });
            
            // Toggle this dropdown
            btn.closest('.language-dropdown').classList.toggle('open');
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        document.querySelectorAll('.language-dropdown.open').forEach(dd => {
            if (!dd.contains(e.target)) dd.classList.remove('open');
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.language-dropdown.open').forEach(dd => dd.classList.remove('open'));
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language system
    initializeLanguage();
    setupLanguageDropdownToggle();
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            // Skip if targetId is just "#" or empty
            if (targetId === '#' || targetId === '') {
                return;
            }
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });    // Contact form handling
    // DISABLED custom JS handler for contact form to allow native Formspree POST
    // const contactForm = document.querySelector('.contact-form');
    // if (contactForm) {
    //     contactForm.addEventListener('submit', function(e) {
    //         e.preventDefault(); // Prevent default form submission
            
    //         // Get form inputs
    //         const name = this.querySelector('input[name="name"]').value.trim();
    //         const email = this.querySelector('input[name="email"]').value.trim();
    //         const message = this.querySelector('textarea[name="message"]').value.trim();
            
    //         // Basic validation
    //         if (!name || !email || !message) {
    //             showFormMessage('Please fill in all fields.', 'error');
    //             return;
    //         }
            
    //         // Email validation
    //         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //         if (!emailRegex.test(email)) {
    //             showFormMessage('Please enter a valid email address.', 'error');
    //             return;
    //         }
            
    //         // Show loading state
    //         const submitBtn = this.querySelector('button[type="submit"]');
    //         const originalText = submitBtn.textContent;
    //         submitBtn.textContent = 'Sending...';
    //         submitBtn.disabled = true;
            
    //         // Prepare form data for Netlify
    //         const formData = new FormData(this);
            
    //         // Submit to Netlify
    //         fetch('/', {
    //             method: 'POST',
    //             headers: { "Content-Type": "application/x-www-form-urlencoded" },
    //             body: new URLSearchParams(formData).toString()
    //         })
    //         .then(() => {
    //             // Show success message
    //             showFormMessage('Thank you! Your message has been sent successfully.', 'success');
    //             // Reset form
    //             this.reset();
    //         })
    //         .catch((error) => {
    //             // Show error message
    //             showFormMessage('Sorry, there was an error sending your message. Please try again.', 'error');
    //             console.error('Form submission error:', error);
    //         })
    //         .finally(() => {
    //             // Restore button state
    //             submitBtn.textContent = originalText;
    //             submitBtn.disabled = false;
    //         });
    //     });
    // }
      // Form message display function
    function showFormMessage(message, type) {
        const messagesContainer = document.querySelector('#form-messages');
        if (messagesContainer) {
            // Clear existing messages
            messagesContainer.innerHTML = '';
            
            // Create and show new message
            const messageDiv = document.createElement('div');
            messageDiv.className = `form-message ${type}`;
            messageDiv.textContent = message;
            
            messagesContainer.appendChild(messageDiv);
            
            // Auto-remove success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    if (messageDiv && messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 5000);
            }
        }
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe sections for animation
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });    // Add counter animation for app rating
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = start.toFixed(1);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toFixed(1);
            }
        }
        updateCounter();
    }

    // Animate contact items when section comes into view
    const contactItems = document.querySelectorAll('.contact-item');
    if (contactItems.length > 0) {
        const contactObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.contact-item');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 150);
                    });
                }
            });
        }, { threshold: 0.3 });
        
        // Initially hide contact items
        contactItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
        
        const contactSection = document.querySelector('.contact');
        if (contactSection) {
            contactObserver.observe(contactSection);
        }
    }

    // Animate rating when section comes into view
    const ratingSection = document.querySelector('.app-rating');
    if (ratingSection) {
        const ratingObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const ratingNumber = entry.target.querySelector('.rating-number');
                    if (ratingNumber && !ratingNumber.classList.contains('animated')) {
                        ratingNumber.classList.add('animated');
                        animateCounter(ratingNumber, 4.8);
                    }
                }
            });
        }, { threshold: 0.5 });
        
        ratingObserver.observe(ratingSection);
    }    // Download button click tracking
    const downloadButtons = document.querySelectorAll('.download-btn, .app-link');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add a visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Let the default link behavior proceed (don't prevent it)
        });
    });// Category card click redirect to download section
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Redirect to download section
            const downloadSection = document.querySelector('#download');
            if (downloadSection) {
                downloadSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add parallax effect to hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        });
    }

    // Add typing effect to hero title
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Start typing effect after a short delay
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 50);
        }, 1000);
    }
});

// Add CSS classes for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-in {
        animation: fadeInUp 0.8s ease-out forwards;
    }

    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98) !important;
        box-shadow: 0 2px 30px rgba(0, 0, 0, 0.15) !important;
    }

    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }

    @media (max-width: 768px) {
        .nav-menu.active {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            padding: 20px;
            gap: 15px;
        }
    }
`;
document.head.appendChild(style);