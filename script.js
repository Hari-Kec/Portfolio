/*
  script.js — minimal vanilla JS for nav toggle, active section highlight,
  reveal-on-scroll animations, and contact form placeholder.
*/

document.addEventListener('DOMContentLoaded', function(){
  // Set year in footer
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // NAV toggle for small screens
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  navToggle && navToggle.addEventListener('click', ()=>{
    navLinks.classList.toggle('open');
  });

  // Smooth active link highlighting using IntersectionObserver
  const sections = document.querySelectorAll('main section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.45 };
  const sectionObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const id = entry.target.id;
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if(entry.isIntersecting){
        navItems.forEach(i=>i.classList.remove('active'));
        link && link.classList.add('active');
      }
    });
  }, observerOptions);
  sections.forEach(s=>sectionObserver.observe(s));

  // Reveal on scroll for elements with .reveal
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold:0.12});
  revealEls.forEach(el=>revealObserver.observe(el));

  // Contact form (placeholder) — prevents real submit and shows a friendly UI message
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if(btn){
        const old = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;
        setTimeout(()=>{
          btn.textContent = old;
          btn.disabled = false;
          alert('Thanks! This demo form is client-only. I will wire up backend/email next.');
          contactForm.reset();
        }, 900);
      }
    });
  }
  // Close nav menu when clicking a nav link (mobile)
  document.querySelectorAll('.nav-link').forEach(link=>{
    link.addEventListener('click', ()=>{
      navLinks.classList.remove('open');
    });
  });
});
// end DOMContentLoaded handler
