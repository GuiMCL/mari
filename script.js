document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let ambientParticles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor(x, y, isBurst = false) {
            this.x = x;
            this.y = y;
            this.isBurst = isBurst;
            this.type = Math.random() > 0.35 ? 'heart' : 'petal';

            if (isBurst) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6.5 + 2.5;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - 2.5;
                this.size = Math.random() * 14 + 8;
                this.alpha = 1;
                this.decay = Math.random() * 0.016 + 0.012;
                this.gravity = 0.08;
                this.color = `hsl(${Math.random() * 25 + 345}, 85%, ${Math.random() * 20 + 55}%)`;
            } else {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = -(Math.random() * 0.75 + 0.35);
                this.size = Math.random() * 10 + 6;
                this.alpha = Math.random() * 0.35 + 0.15;
                this.decay = 0;
                this.gravity = 0;
                this.color = `hsl(${Math.random() * 22 + 345}, 65%, ${Math.random() * 15 + 45}%)`;
            }

            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.035;
            this.flipSpeed = Math.random() * 0.03 + 0.01;
            this.flipAngle = Math.random() * Math.PI;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(Math.cos(this.flipAngle), 1);
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;

            if (this.type === 'heart') {
                const s = this.size / 10;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-5 * s, -5 * s, -10 * s, 2 * s, 0, 10 * s);
                ctx.bezierCurveTo(10 * s, 2 * s, 5 * s, -5 * s, 0, 0);
                ctx.fill();
            } else {
                const w = this.size * 0.8;
                const h = this.size * 1.3;
                ctx.beginPath();
                ctx.ellipse(0, 0, w / 2, h / 2, Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.rotation += this.rotSpeed;
            this.flipAngle += this.flipSpeed;

            if (this.isBurst) {
                this.alpha -= this.decay;
            } else {
                if (this.y < -20) {
                    this.y = canvas.height + 20;
                    this.x = Math.random() * canvas.width;
                }
                if (this.x < -20) this.x = canvas.width + 20;
                if (this.x > canvas.width + 20) this.x = -20;
            }
        }
    }

    function initAmbientParticles() {
        ambientParticles = [];
        const count = window.innerWidth < 768 ? 24 : 40;
        for (let i = 0; i < count; i++) {
            ambientParticles.push(new Particle(0, 0, false));
        }
    }

    function triggerParticleBurst(originX, originY) {
        for (let i = 0; i < 75; i++) {
            particles.push(new Particle(originX, originY, true));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ambientParticles.forEach(p => {
            p.update();
            p.draw();
        });

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animateParticles);
    }

    initAmbientParticles();
    animateParticles();

    let isOpen = false;
    let isAnimating = false;
    let isFilmStripEnlarged = false;
    const mainTimeline = gsap.timeline({ paused: true });

    function getFilmStripNormalProps() {
        const isMobile = window.innerWidth <= 480;
        const isSmall = window.innerWidth <= 360;
        return {
            xPercent: isSmall ? 30 : (isMobile ? 36 : 62),
            y: isSmall ? -85 : (isMobile ? -95 : -65),
            rotate: 6.5,
            scale: isSmall ? 0.70 : (isMobile ? 0.76 : 0.95)
        };
    }

    function buildGSAPTimeline() {
        mainTimeline.clear();

        const isMobile = window.innerWidth <= 480;
        const isSmall = window.innerWidth <= 360;
        const slideUpY = isSmall ? -160 : (isMobile ? -185 : -230);
        const settleY = isSmall ? -15 : (isMobile ? -20 : -30);
        const letterScale = isSmall ? 1.04 : (isMobile ? 1.07 : 1.12);
        const filmProps = getFilmStripNormalProps();

        gsap.set("#photobooth-strip", {
            xPercent: -50,
            y: 10,
            rotate: 0,
            scale: 0.8,
            opacity: 0,
            zIndex: 8
        });

        mainTimeline.to("#open-hint", {
            opacity: 0,
            y: 10,
            duration: 0.3,
            ease: "power2.out"
        }, 0);

        mainTimeline.to("#wax-seal", {
            scale: 1.35,
            opacity: 0,
            duration: 0.4,
            ease: "back.in(1.7)"
        }, 0.05);

        mainTimeline.to("#top-flap", {
            rotateX: 180,
            duration: 0.85,
            ease: "power2.inOut"
        }, 0.25);

        mainTimeline.set("#top-flap", { zIndex: 5 }, 0.65);

        mainTimeline.to("#letter", {
            y: slideUpY,
            duration: 0.85,
            ease: "power2.out"
        }, 0.75);

        mainTimeline.set("#letter", { zIndex: 40 }, 1.5);
        mainTimeline.set("#photobooth-strip", { zIndex: 35 }, 1.5);

        mainTimeline.to("#letter", {
            y: settleY,
            scale: letterScale,
            duration: 0.85,
            ease: "back.out(1.2)"
        }, 1.55);

        mainTimeline.to("#photobooth-strip", {
            opacity: 1,
            xPercent: filmProps.xPercent,
            y: filmProps.y,
            rotate: filmProps.rotate,
            scale: filmProps.scale,
            duration: 0.9,
            ease: "back.out(1.35)"
        }, 1.55);

        mainTimeline.fromTo(".letter-page.active > *", 
            { opacity: 0, y: 12 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.5, 
                stagger: 0.14, 
                ease: "power2.out" 
            }, 
            1.85
        );
    }

    buildGSAPTimeline();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isOpen) {
                buildGSAPTimeline();
            } else if (!isFilmStripEnlarged) {
                const filmProps = getFilmStripNormalProps();
                gsap.to("#photobooth-strip", {
                    xPercent: filmProps.xPercent,
                    y: filmProps.y,
                    rotate: filmProps.rotate,
                    scale: filmProps.scale,
                    duration: 0.3
                });
            }
        }, 200);
    });

    const waxSeal = document.getElementById('wax-seal');
    const envelope = document.getElementById('envelope');
    const photoboothStrip = document.getElementById('photobooth-strip');
    const openHint = document.getElementById('open-hint');
    const btnCloseEnvelope = document.getElementById('btnCloseEnvelope');
    const btnCloseEnvelopeTop = document.getElementById('btnCloseEnvelopeTop');
    
    const pages = document.querySelectorAll('.letter-page');
    const pageIndicator = document.getElementById('pageIndicator');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const nextBtnText = document.getElementById('nextBtnText');
    const nextBtnIcon = document.getElementById('nextBtnIcon');
    const letterContent = document.getElementById('letter-content');

    let currentPage = 1;
    const totalPages = pages.length;

    function openEnvelope() {
        if (isOpen || isAnimating) return;
        isOpen = true;

        const rect = waxSeal.getBoundingClientRect();
        const burstX = rect.left + rect.width / 2;
        const burstY = rect.top + rect.height / 2;

        triggerParticleBurst(burstX, burstY);
        mainTimeline.play();

        setTimeout(() => {
            if (isOpen && photoboothStrip) {
                photoboothStrip.classList.add('ready-interact');
            }
        }, 2200);
    }

    waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope();
    });

    envelope.addEventListener('click', (e) => {
        if (e.target.closest('.letter-footer') || e.target.closest('.letter-content') || e.target.closest('.letter-top-bar') || e.target.closest('.photobooth-strip')) {
            return;
        }
        if (!isOpen) {
            openEnvelope();
        }
    });

    if (photoboothStrip) {
        photoboothStrip.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isOpen || isAnimating) return;

            const isMobile = window.innerWidth <= 480;
            const isSmall = window.innerWidth <= 360;

            if (!isFilmStripEnlarged) {
                isFilmStripEnlarged = true;
                photoboothStrip.classList.add('enlarged');
                
                gsap.to(photoboothStrip, {
                    xPercent: -50,
                    y: isSmall ? -20 : (isMobile ? -25 : -35),
                    rotate: 0,
                    scale: isSmall ? 1.2 : (isMobile ? 1.35 : 1.5),
                    duration: 0.45,
                    ease: "back.out(1.2)"
                });
            } else {
                isFilmStripEnlarged = false;
                photoboothStrip.classList.remove('enlarged');
                const filmProps = getFilmStripNormalProps();

                gsap.to(photoboothStrip, {
                    xPercent: filmProps.xPercent,
                    y: filmProps.y,
                    rotate: filmProps.rotate,
                    scale: filmProps.scale,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });
    }

    function closeAndResealEnvelope() {
        if (!isOpen || isAnimating) return;
        isAnimating = true;

        if (photoboothStrip) {
            photoboothStrip.classList.remove('ready-interact');
            if (isFilmStripEnlarged) {
                isFilmStripEnlarged = false;
                photoboothStrip.classList.remove('enlarged');
            }
        }

        const activePage = document.querySelector(`.letter-page[data-page="${currentPage}"]`);
        gsap.to(activePage, {
            opacity: 0,
            duration: 0.25,
            onComplete: () => {
                mainTimeline.eventCallback("onReverseComplete", () => {
                    const rect = waxSeal.getBoundingClientRect();
                    const sealX = rect.left + rect.width / 2;
                    const sealY = rect.top + rect.height / 2;
                    
                    triggerParticleBurst(sealX, sealY);
                    
                    pages.forEach(p => p.classList.remove('active'));
                    currentPage = 1;
                    document.querySelector(`.letter-page[data-page="1"]`).classList.add('active');
                    gsap.set(document.querySelectorAll('.letter-page'), { opacity: 1, x: 0 });
                    updateNavigationUI();

                    isOpen = false;
                    isAnimating = false;

                    gsap.to(openHint, { opacity: 1, y: 0, duration: 0.4 });
                    
                    mainTimeline.eventCallback("onReverseComplete", null);
                });

                mainTimeline.reverse();
            }
        });
    }

    if (btnCloseEnvelope) {
        btnCloseEnvelope.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAndResealEnvelope();
        });
    }

    if (btnCloseEnvelopeTop) {
        btnCloseEnvelopeTop.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAndResealEnvelope();
        });
    }

    function changePage(newPage) {
        if (isAnimating || newPage === currentPage || newPage < 1 || newPage > totalPages) return;
        isAnimating = true;

        const isGoingForward = newPage > currentPage;
        const activePage = document.querySelector(`.letter-page[data-page="${currentPage}"]`);
        const targetPage = document.querySelector(`.letter-page[data-page="${newPage}"]`);

        letterContent.scrollTo({ top: 0, behavior: 'smooth' });

        gsap.to(activePage, {
            opacity: 0,
            x: isGoingForward ? -20 : 20,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                activePage.classList.remove('active');
                gsap.set(activePage, { x: 0 });

                targetPage.classList.add('active');
                gsap.fromTo(targetPage, 
                    { opacity: 0, x: isGoingForward ? 20 : -20 },
                    { 
                        opacity: 1, 
                        x: 0, 
                        duration: 0.35, 
                        ease: "power2.out",
                        onComplete: () => {
                            isAnimating = false;
                        }
                    }
                );
            }
        });

        currentPage = newPage;
        updateNavigationUI();
    }

    function updateNavigationUI() {
        pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
        prevBtn.disabled = currentPage === 1;

        if (currentPage === totalPages) {
            nextBtnText.textContent = "Reler ♥";
            nextBtnIcon.className = "fa-solid fa-heart";
            nextBtn.classList.add('re-read-pulse');
        } else {
            nextBtnText.textContent = "Próxima página";
            nextBtnIcon.className = "fa-solid fa-arrow-right";
            nextBtn.classList.remove('re-read-pulse');
        }
    }

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPage === totalPages) {
            changePage(1);
        } else {
            changePage(currentPage + 1);
        }
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isOpen) return;
        const xAxis = (window.innerWidth / 2 - e.pageX) / 35;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 35;
        envelope.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });
});
