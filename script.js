/**
 * FM Network - Main Logic
 * Handles translations, typing animations, page switching, and canvas particles.
 */

// ----- Configuration & Data -----

const translations = {
    en: {
        home: "Home",
        about: "About",
        title: "Welcome to FM Network",
        subtitle: "A network for Minecraft servers and events.",
        discord: "Discord",
        instagram: "Instagram",
        instagram_account: "Instagram",
        youtube_account: "YouTube",
        soon: "Soon",
        bio: "Hey, I'm Fouad — a developer interested in Python and web development. Currently learning editing and building cool stuff.",
        skills: "Skills",
        python: "Python",
        webdev: "Web Development",
        videoedit: "Video Editing (Beginner)",
        langBtn: "عربي"
    },
    ar: {
        home: "الرئيسية",
        about: "حول",
        title: "مرحباً بكم في شبكة FM",
        subtitle: "شبكة لخوادم وفعاليات ماين كرافت.",
        discord: "ديسكورد",
        instagram: "إنستغرام",
        instagram_account: "إنستغرام",
        youtube_account: "يوتيوب",
        soon: "قريباً",
        bio: "مرحباً، أنا فؤاد — مطور مهتم ببايثون وتطوير الويب. أتعلم حالياً المونتاج وبناء أشياء رائعة.",
        skills: "المهارات",
        python: "بايثون",
        webdev: "تطوير الويب",
        videoedit: "مونتاج الفيديو (مبتدئ)",
        langBtn: "English"
    }
};

let currentLang = 'en';

// ----- Language Management -----

function setLanguage(lang) {
    currentLang = lang;
    const isRtl = lang === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Handle Title Typing Animation dynamically based on current page
    const homePageActive = document.getElementById('home-page').classList.contains('active');
    if (homePageActive) {
        typeText(document.getElementById('typing-heading'), translations[lang].title);
    } else {
        // Just set the text directly if not on the Home Page
        document.getElementById('typing-heading').innerHTML = translations[lang].title + '<span class="typing-cursor"></span>';
    }
}

function toggleLang() {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
}

// ----- Typing Animation System -----

let typingTimeouts = [];

function typeText(element, text) {
    // Clear any previous typing timeouts to reset cleanly
    typingTimeouts.forEach(t => clearTimeout(t));
    typingTimeouts = [];
    
    // Reset element content
    element.innerHTML = '<span class="typing-cursor"></span>';
    
    let chars = Array.from(text); // Handle Unicode correctly (important for Arabic)
    let currentText = '';
    
    chars.forEach((char, index) => {
        let t = setTimeout(() => {
            currentText += char;
            element.innerHTML = currentText + '<span class="typing-cursor"></span>';
        }, 80 * index); // Typing Speed: 80ms per letter
        typingTimeouts.push(t);
    });
}

// ----- Page Navigation System -----

function switchPage(pageId) {
    // Prevent switching to the currently active page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage && targetPage.classList.contains('active')) return;

    // Update Active states for navigation buttons
    document.querySelectorAll('.nav-links .nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.nav-links .nav-btn[onclick="switchPage('${pageId}')"]`).classList.add('active');

    // Get all pages
    const pages = document.querySelectorAll('.page');
    
    // 1. Start fade out animation on current page(s)
    pages.forEach(p => {
        if (p.classList.contains('active')) {
            p.classList.remove('active');
        }
    });

    // 2. Wait for CSS fade out transition (500ms), then display block the next page
    setTimeout(() => {
        // Unmount pages from display flow completely
        pages.forEach(p => p.classList.add('hidden'));
        
        // Mount target page structurally
        targetPage.classList.remove('hidden');
        
        // Brief timeout allows 'display:block' to apply before triggering fade in
        setTimeout(() => {
            targetPage.classList.add('active');
            
            // Re-trigger typing animation only when entering Home page
            if (pageId === 'home') {
                typeText(document.getElementById('typing-heading'), translations[currentLang].title);
            }
        }, 30);
    }, 500); 
}

// ----- Lightweight Canvas Particle System with Parallax -----

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particlesArray = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Handle window resizing
window.addEventListener('resize', () => {
    initCanvas();
    initParticles();
});

// Capture mouse movement for parallax effect
document.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5; // Very small size limit
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        this.baseOpacity = Math.random() * 0.4 + 0.1;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Subtle Mouse Parallax
        if (mouse.x && mouse.y) {
            let dx = mouse.x - canvas.width / 2;
            let dy = mouse.y - canvas.height / 2;
            this.x -= dx * 0.0001; // Scale factor for slow parallax shift
            this.y -= dy * 0.0001;
        }

        // Screen Wrap Over
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }
    
    draw() {
        ctx.fillStyle = `rgba(0, 229, 255, ${this.baseOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    // Calculate adaptive number of particles to guarantee high performance on low-end limits
    let rawNum = (canvas.width * canvas.height) / 15000;
    let numParticles = Math.min(rawNum, 70); // Max capped at 70 points
    
    for (let i = 0; i < numParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

// ----- Entry Point -----

window.onload = () => {
    initCanvas();
    initParticles();
    animateParticles();
    setLanguage('en'); // Boot with English language
};
