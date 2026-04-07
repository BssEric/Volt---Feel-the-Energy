// Registrando Plugin
gsap.registerPlugin(ScrollTrigger);

// --- LENIS SMOOTH SCROLL ---
const lenis = new Lenis();

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// --- DADOS DO CARROSSEL ---
const flavors = [
    { name: "VOLT ENERGY", color: "#00d4ff", slogan: "THUNDER BLUE", image: "./Assets/lata_bluethunder.png", bg: "./Assets/bg_blue.png" },
    { name: "VOLT ENERGY", color: "#39ff14", slogan: "GREEN TURBO MODE", image: "./Assets/lata_greenturbomode.png", bg: "./Assets/bg_green.png" },
    { name: "VOLT ENERGY", color: "#ff2a2a", slogan: "RED POWER", image: "./Assets/lata_redpower.png", bg: "./Assets/bg_red.png" }
];

// --- SPLIT TEXT ANIMATION ---
function initSplitText() {
    document.querySelectorAll('.split-text').forEach(el => {
        const text = el.innerText;
        el.innerHTML = text.split('').map(char => 
            `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
    });
}
initSplitText();

// --- GERENCIADOR DE CARREGAMENTO ---
let loadedAssets = 0;
const totalAssets = (flavors.length * 2) + 1; // Latas + BGs + Logo
const root = document.documentElement;
let themeState = { color: "#00d4ff" }; // Objeto para que o GSAP possa animar a transição de cor

function assetLoaded() {
    loadedAssets++;
    const progress = Math.round((loadedAssets / totalAssets) * 100);
    
    gsap.to(".loader-bar", { width: `${progress}%`, duration: 0.3 });
    document.querySelector('.loader-percentage').textContent = `${progress}%`;

    if (loadedAssets === totalAssets) {
        startApp();
    }
}

function preloadAssets() {
    const assets = [];
    flavors.forEach(f => {
        assets.push(f.image);
        assets.push(f.bg);
    });
    assets.push("Assets/Volt_Logo.png");

    assets.forEach(src => {
        const img = new Image();
        img.src = src;
        // .decode() garante que a imagem seja processada e descompactada na memória
        // eliminando qualquer "flicker" ou atraso no primeiro uso.
        img.decode().then(assetLoaded).catch(assetLoaded);
    });
}

let isAnimating = false;
let currentIndex = 0;
const nameEl = document.querySelector('.beverage-name');
const sloganEl = document.querySelector('.slogan');
let activeCan = document.getElementById('aura-can');
let nextCan = document.getElementById('aura-can-next');
let activeBg = document.getElementById('hero-bg-active');
let nextBg = document.getElementById('hero-bg-next');
const footerInfoEl = document.querySelector('.hero-footer-info');

// --- LÓGICA DO SLIDER (HERO) ---
function updateSlide(direction) {
    if (isAnimating) return; // Bloqueia cliques simultâneos
    isAnimating = true;

    if (direction === 'next') {
        currentIndex = (currentIndex + 1) % flavors.length;
    } else {
        currentIndex = (currentIndex - 1 + flavors.length) % flavors.length;
    }

    const flavor = flavors[currentIndex];

    // Anima a transição da cor do tema para as partículas e outros elementos
    gsap.to(themeState, { 
        color: flavor.color, 
        duration: 1, 
        ease: "power2.inOut" 
    });

    // Prepara a próxima imagem da lata e o próximo background
    nextCan.src = flavor.image;
    nextBg.src = flavor.bg;

    // Animação de Saída
    gsap.to([nameEl, footerInfoEl], {
        y: -30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
            nameEl.textContent = flavor.name;
            sloganEl.textContent = flavor.slogan;
            // Atualiza a Variável CSS para Cores e Glow
            root.style.setProperty('--theme-color', flavor.color);

            // Animação de Entrada dos textos
            gsap.fromTo([nameEl, footerInfoEl], 
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power4.out" }
            );
        }
    });

    // Efeito de Crossfade entre as latas
    gsap.to(activeCan, { opacity: 0, duration: 0.8, ease: "power2.inOut" });
    gsap.to(nextCan, { opacity: 1, duration: 0.8, ease: "power2.inOut" });

    // Efeito de Crossfade entre os backgrounds
    gsap.to(activeBg, { opacity: 0, scale: 1.1, duration: 1.2, ease: "power2.inOut" });
    gsap.fromTo(nextBg, 
        { opacity: 0, scale: 1.2 }, 
        { 
            opacity: 1, scale: 1, duration: 1.2, ease: "power2.inOut",
            onComplete: () => { isAnimating = false; } // Agora o bloqueio só sai quando TUDO termina
        }
    );

    // Spin do Wrapper (afeta ambas as latas durante a troca)
    gsap.to(".can-wrapper", {
        rotationY: "+=360",
        scale: 1.1,
        yoyo: true,
        repeat: 1,
        duration: 0.5,
        ease: "power2.inOut"
    });

    // Troca as referências para o próximo clique
    [activeCan, nextCan] = [nextCan, activeCan];
    [activeBg, nextBg] = [nextBg, activeBg];
}

function startApp() {
    const flavor = flavors[currentIndex];
    root.style.setProperty('--theme-color', flavor.color);
    themeState.color = flavor.color;
    sloganEl.textContent = flavor.slogan;
    nameEl.textContent = flavor.name;
    
    // Garante que as imagens iniciais correspondam ao currentIndex
    activeCan.src = flavor.image;
    activeBg.src = flavor.bg;

    // --- AWWARDS REVEAL TIMELINE ---
    const tl = gsap.timeline();

    // 1. O Loader sobe como uma cortina
    tl.to(".loader", { 
        clipPath: "inset(0 0 100% 0)", 
        duration: 1.2, 
        ease: "power4.inOut" 
    })
    // 2. O conteúdo principal aparece
    .to("main", { opacity: 1, duration: 0.1 }, "-=1")
    // 3. Zoom out suave no Background (efeito cinematográfico)
    .fromTo(".hero-bg-container", 
        { scale: 1.4, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 2, ease: "power2.out" }, 
    "-=1.2")
    // 4. Navbar desce de forma sutil
    .fromTo(".navbar", 
        { y: -40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
    "-=1.5")
    // 5. A Lata principal "nasce" do centro com profundidade
    .fromTo(".global-can-container", 
        { y: 150, opacity: 0, scale: 0.85, rotationZ: 5 }, 
        { y: 0, opacity: 1, scale: 1, rotationZ: 0, duration: 1.8, ease: "power4.out" }, 
    "-=1.8")
    // 6. O Título VOLT ENERGY surge letra por letra (Split Text)
    .fromTo(".beverage-name .char", 
        { y: 150 },
        { 
            y: 0, 
            stagger: 0.02, 
            duration: 1.2, 
            ease: "expo.out" 
        }, 
    "-=1.3")
    // 7. Slogan e Controles aparecem por último para fechar a composição
    .fromTo([".slogan", ".control-btn"], { 
        y: 20, 
        opacity: 0 
    }, { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1, 
        duration: 1, 
        ease: "power3.out" 
    }, "-=0.8");
    
    initParticles();
    animateParticles(); // Inicia o loop de animação apenas UMA vez no início
    ScrollTrigger.refresh(); // Recalcula todos os pontos de animação após o carregamento
}

preloadAssets();

document.getElementById('next-slide').addEventListener('click', () => updateSlide('next'));
document.getElementById('prev-slide').addEventListener('click', () => updateSlide('prev'));

// --- MENU HAMBURGER ---
const menuToggle = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');
let isMenuOpen = false;

// Timeline do Menu para controle total e performance
const menuTL = gsap.timeline({ paused: true });

menuTL.to(navMenu, {
    visibility: "visible",
    clipPath: "circle(150% at calc(100% - 45px) 45px)",
    duration: 0.8,
    ease: "expo.inOut",
    pointerEvents: "all"
})
.to(".menu-toggle span:nth-child(1)", { rotation: 45, y: 8, duration: 0.4 }, "-=0.8")
.to(".menu-toggle span:nth-child(2)", { opacity: 0, duration: 0.2 }, "-=0.8")
.to(".menu-toggle span:nth-child(3)", { rotation: -45, y: -8, duration: 0.4 }, "-=0.8")
.to("#nav-menu a", { 
    opacity: 1, 
    y: 0, 
    stagger: 0.1, 
    duration: 0.5,
    ease: "power3.out"
}, "-=0.4");

menuToggle.addEventListener('click', () => {
    if (!isMenuOpen) {
        menuToggle.classList.add('active');
        menuTL.play();
        lenis.stop(); // Trava o scroll da página
    } else {
        menuToggle.classList.remove('active');
        menuTL.reverse();
        lenis.start(); // Libera o scroll
    }
    isMenuOpen = !isMenuOpen;
});

// Fechar menu mobile automaticamente ao clicar em um link (UX improvement)
document.querySelectorAll('#nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (isMenuOpen) {
            menuToggle.click(); // Dispara a lógica de fechamento e animação
        }
    });
});

// --- TRANSICÃO HERO -> CONTENT ---
// Faz o background da hero "mergulhar" e desaparecer suavemente ao scrollar
gsap.to(".hero-bg-container", {
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    },
    yPercent: 15, // Uso de porcentagem para evitar gaps matemáticos em diferentes alturas
    scale: 1.1,
    opacity: 0,
    ease: "none"
});

// --- MOUSE PARALLAX EFFECT ---
const cursor = document.querySelector('.custom-cursor');
const follower = document.querySelector('.cursor-follower');
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Instâncias quickTo para performance máxima em mousemove
const xCursorTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3"});
const yCursorTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3"});
const xFollowerTo = gsap.quickTo(follower, "x", {duration: 0.3, ease: "power3"});
const yFollowerTo = gsap.quickTo(follower, "y", {duration: 0.3, ease: "power3"});

const parallaxXTo = gsap.quickTo(".can-parallax-wrapper", "x", {duration: 1.2, ease: "power2.out"});
const parallaxYTo = gsap.quickTo(".can-parallax-wrapper", "y", {duration: 1.2, ease: "power2.out"});
const parallaxRotYTo = gsap.quickTo(".can-parallax-wrapper", "rotationY", {duration: 1.2, ease: "power2.out"});
const parallaxRotXTo = gsap.quickTo(".can-parallax-wrapper", "rotationX", {duration: 1.2, ease: "power2.out"});

window.addEventListener('mousemove', (e) => {
    if (isTouchDevice) return;

    // Calcula a posição do mouse de -0.5 a 0.5
    const xNormalized = (e.clientX / window.innerWidth) - 0.5;
    const yNormalized = (e.clientY / window.innerHeight) - 0.5;

    xCursorTo(e.clientX);
    yCursorTo(e.clientY);
    xFollowerTo(e.clientX - 20);
    yFollowerTo(e.clientY - 20);

    parallaxXTo(xNormalized * 40);
    parallaxYTo(yNormalized * 40);
    parallaxRotYTo(xNormalized * 15);
    parallaxRotXTo(-yNormalized * 15);
});

// --- MAGNETIC EFFECT ---
document.querySelectorAll('.control-btn, .cta-btn, nav a').forEach(btn => {
    if (isTouchDevice) return;

    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Efeito magnético no botão
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power2.out" });
    });

    btn.addEventListener('mouseenter', () => {
        // 1. Faz o ponto central (cursor) sumir
        gsap.to(cursor, { opacity: 0, scale: 0, duration: 0.3 });
        
        // 2. Transforma o seguidor (follower) no estilo Awwwards
        gsap.to(follower, { 
            scale: 2.5, 
            backgroundColor: themeState.color, 
            borderColor: themeState.color,
            mixBlendMode: "exclusion", // Inverte as cores por onde passa
            duration: 0.3 
        });
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
        
        // Retorna o cursor ao estado original
        gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.3 });
        gsap.to(follower, { 
            scale: 1, 
            backgroundColor: "transparent", 
            borderColor: "rgba(255,255,255,0.5)",
            mixBlendMode: "normal",
            duration: 0.3 
        });
    });
});

// --- SCROLLTRIGGER: JORNADA DA LATA ---
// Criando uma timeline responsiva para a jornada da lata
let mm = gsap.matchMedia();

mm.add({
    isDesktop: "(min-width: 769px)",
    isMobile: "(max-width: 768px)"
}, (context) => {
    let { isDesktop } = context.conditions;

    if (isDesktop) {
        // Reset definitivo do menu ao voltar para o desktop
        isMenuOpen = false;
        menuToggle.classList.remove('active');
        menuTL.pause(0); // Reseta a timeline para o estado inicial
        gsap.set([navMenu, "#nav-menu a"], { clearProps: "all" }); // Remove estilos inline do GSAP
        lenis.start(); // Garante que o scroll esteja ativo
    }

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-sections",
            start: "top bottom", 
            end: "bottom bottom",
            scrub: 1.5
        }
    });

    tl.to(".global-can-container", {
        x: isDesktop ? "-25vw" : "-15vw",
        y: "5vh",
        rotationZ: -15,
        rotationY: -20,
        ease: "none"
    })
    .to(".global-can-container", {
        x: isDesktop ? "25vw" : "15vw",
        y: "10vh",
        rotationZ: 15,
        rotationY: 20,
        ease: "none"
    })
    .to(".global-can-container", {
        x: "0vw",
        y: 0,
        rotationZ: 0,
        rotationY: 0,
        ease: "none"
    });
});

// Floating Animation Infinita
// Alterado para .can-wrapper para evitar conflito com o ScrollTrigger que usa o container global
gsap.to(".can-wrapper", {
    y: "-=20",
    repeat: -1,
    yoyo: true,
    duration: 2,
    ease: "power1.inOut"
});

// Animação dos textos revelando ao scrollar
document.querySelectorAll('.story-section').forEach(section => {
    const titleChars = section.querySelectorAll('.split-text .char');
    const p = section.querySelector('p');

    gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 60%",
        }
    })
    .to(titleChars, { y: 0, stagger: 0.02, duration: 1, ease: "expo.out" })
    .from(p, { y: 20, opacity: 0, duration: 1 }, "-=0.7");
});

// --- LIGHTWEIGHT WEBGL/CANVAS PARTICLES ---
// Efeito de partículas sutis subindo para dar sensação de "energia"
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let isCanvasVisible = true;

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = window.innerHeight + Math.random() * 100;
        this.baseSize = Math.random() * 3 + 1; // Armazena o tamanho original
        this.size = this.baseSize;
        this.speedY = Math.random() * 2 + 1.5; // Aumentado: velocidade de subida mais intensa
        this.opacity = Math.random() * 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5; // Movimento lateral suave
    }
    update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        // Efeito de Profundidade: Calcula o tamanho com base na altura
        // progress vai de ~1 no fundo da tela até 0 no topo
        const progress = Math.max(0, this.y / window.innerHeight);
        this.size = this.baseSize * (0.3 + progress * 0.7); // Garante que ela não suma totalmente (mínimo 30%)

        if (this.y < 0) this.reset();
    }
    draw() {
        ctx.fillStyle = themeState.color; 
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particleCount = window.innerWidth < 768 ? 80 : 200; // Aumentado: mais densidade de partículas
    particles = [];
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
}

function animateParticles() {
    if (!isCanvasVisible) {
        requestAnimationFrame(animateParticles);
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter'; // Efeito de brilho nas partículas
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

// Intersection Observer para pausar partículas fora de vista
const observer = new IntersectionObserver((entries) => {
    isCanvasVisible = entries[0].isIntersecting;
}, { threshold: 0.1 });
observer.observe(canvas);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(); // Re-inicializa para ajustar a densidade ao novo tamanho
});