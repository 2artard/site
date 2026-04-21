const photosDB = [
    { id: 1, src: 'img/1.png' }, { id: 2, src: 'img/2.jpg' }, { id: 3, src: 'img/3.jpg' },
    { id: 4, src: 'img/4.jpg' }, { id: 5, src: 'img/5.jpg' }, { id: 6, src: 'img/6.jpg' },
    { id: 7, src: 'img/7.jpg' }, { id: 8, src: 'img/8.jpg' }, { id: 9, src: 'img/9.jpg' },
    { id: 10, src: 'img/10.jpg' }, { id: 11, src: 'img/11.jpg' }, { id: 12, src: 'img/12.jpg' }, 
    { id: 13, src: 'img/13.jpg' }, { id: 14, src: 'img/14.jpg' }, { id: 15, src: 'img/15.jpg' }, 
    { id: 16, src: 'img/16.jpg' }, { id: 17, src: 'img/17.jpg' }, { id: 18, src: 'img/18.jpg' }, 
    { id: 19, src: 'img/19.jpg' }, { id: 20, src: 'img/20.jpg' }, { id: 21, src: 'img/21.jpg' }, 
    { id: 22, src: 'img/22.jpg' }, { id: 23, src: 'img/23.jpg' }, { id: 24, src: 'img/24.jpg' }, 
    { id: 25, src: 'img/25.jpg' }, { id: 26, src: 'img/26.jpg' }, { id: 27, src: 'img/27.jpg' }, 
    { id: 28, src: 'img/28.jpg' }, { id: 29, src: 'img/29.jpg' }, { id: 30, src: 'img/30.jpg' }, 
    { id: 31, src: 'img/31.jpg' }, { id: 32, src: 'img/32.jpg' }, { id: 33, src: 'img/33.jpg' }, 
    { id: 34, src: 'img/34.jpg' }, { id: 35, src: 'img/35.jpg' }, { id: 36, src: 'img/36.jpg' }, 
    { id: 37, src: 'img/37.jpg' }, { id: 38, src: 'img/38.jpg' }, { id: 39, src: 'img/39.jpg' }, 
    { id: 40, src: 'img/40.jpg' }, { id: 41, src: 'img/41.jpg' }, { id: 42, src: 'img/42.jpg' }, 
    { id: 43, src: 'img/43.jpg' }, { id: 44, src: 'img/44.jpg' }, { id: 45, src: 'img/45.jpg' }, 
    { id: 46, src: 'img/46.jpg' }, { id: 47, src: 'img/47.jpg' }, { id: 48, src: 'img/48.jpg' }, 
    { id: 49, src: 'img/49.jpg' }, { id: 50, src: 'img/50.jpg' }, { id: 51, src: 'img/51.jpg' }, 
    { id: 52, src: 'img/52.jpg' }, { id: 53, src: 'img/53.jpg' }, { id: 54, src: 'img/54.jpg' }, 
    { id: 55, src: 'img/55.jpg' }, { id: 56, src: 'img/56.jpg' }, { id: 57, src: 'img/57.jpg' }, 
    { id: 58, src: 'img/58.jpg' }, { id: 59, src: 'img/59.jpg' }
];

class GalleryApp {
    constructor() {
        this.container = document.getElementById('gallery-container');
        this.overlay = document.getElementById('overlay');
        this.maxPhotos = 10;
        this.activeCards = [];
        this.zoomedCard = null;
        
        this.spawnRate = 13000;      // Время между фото в обычном режиме
        this.pauseDuration = 4000;   // Пауза после взаимодействия
        this.resistance = 0.98;
        this.isSpawning = false;
        this.spawnTimeout = null;

        this.init();
    }

    init() {
        this.updateTimer();
        setInterval(() => this.updateTimer(), 60000);
        this.checkDate();
        this.startLifecycle();
        this.overlay.onclick = () => { if(this.zoomedCard) this.toggleZoom(this.zoomedCard); };
    }

    updateTimer() {
        const target = new Date('2026-04-30T00:00:00'); // ТВОЯ ДАТА ТУТ
        const diff = target - new Date();
        const widget = document.getElementById('timer-widget');
        if (diff <= 0) { widget.innerText = "Буду вечером..."; return; }
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const dec = (n, t) => t[(n%10==1 && n%100!=11)?0:(n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20))?1:2];
        widget.innerText = `До приезда: ${days} ${dec(days, ['день', 'дня', 'дней'])}`;
    }

    checkDate() {
        const now = new Date();
        if (now.getMonth() === 3 && now.getDate() === 21 && now.getFullYear() === 2026) {
            const btn = document.getElementById('secret-btn');
            gsap.to(btn, { scale: 1, duration: 0.8, ease: "back.out" });
            btn.onclick = () => window.location.href = 'birthday.html';
        }
    }

    // --- УЛУЧШЕННЫЙ ЦИКЛ СПАВНА ---
    startLifecycle() {
        if (this.isSpawning) return;
        this.isSpawning = true;

        const loop = () => {
            if (!this.isSpawning) return;
            this.spawnPhoto();
            // Если фоток мало, ускоряем начальное заполнение
            const nextDelay = this.activeCards.length < 7 ? 700 : this.spawnRate;
            this.spawnTimeout = setTimeout(loop, nextDelay);
        };
        
        this.spawnTimeout = setTimeout(loop, this.spawnRate);
    }

    stopLifecycle() {
        this.isSpawning = false;
        clearTimeout(this.spawnTimeout);
    }

    triggerInteractionPause() {
        this.stopLifecycle();
        clearTimeout(this.interactionTimer);
        this.interactionTimer = setTimeout(() => this.startLifecycle(), this.pauseDuration);
    }

    spawnPhoto() {
        // Если фото увеличено — выходим, ничего не создаем
        if (this.zoomedCard) return; 

        const activeIds = this.activeCards.map(c => c.id);
        const available = photosDB.filter(p => !activeIds.includes(p.id));
        if (available.length === 0) return;
        if (this.activeCards.length >= this.maxPhotos) this.removeCard(this.activeCards[0], false);

        const data = available[Math.floor(Math.random() * available.length)];
        const x = Math.random() * (window.innerWidth - 240) + 20;
        const y = Math.random() * (window.innerHeight - 300) + 20;
        this.createCard(data, x, y);
    }

    createCard(data, x, y) {
        const el = document.createElement('div');
        el.className = 'photo-card';
        el.style.backgroundImage = `url(${data.src})`;
        
        const rot = (Math.random() - 0.5) * 80;
        const z = this.activeCards.length + 1;
        el.style.zIndex = z;
        this.container.appendChild(el);

        const state = { id: data.id, el, x, y, rot, z, vx: 0, vy: 0, isDragged: false, zoomed: false };
        this.activeCards.push(state);

        gsap.fromTo(el, 
            { x, y: y + 600, rotation: rot + 40, opacity: 0, scale: 0.2 },
            { x, y, rotation: rot, opacity: 1, scale: 1, duration: 1.2, ease: "expo.out" }
        );

        this.initInteractions(state);
    }

    initInteractions(state) {
        interact(state.el).draggable({
            listeners: {
                start: () => {
                    this.triggerInteractionPause();
                    this.bringToFront(state);
                    state.isDragged = true;
                    if (state.zoomed) this.toggleZoom(state);
                    gsap.to(state.el, { scale: 1.05, duration: 0.2 });
                },
                move: (e) => {
                    state.x += e.dx; 
                    state.y += e.dy;
    
                    // Проверяем, сенсорный ли это ввод
                    const isTouch = e.pointerType === 'touch';
                    const multiplier = isTouch ? 2.5 : 1.2; // На телефоне ускоряем в 2.5 раза
    
                    state.vx = e.dx * multiplier; 
                    state.vy = e.dy * multiplier;
    
                    gsap.set(state.el, { x: state.x, y: state.y });
                },
                end: () => {
                    state.isDragged = false;
                    gsap.to(state.el, { scale: 1, duration: 0.2 });
                    this.applyInertia(state);
                }
            }
        }).on('tap', () => {
            this.triggerInteractionPause();
            this.toggleZoom(state);
        });
    }

    toggleZoom(state) {
        if (this.zoomedCard && this.zoomedCard !== state) this.toggleZoom(this.zoomedCard);

        if (!state.zoomed) {
            this.zoomedCard = state;
            state.zoomed = true;
        
            // 1. ОСТАНАВЛИВАЕМ СПАВН, пока смотрим фото
            this.stopLifecycle(); 
        
            this.bringToFront(state);
        
            // 2. ПРИНУДИТЕЛЬНО ставим самый высокий индекс
            state.el.style.zIndex = 99999; 
        
            this.overlay.style.opacity = 1;
            this.overlay.style.pointerEvents = 'auto';

            const pad = 60;
            const screenW = window.innerWidth - pad;
            const screenH = window.innerHeight - pad;
            const finalScale = Math.min(screenW / 220, screenH / 280);

            gsap.to(state.el, {
                x: window.innerWidth / 2 - 110, 
                y: window.innerHeight / 2 - 140, 
                scale: finalScale, rotation: 0,
                duration: 0.6, ease: "expo.out", overwrite: true
            });
        } else {
            state.zoomed = false;
            this.zoomedCard = null;
            this.overlay.style.opacity = 0;
            this.overlay.style.pointerEvents = 'none';

            // 3. ВОЗОБНОВЛЯЕМ СПАВН после закрытия
            this.startLifecycle();

            gsap.to(state.el, {
                x: state.x, y: state.y, scale: 1, rotation: state.rot,
                duration: 0.4, ease: "power2.inOut",
                onComplete: () => { 
                    state.el.style.zIndex = state.z; 
                }
            });
        }
    }

    applyInertia(state) {
        if (state.isDragged || state.zoomed) return;
        if (Math.abs(state.vx) > 0.5 || Math.abs(state.vy) > 0.5) {
            state.x += state.vx; state.y += state.vy;
            state.vx *= this.resistance; state.vy *= this.resistance;
            gsap.set(state.el, { x: state.x, y: state.y });
            if (this.isOffScreen(state)) return this.removeCard(state, true);
            requestAnimationFrame(() => this.applyInertia(state));
        }
    }

    isOffScreen(s) {
        const p = 350;
        return s.x < -p || s.x > window.innerWidth + p || s.y < -p || s.y > window.innerHeight + p;
    }

    removeCard(state, isForced = false) {
        const idx = this.activeCards.indexOf(state);
        if (idx === -1) return;
        this.activeCards.splice(idx, 1);
        
        gsap.to(state.el, { opacity: 0, scale: 0, duration: 0.3, onComplete: () => state.el.remove() });
        this.activeCards.forEach((c, i) => { c.z = i + 1; c.el.style.zIndex = c.z; });

        if (isForced) {
            this.stopLifecycle(); // Чистим старый таймер
            this.spawnPhoto();    // Мгновенный спавн
            this.startLifecycle(); // Запуск нового чистого цикла
        }
    }

    bringToFront(target) {
        const oldZ = target.z;
        const maxZ = this.activeCards.length;
        if (oldZ === maxZ) return;
        this.activeCards.forEach(c => { if (c.z > oldZ) { c.z--; c.el.style.zIndex = c.z; } });
        target.z = maxZ;
        target.el.style.zIndex = maxZ;
        this.activeCards.sort((a, b) => a.z - b.z);
    }
}

window.onload = () => new GalleryApp();