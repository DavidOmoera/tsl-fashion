const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
let mouseX = 0;
let mouseY = 0;
let posX = 0;
let posY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    posX += (mouseX - posX) * 0.1;
    posY += (mouseY - posY) * 0.1;

    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    cursorFollower.style.transform = `translate(${posX}px, ${posY}px)`;

    requestAnimationFrame(animateCursor);
}

animateCursor();

// Disable cursor pointer-events on select.size-select hover
document.querySelectorAll('.size-select').forEach(select => {
    select.addEventListener('mouseenter', () => {
        cursor.style.pointerEvents = 'none';
        cursorFollower.style.pointerEvents = 'none';
    });
    select.addEventListener('mouseleave', () => {
        cursor.style.pointerEvents = 'none'; // Already none, but reinforce
        cursorFollower.style.pointerEvents = 'none';
    });
});

// Cursor scaling for other interactive elements
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('scale');
        cursorFollower.classList.add('scale');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('scale');
        cursorFollower.classList.remove('scale');
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
        if (performance.navigation.type === 1) {
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
});

function createFloatingShapes() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    for (let i = 0; i < 10; i++) {
        const shape = document.createElement('div');
        shape.classList.add('floating-shape');
        shape.style.left = `${Math.random() * 100}vw`;
        shape.style.top = `${Math.random() * 100}vh`;
        shape.style.animationDelay = `${Math.random() * 8}s`;
        heroBg.appendChild(shape);
    }
}

createFloatingShapes();