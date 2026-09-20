/*!
 * Kaio Felix — Portfólio
 * Interações: tema claro/escuro, navegação, animações de entrada,
 * contadores, efeito de digitação, voltar ao topo e formulário de contato.
 */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------------------
     * Tema claro/escuro (o tema inicial é aplicado no <head> para evitar flash)
     * -------------------------------------------------------------------- */
    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('kf-theme', theme);
        } catch (e) {
            /* modo privado: mantém apenas na sessão atual */
        }
        document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
            btn.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
            btn.setAttribute('aria-pressed', String(theme === 'dark'));
        });
    }

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        });
    });

    applyTheme(root.getAttribute('data-theme') || 'light');

    /* ----------------------------------------------------------------------
     * Navbar: sombra ao rolar e link ativo da página atual
     * -------------------------------------------------------------------- */
    var nav = document.querySelector('.kf-nav');
    var toTop = document.querySelector('.kf-top');

    function onScroll() {
        var y = window.scrollY;
        if (nav) {
            nav.classList.toggle('is-scrolled', y > 8);
        }
        if (toTop) {
            toTop.classList.toggle('is-visible', y > 400);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toTop) {
        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.kf-nav .nav-link').forEach(function (link) {
        if (link.getAttribute('href') === current) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    /* ----------------------------------------------------------------------
     * Animações de entrada
     * -------------------------------------------------------------------- */
    var revealables = document.querySelectorAll('.kf-reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealables.forEach(function (el) {
            el.classList.add('is-visible');
        });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                var delay = Number(entry.target.dataset.delay || 0);
                setTimeout(function () {
                    entry.target.classList.add('is-visible');
                }, delay);
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealables.forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    /* ----------------------------------------------------------------------
     * Contadores das estatísticas
     * -------------------------------------------------------------------- */
    function runCounter(el) {
        var target = Number(el.dataset.count || 0);
        var suffix = el.dataset.suffix || '';
        if (reduceMotion) {
            el.textContent = target + suffix;
            return;
        }
        var start = performance.now();
        var duration = 1400;

        function tick(now) {
            var progress = Math.min((now - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    var counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        if (!('IntersectionObserver' in window)) {
            counters.forEach(runCounter);
        } else {
            var counterObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        runCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            counters.forEach(function (el) {
                counterObserver.observe(el);
            });
        }
    }

    /* ----------------------------------------------------------------------
     * Efeito de digitação do hero
     * -------------------------------------------------------------------- */
    var typed = document.querySelector('[data-typed]');
    if (typed) {
        var words = (typed.dataset.typed || '').split('|').filter(Boolean);
        if (words.length && reduceMotion) {
            typed.textContent = words[0];
        } else if (words.length) {
            var wordIndex = 0;
            var charIndex = 0;
            var deleting = false;

            (function type() {
                var word = words[wordIndex];
                charIndex += deleting ? -1 : 1;
                typed.textContent = word.slice(0, charIndex);

                var delay = deleting ? 45 : 85;

                if (!deleting && charIndex === word.length) {
                    deleting = true;
                    delay = 1800;
                } else if (deleting && charIndex === 0) {
                    deleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    delay = 350;
                }

                setTimeout(type, delay);
            })();
        }
    }

    /* ----------------------------------------------------------------------
     * Ano corrente no rodapé
     * -------------------------------------------------------------------- */
    document.querySelectorAll('[data-current-year]').forEach(function (el) {
        el.textContent = String(new Date().getFullYear());
    });

    /* ----------------------------------------------------------------------
     * Formulário de contato — monta um e-mail e abre o cliente do visitante.
     * Site estático (GitHub Pages), portanto sem backend.
     * -------------------------------------------------------------------- */
    var form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            var destination = form.dataset.mailto;
            var name = form.querySelector('#name').value.trim();
            var email = form.querySelector('#email').value.trim();
            var subject = form.querySelector('#subject').value.trim();
            var message = form.querySelector('#message').value.trim();

            var body = [
                'Nome: ' + name,
                'E-mail: ' + email,
                '',
                message
            ].join('\n');

            window.location.href = 'mailto:' + destination +
                '?subject=' + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(body);

            var feedback = document.getElementById('formFeedback');
            if (feedback) {
                feedback.classList.remove('d-none');
            }
            form.classList.remove('was-validated');
            form.reset();
        });
    }

    /* ----------------------------------------------------------------------
     * Copiar e-mail para a área de transferência
     * -------------------------------------------------------------------- */
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
        btn.addEventListener('click', function (event) {
            event.preventDefault();
            var value = btn.dataset.copy;
            var done = function () {
                var original = btn.querySelector('[data-copy-label]');
                if (!original) {
                    return;
                }
                var text = original.textContent;
                original.textContent = 'Copiado!';
                setTimeout(function () {
                    original.textContent = text;
                }, 1800);
            };

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(value).then(done).catch(function () {
                    window.location.href = 'mailto:' + value;
                });
            } else {
                window.location.href = 'mailto:' + value;
            }
        });
    });
})();
