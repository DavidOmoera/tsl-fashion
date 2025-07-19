// Custom Cursor
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    cursorFollower.style.left = e.clientX + 'px';
    cursorFollower.style.top = e.clientY + 'px';
});

// Cursor hover effects
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursorFollower.style.transform = 'scale(1.5)';
    });
    
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursorFollower.style.transform = 'scale(1)';
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Product card interactions
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) rotateX(5deg) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateX(0) scale(1)';
    });
});

// Add to cart functionality
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Visual feedback
        this.style.transform = 'scale(0.95)';
        this.textContent = 'ADDED!';
        this.style.background = 'linear-gradient(45deg, #00ff88, #00ff88)';
        
        setTimeout(() => {
            this.style.transform = 'scale(1)';
            this.textContent = 'ADD TO CART';
            this.style.background = 'linear-gradient(45deg, #00ff88, #0088ff)';
        }, 1000);
        
        // In a real app, this would add to cart
        console.log('Product added to cart!');
    });
});

// Parallax effect for floating shapes
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.floating-shape');
    
    shapes.forEach((shape, index) => {
        const speed = 0.3 + (index * 0.1);
        shape.style.transform = `translateY(${scrolled * speed}px) rotateX(${scrolled * 0.05}deg)`;
    });
});

// Dynamic background pattern
let animationId;
function animateBackground() {
    const time = Date.now() * 0.001;
    const shapes = document.querySelectorAll('.floating-shape');
    
    shapes.forEach((shape, index) => {
        const x = Math.sin(time + index) * 20;
        const y = Math.cos(time + index) * 20;
        shape.style.transform += ` translate(${x}px, ${y}px)`;
    });
    
    animationId = requestAnimationFrame(animateBackground);
}

animateBackground();

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(10, 10, 10, 0.98)';
        nav.style.borderBottom = '1px solid rgba(0, 255, 136, 0.2)';
    } else {
        nav.style.background = 'rgba(10, 10, 10, 0.95)';
        nav.style.borderBottom = '1px solid rgba(0, 255, 136, 0.1)';
    }
});