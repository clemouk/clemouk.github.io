/**
 * SCALINIS RESTAURANT — Main JavaScript
 * -------------------------------------------------------
 * Features:
 *   1. Sticky nav with scroll-based glass effect
 *   2. Mobile hamburger menu overlay
 *   3. EN/ES language toggle (full i18n)
 *   4. Scroll-reveal animations (IntersectionObserver)
 *   5. Hero Ken Burns load animation
 *   6. [NEW] Parallax hero scroll effect
 *   7. [NEW] Animated gold line ornaments (IntersectionObserver)
 *   8. [NEW] Lightbox gallery with thumbnails, keyboard nav & captions
 *   9. Gallery carousel with touch/swipe support
 *  10. Contact form → Facebook Messenger deep-link
 */

'use strict';

/* ================================================================
   LANGUAGE DATA
   ================================================================ */
const LANG = {
  en: {
    nav_home:'Home', nav_menu:'Menu', nav_about:'About',
    nav_gallery:'Gallery', nav_contact:'Contact', nav_reserve:'Reserve',
    hero_eyebrow:'Est. Milano · Fine Italian Dining',
    hero_title:'Scalinis',
    hero_sub:'Where the soul of Italy meets the art of the table',
    hero_cta:'Explore the Menu',
    sig_label:'Signature Selection', sig_title:'From Our Kitchen',
    sig_body:'A curated tasting of dishes that define our culinary identity — crafted with seasonal produce and time-honoured Italian technique.',
    dish1_name:'Tornados Rossini',
    dish1_desc:'Fillet of beef, seared foie gras, black truffle jus & roasted garlic.',
    dish2_name:"Rigatoni all'Amatriciana",
    dish2_desc:'Slow-cooked guanciale, San Marzano tomato, Pecorino Romano, fresh basil.',
    dish3_name:'Grilled Sea Bass',
    dish3_desc:'Crispy skin fillet, tiger prawns, herb oil, pickled red onion.',
    about_label:'Our Philosophy', about_title:'La Dolce Vita',
    about_p1:'At Scalinis, we believe that dining is not merely sustenance — it is ceremony. Every dish is a love letter to the Italian regions that inspire us, prepared with ingredients sourced from farmers and producers who share our passion.',
    about_p2:'We invite you to slow down, share a glass of something beautiful, and let our kitchen tell its story. This is Italian hospitality as it was always meant to be.',
    gal_label:'Gallery', gal_title:'Moments at the Table',
    gal_body:"A visual journey through our kitchen's craft — each plate a canvas, each ingredient a brushstroke.",
    exp_label:'The Scalinis Experience', exp_title:'Three Pillars',
    exp1_title:'Craft',
    exp1_text:'Every recipe begins with the finest seasonal ingredients, sourced from trusted Italian producers and local artisan farmers who share our uncompromising commitment to quality.',
    exp2_title:'Ambiance',
    exp2_text:'Our dining room is a sanctuary of calm — softly lit, unhurried, designed to invite conversation and the pleasure of company in an atmosphere of understated elegance.',
    exp3_title:'Hospitality',
    exp3_text:'Service at Scalinis is warm, knowledgeable and discreet. Our team is here not to perform, but to care — ensuring every visit feels personal, memorable and entirely effortless.',
    res_label:'Reservations', res_title:'Join Us at the Table',
    res_body:'Whether a quiet dinner for two or a celebration with friends, we welcome you to experience the warmth of Scalinis.',
    res_cta:'Reserve a Table',
    menu_label:'A Taste of the Menu', menu_title:'Selected Dishes',
    menu_body:'A glimpse of what awaits — our full menu evolves with the seasons, guided always by what is finest and freshest.',
    footer_tagline:'Fine Italian dining — where every meal is a memory in the making.',
    footer_address:'Address', footer_nav:'Navigation', footer_hours:'Hours',
    footer_copy:'© 2025 Scalinis Restaurant. All rights reserved.',
    footer_privacy:'Privacy Policy',
    ct_hero_title:'Get in', ct_hero_span:'Touch',
    ct_info_title:"We'd love to hear from you",
    ct_info_body:'Have a question about our menu, wish to make a reservation, or plan a private event? Send us a message and our team will be in touch shortly.',
    ct_form_name:'Full Name', ct_form_email:'Email Address',
    ct_form_phone:'Phone Number', ct_form_subject:'Subject',
    ct_sub_res:'Reservation Enquiry', ct_sub_menu:'Menu Question',
    ct_sub_event:'Private Event', ct_sub_other:'Other',
    ct_form_msg:'Your Message', ct_form_send:'Send via Messenger',
    ct_messenger:'Messages are sent directly to our Facebook Messenger inbox for a faster response.',
    ct_success:"Thank you! Your message has been sent. We'll be in touch shortly.",
    ct_error:'Please fill in all required fields before sending.',
  },
  es: {
    nav_home:'Inicio', nav_menu:'Menú', nav_about:'Nosotros',
    nav_gallery:'Galería', nav_contact:'Contacto', nav_reserve:'Reservar',
    hero_eyebrow:'Est. Milán · Alta Cocina Italiana',
    hero_title:'Scalinis',
    hero_sub:'Donde el alma de Italia se encuentra con el arte de la mesa',
    hero_cta:'Explorar el Menú',
    sig_label:'Selección Especial', sig_title:'De Nuestra Cocina',
    sig_body:'Una selección curada de platos que definen nuestra identidad culinaria — elaborados con productos de temporada y técnica italiana de siempre.',
    dish1_name:'Tornados Rossini',
    dish1_desc:'Solomillo de ternera, foie gras salteado, jugo de trufa negra y ajo asado.',
    dish2_name:"Rigatoni all'Amatriciana",
    dish2_desc:'Guanciale estofado, tomate San Marzano, Pecorino Romano, albahaca fresca.',
    dish3_name:'Lubina a la Plancha',
    dish3_desc:'Filete crujiente, gambas tigre, aceite de hierbas, cebolla roja encurtida.',
    about_label:'Nuestra Filosofía', about_title:'La Dolce Vita',
    about_p1:'En Scalinis creemos que comer no es solo alimentarse — es un ritual. Cada plato es una carta de amor a las regiones italianas que nos inspiran, elaborado con ingredientes de productores que comparten nuestra pasión.',
    about_p2:'Te invitamos a detenerte, compartir una copa de algo especial y dejar que nuestra cocina cuente su historia. Esta es la hospitalidad italiana tal como siempre debió ser.',
    gal_label:'Galería', gal_title:'Momentos en la Mesa',
    gal_body:'Un viaje visual por el arte de nuestra cocina — cada plato un lienzo, cada ingrediente una pincelada.',
    exp_label:'La Experiencia Scalinis', exp_title:'Tres Pilares',
    exp1_title:'Artesanía',
    exp1_text:'Cada receta comienza con los mejores ingredientes de temporada, procedentes de productores italianos de confianza y agricultores artesanales locales comprometidos con la calidad.',
    exp2_title:'Ambiente',
    exp2_text:'Nuestro comedor es un santuario de calma — iluminado suavemente, sin prisas, diseñado para favorecer la conversación en una atmósfera de elegancia discreta.',
    exp3_title:'Hospitalidad',
    exp3_text:'El servicio en Scalinis es cálido, atento y discreto. Nuestro equipo está aquí para cuidarte — haciendo que cada visita se sienta personal, memorable y completamente especial.',
    res_label:'Reservas', res_title:'Únete a Nuestra Mesa',
    res_body:'Ya sea una cena íntima para dos o una celebración con amigos, te damos la bienvenida a la calidez de Scalinis.',
    res_cta:'Reservar una Mesa',
    menu_label:'Un Vistazo al Menú', menu_title:'Platos Seleccionados',
    menu_body:'Un adelanto de lo que te espera — nuestro menú completo evoluciona con las estaciones, guiado siempre por lo más fresco y selecto.',
    footer_tagline:'Alta cocina italiana — donde cada comida es un recuerdo por crear.',
    footer_address:'Dirección', footer_nav:'Navegación', footer_hours:'Horario',
    footer_copy:'© 2025 Scalinis Restaurant. Todos los derechos reservados.',
    footer_privacy:'Política de Privacidad',
    ct_hero_title:'Ponte en', ct_hero_span:'Contacto',
    ct_info_title:'Nos encantaría saber de ti',
    ct_info_body:'¿Tienes una pregunta sobre nuestro menú, deseas hacer una reserva o planear un evento privado? Envíanos un mensaje y nuestro equipo te responderá en breve.',
    ct_form_name:'Nombre Completo', ct_form_email:'Correo Electrónico',
    ct_form_phone:'Teléfono', ct_form_subject:'Asunto',
    ct_sub_res:'Consulta de Reserva', ct_sub_menu:'Pregunta sobre el Menú',
    ct_sub_event:'Evento Privado', ct_sub_other:'Otro',
    ct_form_msg:'Tu Mensaje', ct_form_send:'Enviar por Messenger',
    ct_messenger:'Los mensajes se envían directamente a nuestro Messenger de Facebook para una respuesta más rápida.',
    ct_success:'¡Gracias! Tu mensaje ha sido enviado. Nos pondremos en contacto pronto.',
    ct_error:'Por favor, completa todos los campos obligatorios antes de enviar.',
  }
};

/* ================================================================
   STATE
   ================================================================ */
let currentLang    = 'en';
let carouselIndex  = 0;
let totalSlides    = 0;
let slidesPerView  = 3;
let lightboxIndex  = 0;
let lightboxImages = [];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================================================================
   DOM READY
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initMobileMenu();
  initLangToggle();
  initScrollReveal();
  initHero();

  if (!prefersReducedMotion) initParallax();
  initGoldOrnaments();

  if (document.getElementById('carousel-track')) {
    initCarousel();
    initLightbox();
  }

  if (document.getElementById('contact-form')) initContactForm();

  const browserLang = navigator.language?.startsWith('es') ? 'es' : 'en';
  setLanguage(browserLang);
});

/* ================================================================
   1. STICKY NAV
   ================================================================ */
function initStickyNav() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ================================================================
   2. MOBILE MENU
   ================================================================ */
function initMobileMenu() {
  const hamburger  = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const toggle = () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggle);
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) toggle();
  });
}

/* ================================================================
   3. LANGUAGE TOGGLE
   ================================================================ */
function initLangToggle() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
}

function setLanguage(lang) {
  if (!LANG[lang]) return;
  currentLang = lang;

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang);
  });

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (LANG[lang][key] !== undefined) el.textContent = LANG[lang][key];
  });

  document.querySelectorAll('[data-i18n-opt]').forEach(el => {
    el.textContent = LANG[lang][el.dataset.i18nOpt] || el.textContent;
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (LANG[lang][key] !== undefined) el.setAttribute('placeholder', LANG[lang][key]);
  });

  document.documentElement.lang = lang;
  if (lightboxImages.length) updateLightboxCaption();
}

/* ================================================================
   4. SCROLL REVEAL
   ================================================================ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

/* ================================================================
   5. HERO LOAD ANIMATION
   ================================================================ */
function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  setTimeout(() => hero.classList.add('loaded'), 100);
}

/* ================================================================
   6. PARALLAX HERO  [NEW]
   The hero bg image is 130% tall. On scroll, translateY shifts it
   upward at 40% of the scroll rate — creating genuine depth.
   Uses rAF + passive scroll listener for 60fps performance.
   ================================================================ */
function initParallax() {
  const heroBg = document.querySelector('.hero-bg img');
  const hero   = document.getElementById('hero');
  if (!heroBg || !hero) return;

  let ticking = false;

  const applyParallax = () => {
    const scrolled = window.scrollY;
    // Stop computing once hero is fully off-screen
    if (scrolled > hero.offsetHeight * 1.2) { ticking = false; return; }
    // Move bg image upward at 40% of scroll speed
    heroBg.style.transform = 'scale(1) translateY(-' + (scrolled * 0.4) + 'px)';
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });
}

/* ================================================================
   7. ANIMATED GOLD ORNAMENTS  [NEW]
   IntersectionObserver triggers the CSS draw animation when each
   .gold-ornament enters the viewport. The CSS pseudo-elements then
   animate width from 0 → full, drawing the hairlines outward.
   ================================================================ */
function initGoldOrnaments() {
  const ornaments = document.querySelectorAll('.gold-ornament');
  if (!ornaments.length) return;

  if (prefersReducedMotion) {
    ornaments.forEach(el => el.classList.add('animate'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('animate'), 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  ornaments.forEach(el => observer.observe(el));
}

/* ================================================================
   8. CAROUSEL
   ================================================================ */
function initCarousel() {
  const track   = document.getElementById('carousel-track');
  const slides  = track?.querySelectorAll('.carousel-slide');
  const dots    = document.querySelectorAll('.carousel-dot');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');

  if (!track || !slides?.length) return;
  totalSlides = slides.length;

  const updateSPV = () => { slidesPerView = window.innerWidth <= 768 ? 1 : 3; };

  const getMax = () => Math.max(0, totalSlides - slidesPerView);

  const goTo = (index) => {
    const max = getMax();
    carouselIndex = Math.max(0, Math.min(index, max));
    const slideW = slides[0].getBoundingClientRect().width;
    track.style.transform = 'translateX(-' + (carouselIndex * (slideW + 24)) + 'px)';
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === carouselIndex);
      d.setAttribute('aria-selected', i === carouselIndex);
    });
    if (btnPrev) btnPrev.disabled = carouselIndex === 0;
    if (btnNext) btnNext.disabled = carouselIndex >= max;
  };

  btnPrev?.addEventListener('click', () => goTo(carouselIndex - 1));
  btnNext?.addEventListener('click', () => goTo(carouselIndex + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? carouselIndex + 1 : carouselIndex - 1);
  });

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { updateSPV(); goTo(0); }, 150);
  });

  updateSPV();
  goTo(0);
}

/* ================================================================
   9. LIGHTBOX  [NEW]
   Full-screen image viewer launched by clicking any carousel slide.
   Supports: keyboard arrows + Escape, backdrop click, swipe on touch,
   thumbnail strip, captions, accessible ARIA roles & focus management.
   ================================================================ */
function initLightbox() {
  const slides      = document.querySelectorAll('.carousel-slide[data-src]');
  const lightbox    = document.getElementById('lightbox');
  const btnClose    = document.getElementById('lightbox-close');
  const btnPrev     = document.getElementById('lightbox-prev');
  const btnNext     = document.getElementById('lightbox-next');
  const thumbsEl    = document.getElementById('lightbox-thumbs');

  if (!lightbox || !slides.length) return;

  // Build image data array
  lightboxImages = Array.from(slides).map(slide => ({
    src:     slide.dataset.src,
    alt:     slide.querySelector('img')?.alt || '',
    caption: slide.dataset.caption || ''
  }));

  // Build thumbnail strip
  if (thumbsEl) {
    thumbsEl.innerHTML = '';
    lightboxImages.forEach((img, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'lightbox-thumb';
      thumb.setAttribute('role', 'listitem');
      thumb.setAttribute('aria-label', 'View image ' + (i + 1));
      thumb.innerHTML = '<img src="' + img.src + '" alt="' + img.alt + '" loading="lazy" />';
      thumb.addEventListener('click', () => goToLightboxImage(i));
      thumbsEl.appendChild(thumb);
    });
  }

  // Wire carousel slides to open lightbox on click
  slides.forEach((slide, i) => {
    slide.setAttribute('tabindex', '0');
    slide.setAttribute('role', 'button');
    slide.setAttribute('aria-label', 'View ' + (lightboxImages[i].caption || 'image') + ' fullscreen');
    slide.addEventListener('click', () => openLightbox(i));
    slide.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  btnClose?.addEventListener('click', closeLightbox);
  btnPrev?.addEventListener('click',  () => goToLightboxImage(lightboxIndex - 1));
  btnNext?.addEventListener('click',  () => goToLightboxImage(lightboxIndex + 1));

  // Click backdrop to close
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  goToLightboxImage(lightboxIndex - 1);
    if (e.key === 'ArrowRight') goToLightboxImage(lightboxIndex + 1);
  });

  // Touch swipe inside lightbox
  let lbTx = 0;
  lightbox.addEventListener('touchstart', e => { lbTx = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const diff = lbTx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goToLightboxImage(diff > 0 ? lightboxIndex + 1 : lightboxIndex - 1);
  });
}

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox._prevFocus = document.activeElement;
  lightbox.setAttribute('aria-hidden', 'false');
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => requestAnimationFrame(() => lightbox.classList.add('visible')));

  goToLightboxImage(index, true);
  setTimeout(() => document.getElementById('lightbox-close')?.focus(), 50);
}

function goToLightboxImage(index, skipFade) {
  const total = lightboxImages.length;
  if (!total) return;

  lightboxIndex = ((index % total) + total) % total;

  const imgEl = document.getElementById('lightbox-img');
  if (imgEl) {
    if (!skipFade) imgEl.classList.remove('loaded');
    setTimeout(() => {
      imgEl.src   = lightboxImages[lightboxIndex].src;
      imgEl.alt   = lightboxImages[lightboxIndex].alt;
      imgEl.onload = () => imgEl.classList.add('loaded');
      if (imgEl.complete) imgEl.classList.add('loaded');
    }, skipFade ? 0 : 150);
  }

  updateLightboxCaption();

  const counterEl = document.getElementById('lightbox-counter');
  if (counterEl) counterEl.textContent = (lightboxIndex + 1) + ' / ' + total;

  document.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === lightboxIndex);
  });
}

function updateLightboxCaption() {
  const captionEl = document.getElementById('lightbox-caption');
  if (captionEl) captionEl.textContent = lightboxImages[lightboxIndex]?.caption || '';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('visible');
  setTimeout(() => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightbox._prevFocus?.focus();
  }, 350);
}

/* ================================================================
   10. CONTACT FORM → MESSENGER
   ================================================================ */
function initContactForm() {
  const form  = document.getElementById('contact-form');
  const msgEl = document.getElementById('form-message');
  const FB_PAGE_ID = 'scalinis.restaurant'; // ← Update with real Page ID

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name    = form.querySelector('#ct-name')?.value.trim();
    const email   = form.querySelector('#ct-email')?.value.trim();
    const message = form.querySelector('#ct-message')?.value.trim();
    const lang    = LANG[currentLang];

    if (!name || !email || !message) {
      showFormMessage(msgEl, 'error', lang.ct_error);
      return;
    }

    const subject = form.querySelector('#ct-subject')?.value || '';
    const phone   = form.querySelector('#ct-phone')?.value.trim() || '';
    const fullMsg = 'Hi Scalinis! [' + subject + ']\n\nName: ' + name +
                    '\nEmail: ' + email + (phone ? '\nPhone: ' + phone : '') +
                    '\n\n' + message;

    window.open('https://m.me/' + FB_PAGE_ID + '?text=' + encodeURIComponent(fullMsg),
                '_blank', 'noopener,noreferrer');

    showFormMessage(msgEl, 'success', lang.ct_success);
    form.reset();
  });
}

function showFormMessage(el, type, text) {
  if (!el) return;
  el.className   = 'form-message ' + type;
  el.textContent = text;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => { el.className = 'form-message'; }, 6000);
}
