/* ============================================================
   SCALINIS — /js/main.js
   Modular JS: Nav | Lang | Carousel | Scroll Reveal
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   TRANSLATIONS — JSON-based bilingual content
   ────────────────────────────────────────────── */
const translations = {
  en: {
    // Nav
    "nav.menu":        "Menu",
    "nav.story":       "Our Story",
    "nav.gallery":     "Gallery",
    "nav.contact":     "Contact",
    "nav.reserve":     "Reserve a Table",

    // Hero
    "hero.eyebrow":    "Est. Milano · 2019",
    "hero.subtitle":   "Authentic Italian Cuisine · Fine Dining",
    "hero.cta1":       "Explore the Menu",
    "hero.cta2":       "Reserve a Table",

    // About
    "about.eyebrow":   "Our Story",
    "about.title":     "A Passion Born in Milan",
    "about.p1":        "Scalinis was born from a lifelong love affair with Italian tradition. Every recipe is a tribute to the timeless kitchens of northern Italy, where quality ingredients and unhurried craft have always been the only rule.",
    "about.p2":        "Our chef, trained in the heart of Milan, brings decades of mastery to every plate — from hand-rolled pasta to slow-braised meats kissed with truffle and aged wine.",

    // Dishes
    "dishes.eyebrow":  "The Classics",
    "dishes.title":    "Signature Dishes",
    "dishes.tag1":     "Chef's Choice",
    "dishes.tag2":     "Seasonal",
    "dishes.tag3":     "Signature",
    "dishes.d1.name":  "Beef Tenderloin",
    "dishes.d1.desc":  "Slow-roasted · Mustard jus · Crispy onions",
    "dishes.d2.name":  "Rigatoni Amatriciana",
    "dishes.d2.desc":  "San Marzano · Guanciale · Pecorino",
    "dishes.d3.name":  "Tornados Rossini",
    "dishes.d3.desc":  "Foie gras · Truffle · Madeira jus",

    // Gallery
    "gallery.eyebrow": "The Table",
    "gallery.title":   "From Our Kitchen",

    // Philosophy
    "philosophy.eyebrow": "Philosophy",
    "philosophy.title": "Craft Over Convenience",
    "philosophy.p1":   "At Scalinis, we believe fine dining is not merely about food — it is about the ritual of gathering, the ceremony of a shared table, and the quiet pleasure of being truly looked after.",
    "philosophy.p2":   "Every detail, from the hand-selected ceramics to the candlelight ambience, is designed to slow time and deepen pleasure.",
    "philosophy.cta":  "Read Our Story",

    // Experience
    "exp.eyebrow":     "The Experience",
    "exp.title":       "Every Evening, Extraordinary",
    "exp.p":           "Whether you are celebrating a milestone or simply seeking refuge from the ordinary, Scalinis offers a sanctuary of flavour, warmth, and understated elegance.",
    "exp.cta":         "Book Your Evening",
    "exp.s1.num":      "12",
    "exp.s1.label":    "Years of Excellence",
    "exp.s2.num":      "40+",
    "exp.s2.label":    "Seasonal Dishes",
    "exp.s3.num":      "★ 4.9",
    "exp.s3.label":    "Guest Rating",

    // Reservations CTA
    "res.eyebrow":     "Reservations",
    "res.title":       "Join Us This Evening",
    "res.p":           "Tables fill quickly. We recommend booking at least 48 hours in advance for weekend dining. Private events and bespoke menus available on request.",
    "res.cta":         "Reserve Now",

    // Footer
    "footer.tagline":  "Authentic Italian fine dining. Crafted with passion, served with grace.",
    "footer.nav.title":"Navigation",
    "footer.contact.title": "Contact",
    "footer.hours.title": "Opening Hours",
    "footer.hours.1":  "Tue – Fri: 13:00 – 23:00",
    "footer.hours.2":  "Sat – Sun: 12:00 – 24:00",
    "footer.hours.3":  "Monday: Closed",
    "footer.address":  "Calle Mayor 14, 03170 Rojales, Alicante, España",
    "footer.phone":    "+34 966 000 000",
    "footer.email":    "info@scalinis.es",
    "footer.copy":     "© 2025 Scalinis Restaurant. All rights reserved.",

    // Contact page
    "contact.hero.eyebrow": "We'd Love to Hear from You",
    "contact.hero.title": "Contact Us",
    "contact.hero.p":  "Whether it's a reservation query, a private event, or simply a word of praise — we are always delighted to hear from our guests.",
    "contact.info.title": "Get in Touch",
    "contact.info.p":  "Our team is available six days a week to assist with reservations, event planning, and any enquiries you may have.",
    "contact.label.name": "Full Name",
    "contact.label.email": "Email Address",
    "contact.label.phone": "Phone Number",
    "contact.label.date": "Preferred Date",
    "contact.label.guests": "Number of Guests",
    "contact.label.occasion": "Occasion",
    "contact.label.message": "Message",
    "contact.occ.select": "Select occasion",
    "contact.occ.dinner": "Dinner",
    "contact.occ.bday": "Birthday",
    "contact.occ.anniversary": "Anniversary",
    "contact.occ.event": "Private Event",
    "contact.occ.other": "Other",
    "contact.guests.1": "1 guest",
    "contact.guests.2": "2 guests",
    "contact.guests.3": "3–4 guests",
    "contact.guests.4": "5–6 guests",
    "contact.guests.5": "7+ guests",
    "contact.submit": "Send via Messenger",
    "contact.note":   "Clicking send will open Facebook Messenger to continue your enquiry.",
  },

  es: {
    "nav.menu":        "Menú",
    "nav.story":       "Nuestra Historia",
    "nav.gallery":     "Galería",
    "nav.contact":     "Contacto",
    "nav.reserve":     "Reservar Mesa",

    "hero.eyebrow":    "Est. Milán · 2019",
    "hero.subtitle":   "Cocina Italiana Auténtica · Alta Gastronomía",
    "hero.cta1":       "Ver el Menú",
    "hero.cta2":       "Reservar Mesa",

    "about.eyebrow":   "Nuestra Historia",
    "about.title":     "Una Pasión Nacida en Milán",
    "about.p1":        "Scalinis nació de un amor profundo por la tradición italiana. Cada receta rinde homenaje a las cocinas atemporales del norte de Italia, donde los ingredientes de calidad y la artesanía pausada siempre han sido la única regla.",
    "about.p2":        "Nuestro chef, formado en el corazón de Milán, aporta décadas de maestría a cada plato: desde pasta elaborada a mano hasta carnes estofadas con trufa y vino añejo.",

    "dishes.eyebrow":  "Los Clásicos",
    "dishes.title":    "Platos Estrella",
    "dishes.tag1":     "Elección del Chef",
    "dishes.tag2":     "Temporada",
    "dishes.tag3":     "Firma",
    "dishes.d1.name":  "Solomillo de Ternera",
    "dishes.d1.desc":  "Asado lento · Jus de mostaza · Aros crujientes",
    "dishes.d2.name":  "Rigatoni Amatriciana",
    "dishes.d2.desc":  "San Marzano · Guanciale · Pecorino",
    "dishes.d3.name":  "Tornados Rossini",
    "dishes.d3.desc":  "Foie gras · Trufa · Jus de Madeira",

    "gallery.eyebrow": "La Mesa",
    "gallery.title":   "Desde Nuestra Cocina",

    "philosophy.eyebrow": "Filosofía",
    "philosophy.title": "Artesanía sobre Conveniencia",
    "philosophy.p1":   "En Scalinis creemos que la alta gastronomía no es solo comida: es el ritual del encuentro, la ceremonia de la mesa compartida y el placer silencioso de sentirse verdaderamente atendido.",
    "philosophy.p2":   "Cada detalle, desde la cerámica seleccionada a mano hasta la atmósfera a la luz de las velas, está diseñado para detener el tiempo y profundizar el placer.",
    "philosophy.cta":  "Nuestra Historia",

    "exp.eyebrow":     "La Experiencia",
    "exp.title":       "Cada Noche, Extraordinaria",
    "exp.p":           "Ya sea para celebrar un hito o simplemente para escapar de lo ordinario, Scalinis ofrece un santuario de sabor, calidez y elegancia discreta.",
    "exp.cta":         "Reservar tu Noche",
    "exp.s1.num":      "12",
    "exp.s1.label":    "Años de Excelencia",
    "exp.s2.num":      "40+",
    "exp.s2.label":    "Platos de Temporada",
    "exp.s3.num":      "★ 4.9",
    "exp.s3.label":    "Valoración de Clientes",

    "res.eyebrow":     "Reservas",
    "res.title":       "Únete a Nosotros Esta Noche",
    "res.p":           "Las mesas se llenan rápido. Recomendamos reservar con al menos 48 horas de antelación para cenas de fin de semana. Eventos privados y menús a medida disponibles bajo petición.",
    "res.cta":         "Reservar Ahora",

    "footer.tagline":  "Alta cocina italiana auténtica. Creada con pasión, servida con gracia.",
    "footer.nav.title":"Navegación",
    "footer.contact.title": "Contacto",
    "footer.hours.title": "Horario",
    "footer.hours.1":  "Mar – Vie: 13:00 – 23:00",
    "footer.hours.2":  "Sáb – Dom: 12:00 – 24:00",
    "footer.hours.3":  "Lunes: Cerrado",
    "footer.address":  "Calle Mayor 14, 03170 Rojales, Alicante, España",
    "footer.phone":    "+34 966 000 000",
    "footer.email":    "info@scalinis.es",
    "footer.copy":     "© 2025 Scalinis Restaurante. Todos los derechos reservados.",

    "contact.hero.eyebrow": "Nos encanta escucharte",
    "contact.hero.title": "Contáctanos",
    "contact.hero.p":  "Tanto si es para una reserva, un evento privado o simplemente una palabra de elogio, siempre estamos encantados de escuchar a nuestros clientes.",
    "contact.info.title": "Ponte en Contacto",
    "contact.info.p":  "Nuestro equipo está disponible seis días a la semana para ayudarte con reservas, planificación de eventos y cualquier consulta.",
    "contact.label.name": "Nombre Completo",
    "contact.label.email": "Correo Electrónico",
    "contact.label.phone": "Teléfono",
    "contact.label.date": "Fecha Preferida",
    "contact.label.guests": "Número de Comensales",
    "contact.label.occasion": "Ocasión",
    "contact.label.message": "Mensaje",
    "contact.occ.select": "Selecciona la ocasión",
    "contact.occ.dinner": "Cena",
    "contact.occ.bday": "Cumpleaños",
    "contact.occ.anniversary": "Aniversario",
    "contact.occ.event": "Evento Privado",
    "contact.occ.other": "Otro",
    "contact.guests.1": "1 comensal",
    "contact.guests.2": "2 comensales",
    "contact.guests.3": "3–4 comensales",
    "contact.guests.4": "5–6 comensales",
    "contact.guests.5": "7+ comensales",
    "contact.submit": "Enviar por Messenger",
    "contact.note":   "Al hacer clic, se abrirá Facebook Messenger para continuar tu consulta.",
  }
};

/* ──────────────────────────────────────────────
   LANGUAGE MODULE
   ────────────────────────────────────────────── */
const LangModule = (() => {
  let currentLang = localStorage.getItem('scalinis-lang') || 'en';

  function t(key) {
    return (translations[currentLang] && translations[currentLang][key])
      ? translations[currentLang][key]
      : (translations['en'][key] || key);
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, t(key));
      } else {
        el.textContent = t(key);
      }
    });

    // Update lang toggle appearance
    document.querySelectorAll('.lang-en').forEach(el => {
      el.classList.toggle('lang-active', currentLang === 'en');
    });
    document.querySelectorAll('.lang-es').forEach(el => {
      el.classList.toggle('lang-active', currentLang === 'es');
    });

    document.documentElement.lang = currentLang;
  }

  function toggle() {
    currentLang = currentLang === 'en' ? 'es' : 'en';
    localStorage.setItem('scalinis-lang', currentLang);
    applyTranslations();
  }

  function init() {
    applyTranslations();
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  }

  return { init, t, current: () => currentLang };
})();

/* ──────────────────────────────────────────────
   NAVBAR MODULE
   ────────────────────────────────────────────── */
const NavModule = (() => {
  function init() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    // Scroll → solid
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger
    const burger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (burger && mobileMenu) {
      burger.addEventListener('click', () => {
        const open = mobileMenu.classList.toggle('open');
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          burger.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  }

  return { init };
})();

/* ──────────────────────────────────────────────
   CAROUSEL MODULE
   ────────────────────────────────────────────── */
const CarouselModule = (() => {
  function init(selector = '.carousel-track') {
    const tracks = document.querySelectorAll(selector);
    tracks.forEach(initSingle);
  }

  function initSingle(track) {
    const outer = track.parentElement;
    const slides = Array.from(track.children);
    const dotsContainer = outer.closest('.carousel-wrap')?.querySelector('.carousel-dots');
    const prevBtn = outer.closest('.carousel-wrap')?.querySelector('.carousel-prev');
    const nextBtn = outer.closest('.carousel-wrap')?.querySelector('.carousel-next');

    let current = 0;
    let startX = 0;
    let isDragging = false;

    function getSlidesPerView() {
      if (window.innerWidth < 540) return 1;
      if (window.innerWidth < 900) return 2;
      return 3;
    }

    function maxIndex() {
      return Math.max(0, slides.length - getSlidesPerView());
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex()));
      const slideWidth = slides[0].offsetWidth + 16; // gap
      track.style.transform = `translateX(-${current * slideWidth}px)`;
      updateDots();
    }

    function updateDots() {
      if (!dotsContainer) return;
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });
    }

    // Prev / Next buttons
    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));

    // Touch / drag
    outer.addEventListener('mousedown', e => { startX = e.clientX; isDragging = true; });
    outer.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });

    const endDrag = e => {
      if (!isDragging) return;
      const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
      isDragging = false;
    };

    outer.addEventListener('mouseup', endDrag);
    outer.addEventListener('touchend', endDrag);

    // Keyboard navigation
    outer.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    window.addEventListener('resize', () => goTo(current));

    buildDots();
  }

  return { init };
})();

/* ──────────────────────────────────────────────
   SCROLL REVEAL MODULE
   ────────────────────────────────────────────── */
const RevealModule = (() => {
  function init() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  }

  return { init };
})();

/* ──────────────────────────────────────────────
   HERO PARALLAX
   ────────────────────────────────────────────── */
const HeroModule = (() => {
  function init() {
    const bg = document.querySelector('.hero-bg');
    if (!bg) return;

    // Trigger zoom-in animation
    requestAnimationFrame(() => bg.classList.add('loaded'));

    // Subtle parallax on scroll
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      bg.style.transform = `scale(1) translateY(${y * 0.25}px)`;
    }, { passive: true });
  }

  return { init };
})();

/* ──────────────────────────────────────────────
   CONTACT FORM MODULE
   ────────────────────────────────────────────── */
const FormModule = (() => {
  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();

      const name    = form.querySelector('#name')?.value || '';
      const message = form.querySelector('#message')?.value || '';
      const date    = form.querySelector('#date')?.value || '';
      const guests  = form.querySelector('#guests')?.value || '';

      const text = encodeURIComponent(
        `Hello Scalinis! My name is ${name}. ` +
        (date    ? `I'd like to book for ${date} ` : '') +
        (guests  ? `for ${guests}. ` : '') +
        (message ? `Message: ${message}` : '')
      );

      // Replace YOUR_PAGE_NAME with the actual Facebook page name/ID
      window.open(`https://m.me/scalinisrestaurant?ref=${text}`, '_blank', 'noopener');
    });
  }

  return { init };
})();

/* ──────────────────────────────────────────────
   INIT — DOMContentLoaded
   ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  NavModule.init();
  LangModule.init();
  CarouselModule.init();
  RevealModule.init();
  HeroModule.init();
  FormModule.init();
});
