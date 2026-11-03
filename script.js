/**
 * Muhammad Asyraf — Personal Portfolio Interactive Engine (script.js)
 */
(() => {
    'use strict';

    /* ==========================================================================
       0. Core Utilities & Safe Error Handling Boundary
       ========================================================================== */
    const SafeStorage = {
        get(key, fallback = null) {
            try {
                const item = window.localStorage.getItem(key);
                return item !== null ? JSON.parse(item) : fallback;
            } catch {
                return fallback;
            }
        },
        set(key, value) {
            try {
                window.localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                return false;
            }
        }
    };

    const runModule = (moduleName, initFn) => {
        try {
            initFn();
        } catch (error) {
            console.info(`[Portfolio Module Skipped: ${moduleName}]`, error.message);
        }
    };

    const prefersReducedMotion = () =>
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ==========================================================================
       1. Dynamic UI Stylesheet Injection (Supports Dark Mode & Injected Widgets)
       ========================================================================== */
    const injectPortfolioStyles = () => {
        const style = document.createElement('style');
        style.id = 'asyraf-interactive-styles';
        style.textContent = `
            html[data-theme="dark"] {
                --bg-gradient: linear-gradient(135deg, #0f171e 0%, #1d2b3a 50%, #3b1d11 100%);
                --surface-card: rgba(24, 34, 45, 0.92);
                --surface-even: rgba(31, 44, 58, 0.95);
                --text-primary: #f0f4f8;
                --text-Paragraph: #7ce8e8;
                --heading-gold: #f5b942;
                --accent-brown: #ff8a75;
                --border-warm: rgba(245, 185, 66, 0.35);
                --shadow-soft: 0 8px 24px rgba(0, 0, 0, 0.45);
            }
            html[data-theme="dark"] .project-tag {
                color: #1c2526;
            }
            #scroll-progress-bar {
                position: fixed; top: 0; left: 0; height: 4px; width: 0%;
                background: linear-gradient(90deg, var(--heading-gold), var(--accent-tomato));
                z-index: 9999; transition: width 0.1s ease-out;
            }
            .utility-bar {
                display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
                gap: 0.75rem; margin-bottom: 1rem; padding: 0.65rem 1rem;
                background: var(--surface-card); border-radius: var(--radius-lg);
                border: 2px solid var(--border-warm); box-shadow: var(--shadow-soft);
            }
            .status-badge {
                display: inline-flex; align-items: center; gap: 0.5rem;
                font-size: 0.9rem; font-weight: 700; color: var(--text-Paragraph);
            }
            .status-dot {
                width: 10px; height: 10px; border-radius: 50%;
                background-color: #2ecc71; box-shadow: 0 0 8px #2ecc71;
            }
            .utility-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
            .btn-interactive {
                cursor: pointer; font-family: var(--font-heading); font-weight: 600;
                font-size: 0.9rem; padding: 0.45rem 0.9rem; border-radius: 999px;
                border: 2px solid var(--border-warm); background: var(--surface-even);
                color: var(--heading-gold); transition: all 0.2s ease;
            }
            .btn-interactive:hover, .btn-interactive:focus-visible {
                background: var(--heading-gold); color: #1c2526; transform: translateY(-2px);
            }
            .btn-interactive[aria-pressed="true"], .btn-interactive.active-filter {
                background: var(--heading-gold); color: #1c2526;
            }
            .nav-active {
                background-color: var(--heading-gold) !important;
                color: #1c2526 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            .reveal-section {
                opacity: 0; transform: translateY(20px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            .reveal-section.is-visible { opacity: 1; transform: translateY(0); }
            .interactive-tray {
                margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem;
            }
            .skill-chip, .hobby-chip {
                font-size: 0.85rem; padding: 0.35rem 0.8rem; border-radius: 999px;
                border: 1px solid var(--border-warm); background: var(--surface-card);
                color: var(--text-Paragraph); font-weight: 700; cursor: pointer;
                transition: transform 0.15s ease, background 0.2s ease;
            }
            .skill-chip:hover, .hobby-chip:hover { transform: scale(1.05); }
            .hobby-spotlight {
                margin-top: 0.75rem; font-size: 0.9rem; font-style: normal;
                padding: 0.6rem 0.9rem; border-left: 4px solid var(--heading-gold);
                background: var(--surface-even); border-radius: 0 8px 8px 0;
                color: var(--text-Paragraph);
            }
            .copy-badge {
                margin-left: 0.5rem; font-size: 0.75rem; padding: 0.2rem 0.55rem;
            }
            .quick-msg-form {
                margin-top: 1rem; display: grid; gap: 0.65rem;
                padding-top: 1rem; border-top: 1px dashed var(--border-warm);
            }
            .quick-msg-form input, .quick-msg-form textarea {
                width: 100%; padding: 0.6rem 0.8rem; border-radius: 8px;
                border: 2px solid var(--border-warm); background: var(--surface-card);
                color: var(--text-primary); font-family: var(--font-body);
            }
            .toast-notification {
                position: fixed; bottom: 1.5rem; left: 1.5rem; z-index: 9999;
                background: var(--heading-gold); color: #1c2526; font-family: var(--font-heading);
                font-weight: 700; padding: 0.75rem 1.25rem; border-radius: 10px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.3); opacity: 0;
                transform: translateY(15px); pointer-events: none; transition: all 0.25s ease;
            }
            .toast-notification.show { opacity: 1; transform: translateY(0); }
            .cmd-modal {
                position: fixed; inset: 0; background: rgba(0,0,0,0.65);
                display: none; align-items: center; justify-content: center; z-index: 10000;
                padding: 1rem; backdrop-filter: blur(4px);
            }
            .cmd-modal.open { display: flex; }
            .cmd-box {
                background: var(--surface-card); color: var(--text-primary);
                border: 2px solid var(--heading-gold); border-radius: var(--radius-lg);
                max-width: 28rem; width: 100%; padding: 1.5rem; box-shadow: var(--shadow-soft);
            }
            .project-card[hidden] {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    };

    /* ==========================================================================
       2. Toast Notification & Screen Reader Announcer
       ========================================================================== */
    let toastTimer = null;
    const notifyUser = (message) => {
        let toast = document.getElementById('portfolio-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'portfolio-toast';
            toast.className = 'toast-notification';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
    };

    /* ==========================================================================
       Feature 1: Theme Engine (Dark / Sunset Light Mode + Persistence)
       ========================================================================== */
    const initThemeAndUtilityBar = () => {
        const header = document.querySelector('header');
        if (!header) return;

        const savedTheme = SafeStorage.get('asyraf_theme', 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);

        const utilityBar = document.createElement('div');
        utilityBar.className = 'utility-bar';
        utilityBar.innerHTML = `
            <div class="status-badge" id="sarawak-clock-badge">
                <span class="status-dot" aria-hidden="true"></span>
                <span id="sarawak-time-text">Kuching, Sarawak</span>
            </div>
            <div class="utility-actions">
                <button type="button" class="btn-interactive" id="theme-toggle-btn" aria-pressed="${savedTheme === 'dark'}">
                    ${savedTheme === 'dark' ? '☀ Sunset Mode' : '🌙 Night Mode'}
                </button>
                <button type="button" class="btn-interactive" id="font-scale-btn" title="Cycle text size">
                    Aa Text Size
                </button>
                <button type="button" class="btn-interactive" id="cmd-help-btn" title="Keyboard Shortcuts (?)">
                    ⌨ Shortcuts
                </button>
            </div>
        `;
        header.insertBefore(utilityBar, header.firstChild);

        const themeBtn = document.getElementById('theme-toggle-btn');
        themeBtn?.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            themeBtn.setAttribute('aria-pressed', String(next === 'dark'));
            themeBtn.textContent = next === 'dark' ? '☀ Sunset Mode' : '🌙 Night Mode';
            SafeStorage.set('asyraf_theme', next);
            notifyUser(`Switched to ${next === 'dark' ? 'Sarawak Night' : 'Sunset Gold'} theme`);
        });
    };

    /* ==========================================================================
       Feature 2: Live Kuching, Sarawak Time & Student Status Engine
       ========================================================================== */
    const initSarawakLiveClock = () => {
        const timeEl = document.getElementById('sarawak-time-text');
        if (!timeEl) return;

        const updateClock = () => {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Kuching',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            const timeString = new Intl.DateTimeFormat('en-MY', options).format(now);
            const hour24 = Number(
                new Intl.DateTimeFormat('en-MY', {
                    timeZone: 'Asia/Kuching',
                    hour: 'numeric',
                    hour12: false
                }).format(now)
            );

            let activity = 'Studying & Coding';
            if (hour24 >= 23 || hour24 < 6) activity = 'Resting (Offline)';
            else if (hour24 >= 6 && hour24 < 8) activity = 'Morning Prep';
            else if (hour24 >= 17 && hour24 < 20) activity = 'Family & Hobbies';

            timeEl.textContent = `Kuching (GMT+8): ${timeString} • ${activity}`;
        };

        updateClock();
        setInterval(updateClock, 1000);
    };

    /* ==========================================================================
       Feature 3: Time-Aware Personal Greeting & Visit Counter in #p1
       ========================================================================== */
    const initPersonalizedGreeting = () => {
        const introParagraph = document.getElementById('p1');
        if (!introParagraph) return;

        const visits = Number(SafeStorage.get('asyraf_visits', 0)) + 1;
        SafeStorage.set('asyraf_visits', visits);

        const hour = new Date().getHours();
        const greeting =
            hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

        const visitBadge = visits > 1 ? ` (Welcome back — Visit #${visits}!)` : ' (First time here? Welcome aboard!)';
        introParagraph.textContent = `${greeting}! My name is Muhammad Asyraf. Welcome to my personal website.${visitBadge}`;
    };

    /* ==========================================================================
       Feature 4: Reading Progress Bar & Bottom-Right Back-to-Top Arrow Button
       ========================================================================== */
    const initScrollAndBackToTop = () => {
        const bar = document.createElement('div');
        bar.id = 'scroll-progress-bar';
        bar.setAttribute('aria-hidden', 'true');
        document.body.prepend(bar);

        let backToTopBtn = document.getElementById('back-to-top-btn');
        if (!backToTopBtn) {
            backToTopBtn = document.createElement('button');
            backToTopBtn.type = 'button';
            backToTopBtn.id = 'back-to-top-btn';
            backToTopBtn.className = 'back-to-top';
            backToTopBtn.setAttribute('aria-label', 'Back to top');
            backToTopBtn.title = 'Back to top';
            backToTopBtn.textContent = '↑';
            document.body.appendChild(backToTopBtn);
        }

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
            document.querySelector('h1')?.focus({ preventScroll: true });
            notifyUser('Returned to top');
        });

        let ticking = false;
        const updateScrollUI = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
            bar.style.width = `${pct}%`;

            backToTopBtn.classList.toggle('is-visible', scrollTop > 180);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollUI);
                ticking = true;
            }
        }, { passive: true });

        updateScrollUI();
    };

    /* ==========================================================================
       Feature 5: Top Bar Navigation Click Handler & IntersectionObserver Scroll-Spy
       ========================================================================== */
    const initScrollSpyAndReveal = () => {
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('.top-navbar a[href^="#"], nav a[href^="#"]');
        if (!sections.length) return;

        navLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href')?.slice(1);
                const targetSection = targetId ? document.getElementById(targetId) : null;
                if (targetSection) {
                    e.preventDefault();
                    targetSection.scrollIntoView({
                        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                        block: 'start'
                    });
                    navLinks.forEach((l) => l.classList.remove('nav-active'));
                    link.classList.add('nav-active');
                }
            });
        });

        if (!prefersReducedMotion()) {
            sections.forEach((sec) => sec.classList.add('reveal-section'));
        }

        if (!('IntersectionObserver' in window)) {
            sections.forEach((sec) => sec.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        const id = entry.target.getAttribute('id');
                        navLinks.forEach((link) => {
                            const isMatch = link.getAttribute('href') === `#${id}`;
                            link.classList.toggle('nav-active', isMatch);
                            if (isMatch) link.setAttribute('aria-current', 'true');
                            else link.removeAttribute('aria-current');
                        });
                    }
                });
            },
            { threshold: 0.2, rootMargin: '-15% 0px -25% 0px' }
        );

        sections.forEach((sec) => observer.observe(sec));
    };

    /* ==========================================================================
       Feature 6: Interactive Skill Filter Matrix (Section 4)
       ========================================================================== */
    const initInteractiveSkills = () => {
        const skillSection = document.getElementById('my-skills');
        if (!skillSection) return;

        const skillsData = [
            { name: 'Communication', category: 'soft', level: 'Advanced' },
            { name: 'Teamwork', category: 'soft', level: 'Advanced' },
            { name: 'Problem-Solving', category: 'core', level: 'Strong' },
            { name: 'Basic Computer Skills', category: 'tech', level: 'Proficient' },
            { name: 'Linux & MySQL', category: 'tech', level: 'Hands-On' },
            { name: 'Java & PHP', category: 'tech', level: 'Growing' },
            { name: 'Time Management', category: 'core', level: 'Strong' }
        ];

        const controls = document.createElement('div');
        controls.className = 'interactive-tray';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', 'Filter skills by category');

        const categories = [
            { id: 'all', label: 'All Skills' },
            { id: 'tech', label: 'Technical' },
            { id: 'soft', label: 'Interpersonal' },
            { id: 'core', label: 'Core Productivity' }
        ];

        const chipContainer = document.createElement('div');
        chipContainer.className = 'interactive-tray';

        const renderChips = (filterId) => {
            chipContainer.innerHTML = '';
            skillsData
                .filter((s) => filterId === 'all' || s.category === filterId)
                .forEach((skill) => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'skill-chip';
                    chip.textContent = `${skill.name} • ${skill.level}`;
                    chip.addEventListener('click', () => {
                        notifyUser(`${skill.name}: ${skill.level} proficiency`);
                    });
                    chipContainer.appendChild(chip);
                });
        };

        categories.forEach((cat, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `btn-interactive ${idx === 0 ? 'active-filter' : ''}`;
            btn.textContent = cat.label;
            btn.addEventListener('click', () => {
                controls.querySelectorAll('button').forEach((b) => b.classList.remove('active-filter'));
                btn.classList.add('active-filter');
                renderChips(cat.id);
            });
            controls.appendChild(btn);
        });

        renderChips('all');
        skillSection.append(controls, chipContainer);
    };

    /* ==========================================================================
       Feature 7: Interactive Project Filter (Section 5: My Projects)
       ========================================================================== */
    const initProjectFilter = () => {
        const projectSection = document.getElementById('my-projects');
        const projectGrid = document.getElementById('project-grid');
        if (!projectSection || !projectGrid) return;

        const cards = projectGrid.querySelectorAll('.project-card');
        if (!cards.length) return;

        const filterBar = document.createElement('div');
        filterBar.className = 'interactive-tray';
        filterBar.setAttribute('role', 'group');
        filterBar.setAttribute('aria-label', 'Filter projects by domain');

        const filters = [
            { id: 'all', label: 'All Projects (5)' },
            { id: 'systems', label: 'OS & CPU Systems (2)' },
            { id: 'web-db', label: 'Web, PHP & MySQL (2)' },
            { id: 'software', label: 'Java Quiz Game (1)' }
        ];

        filters.forEach((f, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `btn-interactive ${idx === 0 ? 'active-filter' : ''}`;
            btn.textContent = f.label;
            btn.addEventListener('click', () => {
                filterBar.querySelectorAll('button').forEach((b) => b.classList.remove('active-filter'));
                btn.classList.add('active-filter');

                cards.forEach((card) => {
                    const match = f.id === 'all' || card.getAttribute('data-category') === f.id;
                    card.hidden = !match;
                });
                notifyUser(`Showing: ${f.label}`);
            });
            filterBar.appendChild(btn);
        });

        projectSection.insertBefore(filterBar, projectGrid);
    };

    /* ==========================================================================
       Feature 8: Interactive Hobby Explorer (Section 3)
       ========================================================================== */
    const initHobbyExplorer = () => {
        const hobbySection = document.getElementById('my-hobbies');
        if (!hobbySection) return;

        const hobbies = [
            { label: '📚 Reading', detail: 'Exploring tech articles, self-growth books, current news, and sci-fi stories.' },
            { label: '🎵 Music', detail: 'R&B and Rock playlists for deep study sessions.' },
            { label: '🎬 Movies', detail: 'Sci-fi, inspiring biographies, and animated storytelling.' },
            { label: '🎮 Gaming', detail: 'Action RPGs and multiplayer games that sharpen quick thinking and problem solving.' },
            { label: '👨‍👩‍👦 Family & Friends', detail: 'Weekend hangouts and allocate times to spend time with family.' }
        ];

        const tray = document.createElement('div');
        tray.className = 'interactive-tray';

        const spotlight = document.createElement('div');
        spotlight.className = 'hobby-spotlight';
        spotlight.textContent = 'Click any hobby badge above to see what I enjoy most about it!';

        hobbies.forEach((h) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'hobby-chip';
            chip.textContent = h.label;
            chip.addEventListener('click', () => {
                spotlight.textContent = `${h.label}: ${h.detail}`;
            });
            tray.appendChild(chip);
        });

        hobbySection.append(tray, spotlight);
    };

    /* ==========================================================================
       Feature 9: One-Click Copy Contact Badges & Quick Message Form (Section 6)
       ========================================================================== */
    const initContactEnhancements = () => {
        const contactSection = document.getElementById('contact-me');
        if (!contactSection) return;

        const links = contactSection.querySelectorAll('address a');
        links.forEach((link) => {
            const rawText = link.textContent.trim();
            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'btn-interactive copy-badge';
            copyBtn.textContent = 'Copy';
            copyBtn.setAttribute('aria-label', `Copy ${rawText} to clipboard`);

            copyBtn.addEventListener('click', async () => {
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(rawText);
                    } else {
                        const temp = document.createElement('textarea');
                        temp.value = rawText;
                        document.body.appendChild(temp);
                        temp.select();
                        document.execCommand('copy');
                        temp.remove();
                    }
                    copyBtn.textContent = '✓ Copied';
                    notifyUser(`Copied "${rawText}" to clipboard!`);
                    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
                } catch {
                    notifyUser('Press Ctrl+C to copy manually');
                }
            });

            link.insertAdjacentElement('afterend', copyBtn);
        });

        const savedDraft = SafeStorage.get('asyraf_msg_draft', { name: '', message: '' });

        const form = document.createElement('form');
        form.className = 'quick-msg-form';
        form.setAttribute('aria-label', 'Send a quick message to Muhammad Asyraf');
        form.innerHTML = `
            <label for="visitor-name"><strong>Send a Quick Note (Auto-saves draft):</strong></label>
            <input id="visitor-name" type="text" placeholder="Your Name" required maxlength="60" value="${savedDraft.name || ''}">
            <textarea id="visitor-msg" rows="2" placeholder="Write a short hello or project collaboration idea..." required maxlength="300">${savedDraft.message || ''}</textarea>
            <div>
                <button type="submit" class="btn-interactive">✉ Prepare Email to Asyraf</button>
            </div>
        `;

        const nameInput = form.querySelector('#visitor-name');
        const msgInput = form.querySelector('#visitor-msg');

        const saveDraft = () => {
            SafeStorage.set('asyraf_msg_draft', {
                name: nameInput.value,
                message: msgInput.value
            });
        };

        nameInput.addEventListener('input', saveDraft);
        msgInput.addEventListener('input', saveDraft);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const sender = nameInput.value.trim();
            const body = msgInput.value.trim();
            if (!sender || !body) return;

            const mailtoUrl = `mailto:alex@example.com?subject=${encodeURIComponent(`Portfolio Hello from ${sender}`)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoUrl;
            SafeStorage.set('asyraf_msg_draft', { name: '', message: '' });
            form.reset();
            notifyUser('Opening your email client...');
        });

        contactSection.appendChild(form);
    };

    /* ==========================================================================
       Feature 10: Custom Comfort Typography Scaler & Keyboard Shortcuts (1-6, T, ?)
       ========================================================================== */
    const initTypographyAndShortcuts = () => {
        const fontBtn = document.getElementById('font-scale-btn');
        const helpBtn = document.getElementById('cmd-help-btn');
        const scales = [100, 110, 120];
        let currentScaleIdx = scales.indexOf(Number(SafeStorage.get('asyraf_font_scale', 100)));
        if (currentScaleIdx === -1) currentScaleIdx = 0;

        const applyScale = (idx) => {
            const pct = scales[idx];
            document.documentElement.style.fontSize = `${pct}%`;
            SafeStorage.set('asyraf_font_scale', pct);
            if (fontBtn) fontBtn.textContent = `Aa Text (${pct}%)`;
        };
        applyScale(currentScaleIdx);

        fontBtn?.addEventListener('click', () => {
            currentScaleIdx = (currentScaleIdx + 1) % scales.length;
            applyScale(currentScaleIdx);
            notifyUser(`Text zoom set to ${scales[currentScaleIdx]}%`);
        });

        const modal = document.createElement('div');
        modal.className = 'cmd-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Keyboard Shortcuts');
        modal.innerHTML = `
            <div class="cmd-box">
                <h2>⌨ Quick Keyboard Shortcuts</h2>
                <p style="font-style:normal; font-size:0.95rem; margin-bottom:1rem;">
                    <strong>1 – 6</strong> : Jump to sections 1 through 6<br>
                    <strong>T</strong> : Toggle Sunset / Sarawak Night theme<br>
                    <strong>?</strong> : Open or close this shortcuts guide<br>
                    <strong>Esc</strong> : Close dialog
                </p>
                <button type="button" class="btn-interactive" id="close-cmd-modal">Close (Esc)</button>
            </div>
        `;
        document.body.appendChild(modal);

        const toggleModal = (forceState) => {
            const isOpen = typeof forceState === 'boolean' ? forceState : !modal.classList.contains('open');
            modal.classList.toggle('open', isOpen);
        };

        helpBtn?.addEventListener('click', () => toggleModal(true));
        modal.querySelector('#close-cmd-modal')?.addEventListener('click', () => toggleModal(false));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) toggleModal(false);
        });

        window.addEventListener('keydown', (e) => {
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === 'Escape') {
                toggleModal(false);
            } else if (e.key === '?') {
                e.preventDefault();
                toggleModal();
            } else if (e.key.toLowerCase() === 't') {
                e.preventDefault();
                document.getElementById('theme-toggle-btn')?.click();
            } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
                const sectionIds = [
                    'about-me',
                    'my-education',
                    'my-hobbies',
                    'my-skills',
                    'my-projects',
                    'contact-me'
                ];
                const target = document.getElementById(sectionIds[Number(e.key) - 1]);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
                    notifyUser(`Jumped to Section ${e.key}`);
                }
            }
        });
    };

    /* ==========================================================================
       Feature 11: Interactive Avatar Greeting
       ========================================================================== */
    const initAvatarGreeting = () => {
        const avatar = document.querySelector('.profile-avatar');
        if (!avatar) return;

        avatar.addEventListener('click', () => {
            notifyUser('👋 Hello there! Thanks for visiting my portfolio.');
        });
        avatar.style.cursor = 'pointer';
        avatar.title = 'Click to say hello!';
    };

    /* ==========================================================================
       Initialize All Modules Safely on DOMContentLoaded
       ========================================================================== */
    const bootstrapPortfolio = () => {
        runModule('StylesheetInjector', injectPortfolioStyles);
        runModule('ThemeAndUtilityBar', initThemeAndUtilityBar);
        runModule('SarawakLiveClock', initSarawakLiveClock);
        runModule('PersonalizedGreeting', initPersonalizedGreeting);
        runModule('ScrollAndBackToTop', initScrollAndBackToTop);
        runModule('ScrollSpyAndReveal', initScrollSpyAndReveal);
        runModule('InteractiveSkills', initInteractiveSkills);
        runModule('ProjectFilter', initProjectFilter);
        runModule('HobbyExplorer', initHobbyExplorer);
        runModule('ContactEnhancements', initContactEnhancements);
        runModule('TypographyAndShortcuts', initTypographyAndShortcuts);
        runModule('AvatarGreeting', initAvatarGreeting);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrapPortfolio);
    } else {
        bootstrapPortfolio();
    }
})();