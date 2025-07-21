const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    cursorFollower.style.left = e.clientX + 'px';
    cursorFollower.style.top = e.clientY + 'px';
});

document.querySelectorAll('a:not(.exclude-cursor-scale), button:not(.exclude-cursor-scale)').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursorFollower.style.transform = 'scale(1.5)';
    });
    
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursorFollower.style.transform = 'scale(1)';
    });
});

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

document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) rotateX(5deg) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateX(0) scale(1)';
    });
});

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.floating-shape');
    
    shapes.forEach((shape, index) => {
        const speed = 0.3 + (index * 0.1);
        shape.style.transform = `translateY(${scrolled * speed}px) rotateX(${scrolled * 0.05}deg)`;
    });
});

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

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

const countryNames = {
    NG: 'Nigeria',
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    FR: 'France',
    DE: 'Germany',
    JP: 'Japan',
    CN: 'China',
    BR: 'Brazil',
    IN: 'India',
    ZA: 'South Africa',
    MX: 'Mexico',
    ES: 'Spain',
    IT: 'Italy'
};

async function detectCountry() {
    try {
        // Clear localStorage on page reload to force re-detection
        if (performance.navigation.type === 1) { // 1 = Reload
            localStorage.removeItem('selectedCountry');
        }
        const savedCountry = localStorage.getItem('selectedCountry');
        if (savedCountry && countryNames[savedCountry]) {
            updateCountryFlag(savedCountry);
            document.getElementById('country-select').value = savedCountry;
        } else {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const countryCode = data.country_code || 'NG';
            localStorage.setItem('selectedCountry', countryCode);
            updateCountryFlag(countryCode);
            document.getElementById('country-select').value = countryCode;
        }
    } catch (error) {
        console.error('Error detecting country:', error);
        localStorage.setItem('selectedCountry', 'NG');
        updateCountryFlag('NG');
        document.getElementById('country-select').value = 'NG';
    }
}

function updateCountryFlag(countryCode) {
    const flagImg = document.getElementById('country-flag');
    flagImg.src = `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
    flagImg.alt = `${countryNames[countryCode] || countryCode} Flag`;
}

document.getElementById('country-select').addEventListener('change', (e) => {
    const countryCode = e.target.value;
    localStorage.setItem('selectedCountry', countryCode);
    updateCountryFlag(countryCode);
    console.log('Selected country:', countryNames[countryCode]);
});

document.addEventListener('DOMContentLoaded', () => {
    detectCountry();
    firebase.auth().onAuthStateChanged((user) => {
        const userEmail = document.getElementById('user-email');
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        if (user) {
            if (userEmail) userEmail.textContent = user.email || user.displayName;
            if (loginButton) loginButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'inline-block';
        } else {
            if (userEmail) userEmail.textContent = '';
            if (loginButton) loginButton.style.display = 'inline-block';
            if (logoutButton) logoutButton.style.display = 'none';
        }
    });
});

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        if (!firebase.auth().currentUser) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = 'login.html';
            return;
        }
        this.style.transform = 'scale(0.95)';
        this.textContent = 'ADDED!';
        this.style.background = 'linear-gradient(45deg, #00ff88, #00ff88)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
            this.textContent = 'ADD TO CART';
            this.style.background = 'linear-gradient(45deg, #00ff88, #0088ff)';
        }, 1000);
    });
});

if (document.getElementById('logout-button')) {
    document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            await firebase.auth().signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed: ' + error.message);
        }
    });
}

if (document.getElementById('login-button')) {
    document.getElementById('login-button').addEventListener('click', () => {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = 'login.html';
    });
}