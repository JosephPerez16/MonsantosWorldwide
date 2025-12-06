const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const header = document.getElementById('site-header');
if (header) window.addEventListener('scroll', () => { header.classList.toggle('scrolled', window.scrollY > 40); });

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

window.addEventListener('load', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) heroContent.classList.add('animate');
});

const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.querySelector('.main-nav');
if(menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    menuToggle.classList.toggle('open');
  });
}
