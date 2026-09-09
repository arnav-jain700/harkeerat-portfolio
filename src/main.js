import {
  loadData,
  saveData,
  getProfile,
  updateProfile,
  getStats,
  getJourney,
  addJourneyItem,
  deleteJourneyItem,
  getSkills,
  addSkill,
  deleteSkill,
  getProjects,
  addProject,
  deleteProject,
  getCertificates,
  addCertificate,
  deleteCertificate,
  getCodingPlatforms,
  addCodingPlatform,
  deleteCodingPlatform,
  getAggregatedCodingStats,
  getMessages,
  addMessage,
  toggleMessageRead,
  deleteMessage,
  getSettings,
  updateSettings,
  hashPassword,
  exportBackupJson,
  importBackupJson,
  resetToDefaults,
  backgroundCloudSync,
  pullFromCloud
} from './data.js';

import {
  chatWithPortfolioAI,
  draftEmailReply,
  suggestProjectDescription
} from './ai.js';

import {
  testSupabaseConnection,
  reinitSupabase
} from './supabase.js';

/* ==========================================================================
   State & Global Singletons
   ========================================================================== */

let currentTheme = localStorage.getItem('portfolio_theme') || 'dark';
let activeCategoryFilter = 'All';
let activeProjectFilter = 'All';
let chatHistory = [];
let lastMessageTimestamp = 0;
let carouselIndex = 0;
let carouselTimer = null;
let isAdminAuthenticated = false;

/* ==========================================================================
   DOM Ready Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initParticleCanvas();
  initSpotlightEngine();
  renderAllSections();
  initCarousel();
  initChatbot();
  initContactForm();
  initNavigation();
  initAdminConsole();
  checkUrlRouting();
  syncWithCloud();
});

/**
 * Non-blocking background sync with Supabase
 * Ensures changes added in the admin console are visible to visitors globally
 */
async function syncWithCloud() {
  try {
    const res = await pullFromCloud();
    if (res && res.success) {
      renderAllSections();
      renderStats();
      renderCarousel();
      renderCodingPlatforms(getCodingPlatforms());
      console.info('[CloudSync] Global state synchronized successfully.');
    }
  } catch (err) {
    console.warn('[CloudSync] Non-blocking startup sync note:', err.message);
  }
}

/* ==========================================================================
   Theme Management
   ========================================================================== */

function initTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon();

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('portfolio_theme', currentTheme);
      updateThemeIcon();
    });
  }
}

function updateThemeIcon() {
  const sunIcon = document.querySelector('.theme-icon-sun');
  const moonIcon = document.querySelector('.theme-icon-moon');
  if (!sunIcon || !moonIcon) return;

  if (currentTheme === 'dark') {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  } else {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }
}

/* ==========================================================================
   Toast Notifications
   ========================================================================== */

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? 'check' : type === 'error' ? 'close' : 'sparkles';
  toast.innerHTML = `
    <svg width="18" height="18" style="color: var(--accent-mint);"><use href="/icons.svg#icon-${icon}"></use></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ==========================================================================
   Bento Card Interactive Cursor Spotlight Engine
   ========================================================================== */

function initSpotlightEngine() {
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.bento-card');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   Engineering Coordinate Grid & Euclidean Particle Constellation Canvas
   ========================================================================== */

function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initNodes();
  });

  const mouse = { x: -1000, y: -1000, radius: 140 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  let nodes = [];
  const NODE_COUNT = Math.min(65, Math.floor((width * height) / 22000));
  const MAX_DISTANCE = 135;

  function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 1
      });
    }
  }

  initNodes();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const isLight = currentTheme === 'light';
    const nodeColor = isLight ? 'rgba(5, 150, 105, 0.4)' : 'rgba(0, 245, 160, 0.55)';
    const lineColor = isLight ? '5, 150, 105' : '0, 245, 160';

    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];

      // Update positions
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse repulsion (Euclidean distance)
      const dxMouse = p.x - mouse.x;
      const dyMouse = p.y - mouse.y;
      const distMouse = Math.hypot(dxMouse, dyMouse);
      if (distMouse < mouse.radius && distMouse > 0) {
        const force = (mouse.radius - distMouse) / mouse.radius;
        p.x += (dxMouse / distMouse) * force * 3;
        p.y += (dyMouse / distMouse) * force * 3;
      }

      // Draw node point
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();

      // Connect neighbor nodes with Euclidean distance formula
      for (let j = i + 1; j < nodes.length; j++) {
        const p2 = nodes[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < MAX_DISTANCE) {
          const alpha = (1 - dist / MAX_DISTANCE) * (isLight ? 0.15 : 0.22);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   Section Renderers
   ========================================================================== */

function renderAllSections() {
  const db = loadData();
  renderProfile(db.profile);
  renderStats();
  renderCarousel(db.projects);
  renderJourney(db.journey);
  renderSkills(db.skills);
  renderProjects(db.projects);
  renderCertificates(db.certificates);
  renderCodingPlatforms(db.codingPlatforms);
}

function renderProfile(profile) {
  if (!profile) return;
  const heroName = document.getElementById('hero-name');
  const heroRole = document.getElementById('hero-role');
  const heroBio = document.getElementById('hero-bio');
  const brandName = document.getElementById('brand-name');
  const drawerBrand = document.getElementById('drawer-brand-name');
  const footerName = document.getElementById('footer-name');
  const contactEmailLink = document.getElementById('contact-email-link');
  const contactLocation = document.getElementById('contact-location-text');
  const linkGithub = document.getElementById('link-github');
  const linkLinkedin = document.getElementById('link-linkedin');

  if (heroName) heroName.textContent = profile.name || 'Harkeerat Singh';
  if (heroRole) heroRole.textContent = profile.role || 'Senior Full-Stack & AI Systems Architect';
  if (heroBio) heroBio.textContent = profile.bio || '';
  if (brandName) brandName.textContent = `${(profile.name || 'Harkeerat').split(' ')[0]}.dev`;
  if (drawerBrand) drawerBrand.textContent = `${(profile.name || 'Harkeerat').split(' ')[0]}.dev`;
  if (footerName) footerName.textContent = profile.name || 'Harkeerat Singh';

  if (contactEmailLink) {
    contactEmailLink.href = `mailto:${profile.email || 'harkeerat.singh.dev@gmail.com'}`;
    contactEmailLink.textContent = profile.email || 'harkeerat.singh.dev@gmail.com';
  }
  if (contactLocation) contactLocation.textContent = profile.location || 'San Francisco, CA';

  if (linkGithub && profile.github) linkGithub.href = profile.github;
  if (linkLinkedin && profile.linkedin) linkLinkedin.href = profile.linkedin;
}

function renderStats() {
  const stats = getStats();
  animateCounter('stat-projects', stats.projectsCount);
  animateCounter('stat-skills', stats.skillsCount);
  animateCounter('stat-certs', stats.certificatesCount);
}

function animateCounter(elementId, targetVal) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let current = 0;
  const duration = 1200;
  const stepTime = 25;
  const totalSteps = duration / stepTime;
  const increment = targetVal / totalSteps;

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetVal) {
      el.textContent = targetVal;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, stepTime);
}

/* ==========================================================================
   Featured Projects Carousel (Zero Bleed-Through Opaque Solid Surfaces)
   ========================================================================== */

function renderCarousel(projects) {
  const track = document.getElementById('carousel-track');
  const dots = document.getElementById('carousel-dots');
  if (!track || !dots) return;

  const featuredList = (projects || []).filter(p => p.featured);
  const displayList = featuredList.length > 0 ? featuredList : (projects || []).slice(0, 3);

  track.innerHTML = '';
  dots.innerHTML = '';

  displayList.forEach((proj, idx) => {
    const card = document.createElement('div');
    card.className = `carousel-card ${idx === 0 ? 'active' : ''}`;
    card.dataset.index = idx;
    card.innerHTML = `
      <img src="${proj.image}" alt="${proj.title}" class="carousel-card-image" loading="lazy" />
      <div class="carousel-card-body">
        <div>
          <div class="carousel-card-header">
            <span class="card-category-badge">${proj.category}</span>
            <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--accent-mint);">FEATURED</span>
          </div>
          <h3 class="carousel-card-title">${proj.title}</h3>
          <p class="carousel-card-desc">${proj.description}</p>
        </div>
        <div>
          <div class="carousel-card-tags">
            ${(proj.tags || []).slice(0, 4).map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>
          <div style="display: flex; gap: 0.5rem;">
            ${proj.demoUrl ? `<a href="${proj.demoUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Live Demo</a>` : ''}
            ${proj.githubUrl ? `<a href="${proj.githubUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">GitHub</a>` : ''}
            <button class="btn btn-ghost btn-sm view-details-btn" data-id="${proj.id}">Specs</button>
          </div>
        </div>
      </div>
    `;
    track.appendChild(card);

    const dot = document.createElement('div');
    dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
    dot.dataset.index = idx;
    dot.addEventListener('click', () => switchCarouselSlide(idx));
    dots.appendChild(dot);
  });

  // Attach specs modal listener
  track.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pId = e.currentTarget.dataset.id;
      const proj = (projects || []).find(p => p.id === pId);
      if (proj) openProjectModal(proj);
    });
  });
}

function initCarousel() {
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const track = document.getElementById('carousel-track');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const cards = document.querySelectorAll('.carousel-card');
      if (!cards.length) return;
      carouselIndex = (carouselIndex - 1 + cards.length) % cards.length;
      switchCarouselSlide(carouselIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const cards = document.querySelectorAll('.carousel-card');
      if (!cards.length) return;
      carouselIndex = (carouselIndex + 1) % cards.length;
      switchCarouselSlide(carouselIndex);
    });
  }

  if (track) {
    track.addEventListener('mouseenter', () => clearInterval(carouselTimer));
    track.addEventListener('mouseleave', startCarouselAutoPlay);
  }

  startCarouselAutoPlay();
}

function startCarouselAutoPlay() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    const cards = document.querySelectorAll('.carousel-card');
    if (!cards.length) return;
    carouselIndex = (carouselIndex + 1) % cards.length;
    switchCarouselSlide(carouselIndex);
  }, 6500);
}

function switchCarouselSlide(idx) {
  carouselIndex = idx;
  const cards = document.querySelectorAll('.carousel-card');
  const dots = document.querySelectorAll('.carousel-dot');

  cards.forEach((c, i) => {
    if (i === idx) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });

  dots.forEach((d, i) => {
    if (i === idx) {
      d.classList.add('active');
    } else {
      d.classList.remove('active');
    }
  });
}

/* ==========================================================================
   Academic & Professional Journey (Timeline)
   ========================================================================== */

function renderJourney(journeyItems) {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  const existingItems = container.querySelectorAll('.timeline-item');
  existingItems.forEach(el => el.remove());

  (journeyItems || []).forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'timeline-item';
    const isExp = item.type === 'experience';

    itemEl.innerHTML = `
      <div class="timeline-node"></div>
      <div class="bento-card timeline-card">
        <div class="timeline-header">
          <div>
            <div class="timeline-role">${item.role}</div>
            <div class="timeline-company">${item.company}</div>
          </div>
          <div style="text-align: right;">
            <span class="timeline-badge ${isExp ? 'experience' : 'education'}">
              <svg width="12" height="12"><use href="/icons.svg#icon-${isExp ? 'briefcase' : 'education'}"></use></svg>
              ${isExp ? 'Experience' : 'Education'}
            </span>
            <div class="timeline-date">${item.date}</div>
          </div>
        </div>
        <p class="timeline-desc">${item.description}</p>
      </div>
    `;
    container.appendChild(itemEl);
  });
}

/* ==========================================================================
   Skills Toolkit & Animated Meters
   ========================================================================== */

function renderSkills(skills) {
  const grid = document.getElementById('skills-grid');
  const tabs = document.getElementById('skill-filter-tabs');
  if (!grid || !tabs) return;

  // Filter tabs click handling
  tabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.onclick = () => {
      tabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategoryFilter = btn.dataset.category;
      filterAndRenderSkills(skills);
    };
  });

  filterAndRenderSkills(skills);
}

function filterAndRenderSkills(allSkills) {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  const filtered = activeCategoryFilter === 'All'
    ? allSkills
    : allSkills.filter(s => s.category.toLowerCase() === activeCategoryFilter.toLowerCase());

  grid.innerHTML = '';

  filtered.forEach(skill => {
    const card = document.createElement('div');
    card.className = 'bento-card skill-card';
    card.innerHTML = `
      <div class="skill-card-top">
        <div class="skill-name-wrap">
          <svg width="18" height="18" style="color: var(--accent-mint);"><use href="/icons.svg#icon-${skill.icon || 'code'}"></use></svg>
          <span>${skill.name}</span>
        </div>
        <span class="skill-level-number">${skill.level}%</span>
      </div>
      <div class="skill-meter-bg">
        <div class="skill-meter-fill" data-level="${skill.level}"></div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Animate meters on scroll into view
  animateSkillMeters();
}

function animateSkillMeters() {
  const meters = document.querySelectorAll('.skill-meter-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const level = fill.dataset.level || '80';
        fill.style.width = `${level}%`;
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.2 });

  meters.forEach(m => observer.observe(m));
}

/* ==========================================================================
   Featured Projects Hub
   ========================================================================== */

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  const tabs = document.getElementById('project-filter-tabs');
  if (!grid || !tabs) return;

  tabs.querySelectorAll('.filter-tab-btn').forEach(btn => {
    btn.onclick = () => {
      tabs.querySelectorAll('.filter-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeProjectFilter = btn.dataset.tag;
      filterAndRenderProjects(projects);
    };
  });

  filterAndRenderProjects(projects);
}

function filterAndRenderProjects(allProjects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const filtered = activeProjectFilter === 'All'
    ? allProjects
    : allProjects.filter(p => p.category === activeProjectFilter || (p.tags || []).includes(activeProjectFilter));

  grid.innerHTML = '';

  filtered.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'bento-card project-card';
    card.innerHTML = `
      <div class="project-cover-wrap">
        <img src="${proj.image}" alt="${proj.title}" class="project-cover-img" loading="lazy" />
      </div>
      <div class="project-card-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span class="card-category-badge">${proj.category}</span>
          ${proj.featured ? `<span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--accent-mint);">Featured</span>` : ''}
        </div>
        <h3>${proj.title}</h3>
        <p>${proj.description}</p>
        <div class="carousel-card-tags">
          ${(proj.tags || []).map(t => `<span class="tech-tag">${t}</span>`).join('')}
        </div>
        <div class="project-card-actions">
          ${proj.demoUrl ? `<a href="${proj.demoUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Live Demo</a>` : ''}
          ${proj.githubUrl ? `<a href="${proj.githubUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">GitHub</a>` : ''}
          <button class="btn btn-ghost btn-sm open-details-btn" data-id="${proj.id}">Details</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.open-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pId = e.currentTarget.dataset.id;
      const proj = allProjects.find(p => p.id === pId);
      if (proj) openProjectModal(proj);
    });
  });
}

function openProjectModal(proj) {
  const modal = document.getElementById('project-modal');
  const title = document.getElementById('project-modal-title');
  const body = document.getElementById('project-modal-body');
  const closeBtn = document.getElementById('project-modal-close');

  if (!modal || !body) return;

  title.textContent = proj.title;
  body.innerHTML = `
    <img src="${proj.image}" alt="${proj.title}" style="width: 100%; max-height: 320px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.5rem;" />
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
      <span class="card-category-badge">${proj.category}</span>
      ${(proj.tags || []).map(t => `<span class="tech-tag">${t}</span>`).join('')}
    </div>
    <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Architecture Breakdown</h4>
    <p style="font-size: 0.98rem; line-height: 1.7; color: var(--text-secondary); margin-bottom: 1.5rem;">
      ${proj.longDescription || proj.description}
    </p>
    <div style="display: flex; gap: 0.75rem;">
      ${proj.demoUrl ? `<a href="${proj.demoUrl}" target="_blank" rel="noopener" class="btn btn-primary">Visit Live Platform</a>` : ''}
      ${proj.githubUrl ? `<a href="${proj.githubUrl}" target="_blank" rel="noopener" class="btn btn-secondary">Inspect Source Code</a>` : ''}
    </div>
  `;

  modal.classList.add('open');
  closeBtn.onclick = () => modal.classList.remove('open');
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('open');
  };
}

/* ==========================================================================
   Certificates & Lightbox
   ========================================================================== */

function renderCertificates(certs) {
  const grid = document.getElementById('certs-grid');
  if (!grid) return;
  grid.innerHTML = '';

  (certs || []).forEach(cert => {
    const card = document.createElement('div');
    card.className = 'bento-card cert-card';
    card.innerHTML = `
      <img src="${cert.image}" alt="${cert.title}" class="cert-img-thumb" loading="lazy" />
      <div class="cert-title">${cert.title}</div>
      <div class="cert-meta">${cert.issuer} • ${cert.year}</div>
      <div class="cert-skills">${cert.skills}</div>
      <div style="margin-top: auto; display: flex; gap: 0.5rem;">
        ${cert.verifyUrl ? `<a href="${cert.verifyUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="flex: 1;">Verify Credential</a>` : ''}
        <button class="btn btn-ghost btn-sm cert-preview-btn">Preview</button>
      </div>
    `;

    card.querySelector('.cert-img-thumb').onclick = () => openLightbox(cert);
    card.querySelector('.cert-preview-btn').onclick = () => openLightbox(cert);

    grid.appendChild(card);
  });
}

function openLightbox(cert) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const desc = document.getElementById('lightbox-desc');
  const closeBtn = document.getElementById('lightbox-close');

  if (!modal) return;
  img.src = cert.image;
  title.textContent = cert.title;
  desc.textContent = `${cert.issuer} (${cert.year}) — ${cert.skills}`;

  modal.classList.add('open');
  closeBtn.onclick = () => modal.classList.remove('open');
  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('open');
  };
}

/* ==========================================================================
   Coding Profiles & Competitive Programming Hub
   ========================================================================== */

function renderCodingPlatforms(platforms) {
  const telemetryBar = document.getElementById('coding-telemetry-bar');
  const grid = document.getElementById('coding-platforms-grid');
  if (!grid) return;

  const stats = getAggregatedCodingStats();

  if (telemetryBar) {
    telemetryBar.innerHTML = `
      <div class="telemetry-stat-card bento-card">
        <div class="telemetry-num">${stats.totalSolved.toLocaleString()}+</div>
        <div class="telemetry-label">Total Problems Solved</div>
      </div>
      <div class="telemetry-stat-card bento-card">
        <div class="telemetry-num">${stats.maxRating}</div>
        <div class="telemetry-label">Peak Contest Rating</div>
      </div>
      <div class="telemetry-stat-card bento-card">
        <div class="telemetry-num">${stats.maxStreak}+ Days</div>
        <div class="telemetry-label">Active Coding Streak</div>
      </div>
      <div class="telemetry-stat-card bento-card">
        <div class="telemetry-num">${stats.totalContests}</div>
        <div class="telemetry-label">Global Contests Attended</div>
      </div>
    `;
  }

  grid.innerHTML = '';

  (platforms || []).forEach(p => {
    const card = document.createElement('div');
    card.className = 'bento-card platform-card';

    const total = Number(p.totalSolved) || 1;
    const easy = Number(p.easySolved) || 0;
    const medium = Number(p.mediumSolved) || 0;
    const hard = Number(p.hardSolved) || 0;

    const easyPct = Math.round((easy / total) * 100);
    const medPct = Math.round((medium / total) * 100);
    const hardPct = Math.max(0, 100 - easyPct - medPct);

    // Determine icon
    const iconId = p.icon ? `icon-${p.icon}` : 'icon-code';

    card.innerHTML = `
      <div class="platform-card-header">
        <div class="platform-brand-wrap">
          <div class="platform-icon-box">
            <svg width="22" height="22"><use href="/icons.svg#${iconId}"></use></svg>
          </div>
          <div class="platform-title-group">
            <h3>${p.platform}</h3>
            <span class="platform-handle">@${p.handle}</span>
          </div>
        </div>
        ${p.profileUrl && p.profileUrl !== '#' ? `
          <a href="${p.profileUrl}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" title="Open Profile" aria-label="Open ${p.platform} Profile">
            <svg width="16" height="16"><use href="/icons.svg#icon-external-link"></use></svg>
          </a>
        ` : ''}
      </div>

      <div class="platform-rating-section">
        <div class="rating-primary">
          <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-family: var(--font-mono);">Contest Rating</span>
          <div class="rating-value">${p.rating}</div>
          ${p.maxRating ? `<div class="rating-max-label">Peak: ${p.maxRating}</div>` : ''}
        </div>
        <div class="platform-badge-pill" style="color: ${p.badgeColor || 'var(--accent-mint)'}; border-color: ${p.badgeColor || 'var(--accent-mint)'}; background: rgba(0, 245, 160, 0.06);">
          ${p.badge}
        </div>
      </div>

      ${p.ranking ? `
        <div class="platform-rank-text">
          <svg width="14" height="14" style="color: var(--accent-mint);"><use href="/icons.svg#icon-target"></use></svg>
          <span>${p.ranking}</span>
        </div>
      ` : ''}

      <div class="solved-breakdown-box">
        <div class="solved-header-row">
          <span style="font-size: 0.85rem; color: var(--text-secondary);">Problems Solved</span>
          <span class="solved-total-count">${p.totalSolved}</span>
        </div>

        <div class="difficulty-bar-wrap" title="Easy: ${easy} | Medium: ${medium} | Hard: ${hard}">
          <div class="diff-segment easy" style="width: ${easyPct}%;"></div>
          <div class="diff-segment medium" style="width: ${medPct}%;"></div>
          <div class="diff-segment hard" style="width: ${hardPct}%;"></div>
        </div>

        <div class="difficulty-legend-row">
          <div class="legend-item">
            <span class="legend-dot" style="background: var(--accent-emerald);"></span>
            <span>Easy: ${easy}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: var(--accent-amber);"></span>
            <span>Med: ${medium}</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: var(--accent-rose);"></span>
            <span>Hard: ${hard}</span>
          </div>
        </div>
      </div>

      <div class="platform-footer-meta">
        <span>Contests: <strong>${p.contestsCount || 0}</strong></span>
        <span>Streak: <strong>${p.streakDays || 0}d</strong></span>
      </div>
      ${p.profileUrl && p.profileUrl !== '#' ? `
        <a href="${p.profileUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="margin-top: 1rem; width: 100%;">
          <span>View Live Profile</span>
          <svg width="14" height="14"><use href="/icons.svg#icon-external-link"></use></svg>
        </a>
      ` : ''}
    `;

    grid.appendChild(card);
  });
}

/* ==========================================================================
   Contact Form & Anti-Spam Dispatcher
   ========================================================================== */

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Anti-spam: enforce 25s throttle
    const now = Date.now();
    if (now - lastMessageTimestamp < 25000) {
      showToast('Anti-spam rate limit: Please wait 25 seconds between messages.', 'error');
      return;
    }

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    const newMsg = addMessage({ name, email, subject, message });
    lastMessageTimestamp = now;

    form.reset();
    showToast('Message dispatched! Thank you for reaching out.', 'success');

    // Update admin messages pane if rendered
    renderAdminMessages();
  });
}

/* ==========================================================================
   Floating AI Representative Chatbot
   ========================================================================== */

function initChatbot() {
  const launcher = document.getElementById('chatbot-launcher');
  const drawer = document.getElementById('chatbot-drawer');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-user-input');
  const messagesContainer = document.getElementById('chat-messages-container');

  if (!launcher || !drawer) return;

  launcher.onclick = () => {
    drawer.classList.toggle('open');
    if (drawer.classList.contains('open')) input?.focus();
  };

  closeBtn.onclick = () => drawer.classList.remove('open');

  // Suggestions pills click
  drawer.querySelectorAll('.chat-pill').forEach(pill => {
    pill.onclick = () => {
      const prompt = pill.dataset.prompt;
      if (prompt) sendMessageToChatbot(prompt);
    };
  });

  if (form && input) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      sendMessageToChatbot(msg);
    };
  }

  async function sendMessageToChatbot(text) {
    appendChatBubble('user', text);

    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble assistant typing-indicator';
    typingBubble.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const result = await chatWithPortfolioAI(text, chatHistory);
      typingBubble.remove();
      appendChatBubble('assistant', result.reply);
      chatHistory.push({ role: 'user', content: text });
      chatHistory.push({ role: 'assistant', content: result.reply });
    } catch (err) {
      typingBubble.remove();
      appendChatBubble('assistant', 'An error occurred connecting to the AI inference engine. Please try again.');
    }
  }

  function appendChatBubble(role, content) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = formatMarkdownText(content);
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

function formatMarkdownText(text) {
  // Lightweight markdown formatter for chat bubbles
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br />');
}

/* ==========================================================================
   Hidden Admin Console Management System (?admin)
   ========================================================================== */

function initAdminConsole() {
  const authModal = document.getElementById('admin-auth-modal');
  const authForm = document.getElementById('admin-auth-form');
  const authClose = document.getElementById('admin-auth-close');
  const passInput = document.getElementById('admin-passcode-input');

  const dashboardModal = document.getElementById('admin-dashboard-modal');
  const dashClose = document.getElementById('admin-dashboard-close');

  if (authClose) authClose.onclick = () => authModal.classList.remove('open');
  if (dashClose) dashClose.onclick = () => dashboardModal.classList.remove('open');

  if (authForm) {
    authForm.onsubmit = async (e) => {
      e.preventDefault();
      const entered = passInput.value;
      const hashed = await hashPassword(entered);
      const settings = getSettings();

      if (hashed === settings.adminPasswordHash) {
        isAdminAuthenticated = true;
        authModal.classList.remove('open');
        passInput.value = '';
        openAdminDashboard();
        showToast('Admin Console unlocked.', 'success');
      } else {
        showToast('Incorrect passcode. Validation failed.', 'error');
      }
    };
  }

  // Admin Tab Navigation
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const paneId = btn.dataset.pane;
      document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));
      document.getElementById(paneId)?.classList.add('active');
    };
  });

  initAdminPaneA(); // Skills
  initAdminPaneB(); // Projects
  initAdminPaneC(); // Messages
  initAdminPaneD(); // Settings
  initAdminPaneE(); // Cloud & Backup
  initAdminPaneF(); // Timeline
  initAdminPaneG(); // Certificates
  initAdminCodingPlatforms(); // Coding Platforms
}

export function openAdminDashboard() {
  const modal = document.getElementById('admin-dashboard-modal');
  if (!modal) return;
  modal.classList.add('open');

  renderAdminSkills();
  renderAdminProjects();
  renderAdminMessages();
  populateAdminSettings();
  renderAdminTimeline();
  renderAdminCertificates();
  renderAdminCodingPlatforms();
}

/* Pane A: Skills CRUD */
function initAdminPaneA() {
  const form = document.getElementById('admin-add-skill-form');
  if (!form) return;
  form.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('skill-input-name').value.trim();
    const category = document.getElementById('skill-input-category').value;
    const level = Number(document.getElementById('skill-input-level').value);

    addSkill({ name, category, level, icon: 'code' });
    form.reset();
    renderAdminSkills();
    renderSkills(getSkills());
    renderStats();
    showToast('Skill added.', 'success');
  };
}

function renderAdminSkills() {
  const list = document.getElementById('admin-skills-list');
  if (!list) return;
  const skills = getSkills();
  list.innerHTML = '';

  skills.forEach(s => {
    const item = document.createElement('div');
    item.style = 'display: flex; justify-content: space-between; align-items: center; background: var(--surface-0); padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);';
    item.innerHTML = `
      <div>
        <strong>${s.name}</strong> (${s.category}) — <span style="color: var(--accent-mint); font-family: var(--font-mono);">${s.level}%</span>
      </div>
      <button class="btn btn-ghost btn-sm" style="color: var(--accent-rose); padding: 0.2rem 0.5rem;" data-id="${s.id}">Delete</button>
    `;
    item.querySelector('button').onclick = () => {
      deleteSkill(s.id);
      renderAdminSkills();
      renderSkills(getSkills());
      renderStats();
      showToast('Skill removed.', 'info');
    };
    list.appendChild(item);
  });
}

/* Pane B: Projects CRUD (with Device File Upload) */
function initAdminPaneB() {
  const form = document.getElementById('admin-add-project-form');
  const fileInput = document.getElementById('proj-file-upload');
  const preview = document.getElementById('proj-thumb-preview');
  const imageInput = document.getElementById('proj-input-image');
  const aiSuggestBtn = document.getElementById('proj-ai-suggest-btn');

  if (fileInput) {
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imageInput.value = e.target.result;
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    };
  }

  if (aiSuggestBtn) {
    aiSuggestBtn.onclick = async () => {
      const title = document.getElementById('proj-input-title').value.trim();
      const tags = document.getElementById('proj-input-tags').value.trim();
      const category = document.getElementById('proj-input-category').value;

      if (!title) {
        showToast('Please specify a Project Title first.', 'error');
        return;
      }

      aiSuggestBtn.disabled = true;
      aiSuggestBtn.textContent = 'Generating...';
      const desc = await suggestProjectDescription(title, tags, category);
      document.getElementById('proj-input-desc').value = desc;
      aiSuggestBtn.disabled = false;
      aiSuggestBtn.innerHTML = '<svg width="14" height="14"><use href="/icons.svg#icon-sparkles"></use></svg> AI Suggest Description';
    };
  }

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const title = document.getElementById('proj-input-title').value.trim();
      const category = document.getElementById('proj-input-category').value;
      const tags = document.getElementById('proj-input-tags').value;
      const description = document.getElementById('proj-input-desc').value;
      const image = imageInput.value.trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop';
      const demoUrl = document.getElementById('proj-input-demo').value.trim();
      const githubUrl = document.getElementById('proj-input-github').value.trim();
      const featured = document.getElementById('proj-input-featured').checked;

      addProject({ title, category, tags, description, image, demoUrl, githubUrl, featured });
      form.reset();
      preview.style.display = 'none';
      renderAdminProjects();
      renderProjects(getProjects());
      renderCarousel(getProjects());
      renderStats();
      showToast('Project published.', 'success');
    };
  }
}

function renderAdminProjects() {
  const list = document.getElementById('admin-projects-list');
  if (!list) return;
  const projects = getProjects();
  list.innerHTML = '';

  projects.forEach(p => {
    const item = document.createElement('div');
    item.style = 'display: flex; justify-content: space-between; align-items: center; background: var(--surface-0); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);';
    item.innerHTML = `
      <div>
        <strong>${p.title}</strong> (${p.category}) ${p.featured ? '<span style="color: var(--accent-mint); font-size: 0.75rem;">[FEATURED]</span>' : ''}
        <div style="font-size: 0.8rem; color: var(--text-muted);">${(p.tags || []).join(', ')}</div>
      </div>
      <button class="btn btn-ghost btn-sm" style="color: var(--accent-rose);" data-id="${p.id}">Delete</button>
    `;
    item.querySelector('button').onclick = () => {
      deleteProject(p.id);
      renderAdminProjects();
      renderProjects(getProjects());
      renderCarousel(getProjects());
      renderStats();
      showToast('Project removed.', 'info');
    };
    list.appendChild(item);
  });
}

/* Pane C: Messages Inbox & AI Reply Drafter */
function initAdminPaneC() {
  // Handled in renderAdminMessages
}

function renderAdminMessages() {
  const container = document.getElementById('admin-messages-list');
  if (!container) return;
  const messages = getMessages();
  container.innerHTML = '';

  if (messages.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted);">No inbound messages yet.</p>';
    return;
  }

  messages.forEach(m => {
    const card = document.createElement('div');
    card.style = `background: var(--surface-0); border: 1px solid ${m.read ? 'var(--border-subtle)' : 'var(--border-accent)'}; border-radius: var(--radius-md); padding: 1rem;`;
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
        <div>
          <strong>${m.name}</strong> (<a href="mailto:${m.email}" style="color: var(--accent-mint);">${m.email}</a>)
          <div style="font-size: 0.8rem; color: var(--text-muted);">${m.date}</div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-ghost btn-sm toggle-read-btn">${m.read ? 'Mark Unread' : 'Mark Read'}</button>
          <button class="btn btn-ghost btn-sm delete-msg-btn" style="color: var(--accent-rose);">Delete</button>
        </div>
      </div>
      <div style="font-weight: 600; margin-bottom: 0.25rem;">${m.subject}</div>
      <p style="font-size: 0.92rem; line-height: 1.5; color: var(--text-secondary); margin-bottom: 0.75rem;">${m.message}</p>
      <button class="btn btn-secondary btn-sm draft-reply-btn">
        <svg width="14" height="14"><use href="/icons.svg#icon-sparkles"></use></svg>
        <span>Draft AI Reply</span>
      </button>
      <div class="reply-container" style="display: none; margin-top: 0.75rem; background: var(--surface-1); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);"></div>
    `;

    card.querySelector('.toggle-read-btn').onclick = () => {
      toggleMessageRead(m.id);
      renderAdminMessages();
    };

    card.querySelector('.delete-msg-btn').onclick = () => {
      deleteMessage(m.id);
      renderAdminMessages();
      showToast('Message deleted.', 'info');
    };

    const draftBtn = card.querySelector('.draft-reply-btn');
    const replyContainer = card.querySelector('.reply-container');

    draftBtn.onclick = async () => {
      draftBtn.disabled = true;
      draftBtn.textContent = 'Drafting email...';
      const draft = await draftEmailReply(m);
      replyContainer.style.display = 'block';
      replyContainer.innerHTML = `
        <h5 style="font-size: 0.85rem; color: var(--accent-mint); margin-bottom: 0.4rem;">Drafted Response:</h5>
        <textarea class="form-textarea" style="height: 100px; font-size: 0.85rem; margin-bottom: 0.5rem;">${draft}</textarea>
        <div style="display: flex; gap: 0.5rem;">
          <a href="mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}&body=${encodeURIComponent(draft)}" class="btn btn-primary btn-sm">
            Open in Mail Client
          </a>
          <button class="btn btn-ghost btn-sm copy-draft-btn">Copy Text</button>
        </div>
      `;
      replyContainer.querySelector('.copy-draft-btn').onclick = () => {
        navigator.clipboard.writeText(draft);
        showToast('Email draft copied to clipboard.', 'success');
      };
      draftBtn.disabled = false;
      draftBtn.innerHTML = '<svg width="14" height="14"><use href="/icons.svg#icon-sparkles"></use></svg> Draft AI Reply';
    };

    container.appendChild(card);
  });
}

/* Pane D: Settings & AI Key */
function initAdminPaneD() {
  const form = document.getElementById('admin-settings-form');
  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('setting-name').value.trim();
    const role = document.getElementById('setting-role').value.trim();
    const email = document.getElementById('setting-email').value.trim();
    const location = document.getElementById('setting-location').value.trim();
    const bio = document.getElementById('setting-bio').value.trim();
    const github = document.getElementById('setting-github').value.trim();
    const linkedin = document.getElementById('setting-linkedin').value.trim();
    const groqApiKey = document.getElementById('setting-groq-key').value.trim();
    const newPass = document.getElementById('setting-new-passcode').value;

    updateProfile({ name, role, email, location, bio, github, linkedin });

    const newSettings = { groqApiKey };
    if (newPass && newPass.trim().length >= 4) {
      newSettings.adminPasswordHash = await hashPassword(newPass.trim());
      showToast('Admin security passcode updated.', 'info');
    }

    updateSettings(newSettings);
    renderProfile(getProfile());
    showToast('Settings saved successfully.', 'success');
  };
}

function populateAdminSettings() {
  const profile = getProfile();
  const settings = getSettings();

  const el = id => document.getElementById(id);
  if (el('setting-name')) el('setting-name').value = profile.name || '';
  if (el('setting-role')) el('setting-role').value = profile.role || '';
  if (el('setting-email')) el('setting-email').value = profile.email || '';
  if (el('setting-location')) el('setting-location').value = profile.location || '';
  if (el('setting-bio')) el('setting-bio').value = profile.bio || '';
  if (el('setting-github')) el('setting-github').value = profile.github || '';
  if (el('setting-linkedin')) el('setting-linkedin').value = profile.linkedin || '';
  if (el('setting-groq-key')) el('setting-groq-key').value = settings.groqApiKey || '';
}

/* Pane E: Cloud Sync & Backup */
function initAdminPaneE() {
  const saveCredsBtn = document.getElementById('sync-save-creds-btn');
  const testBtn = document.getElementById('sync-test-btn');
  const pushBtn = document.getElementById('sync-cloud-push-btn');
  const copyBackupBtn = document.getElementById('backup-copy-btn');
  const downloadBackupBtn = document.getElementById('backup-download-btn');
  const restoreBtn = document.getElementById('backup-restore-btn');
  const resetBtn = document.getElementById('reset-defaults-btn');
  const statusMsg = document.getElementById('sync-status-msg');

  // Load existing credentials if any
  const settings = getSettings();
  if (settings.supabaseUrl) document.getElementById('sync-supabase-url').value = settings.supabaseUrl;
  if (settings.supabaseKey) document.getElementById('sync-supabase-key').value = settings.supabaseKey;

  if (saveCredsBtn) {
    saveCredsBtn.onclick = () => {
      const url = document.getElementById('sync-supabase-url').value.trim();
      const key = document.getElementById('sync-supabase-key').value.trim();
      updateSettings({ supabaseUrl: url, supabaseKey: key });
      reinitSupabase(url, key);
      showToast('Supabase configuration saved.', 'success');
    };
  }

  if (testBtn) {
    testBtn.onclick = async () => {
      testBtn.disabled = true;
      testBtn.textContent = 'Testing...';
      const res = await testSupabaseConnection();
      statusMsg.style.color = res.ok ? 'var(--accent-mint)' : 'var(--accent-rose)';
      statusMsg.textContent = res.message;
      testBtn.disabled = false;
      testBtn.textContent = 'Test Connection';
    };
  }

  if (pushBtn) {
    pushBtn.onclick = async () => {
      pushBtn.disabled = true;
      pushBtn.textContent = 'Pushing to cloud...';
      const db = loadData();
      const success = await backgroundCloudSync(db);
      if (success) {
        showToast('Local database synced to Supabase.', 'success');
        statusMsg.style.color = 'var(--accent-mint)';
        statusMsg.textContent = `Cloud snapshot synced at ${new Date().toLocaleTimeString()}`;
      } else {
        showToast('Cloud sync failed. Check Supabase connection or table permissions.', 'error');
      }
      pushBtn.disabled = false;
      pushBtn.textContent = 'Sync Local Data to Cloud Now';
    };
  }

  if (copyBackupBtn) {
    copyBackupBtn.onclick = () => {
      const json = exportBackupJson();
      navigator.clipboard.writeText(json);
      showToast('Database JSON copied to clipboard.', 'success');
    };
  }

  if (downloadBackupBtn) {
    downloadBackupBtn.onclick = () => {
      const json = exportBackupJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().substring(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup JSON file downloaded.', 'success');
    };
  }

  if (restoreBtn) {
    restoreBtn.onclick = () => {
      const text = document.getElementById('backup-restore-textarea').value.trim();
      if (!text) {
        showToast('Please paste a JSON backup to restore.', 'error');
        return;
      }
      const res = importBackupJson(text);
      if (res.success) {
        showToast('Database restored from backup.', 'success');
        renderAllSections();
        document.getElementById('backup-restore-textarea').value = '';
      } else {
        showToast(`Restore failed: ${res.error}`, 'error');
      }
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm('Are you sure you want to clear local cache and restore original portfolio seed data?')) {
        resetToDefaults();
        renderAllSections();
        showToast('Portfolio reset to default seed data.', 'info');
      }
    };
  }
}

/* Pane F: Timeline CRUD */
function initAdminPaneF() {
  const form = document.getElementById('admin-add-timeline-form');
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const role = document.getElementById('timeline-input-role').value.trim();
    const type = document.getElementById('timeline-input-type').value;
    const company = document.getElementById('timeline-input-company').value.trim();
    const date = document.getElementById('timeline-input-date').value.trim();
    const description = document.getElementById('timeline-input-desc').value.trim();

    addJourneyItem({ role, type, company, date, description });
    form.reset();
    renderAdminTimeline();
    renderJourney(getJourney());
    showToast('Milestone added to timeline.', 'success');
  };
}

function renderAdminTimeline() {
  const list = document.getElementById('admin-timeline-list');
  if (!list) return;
  const items = getJourney();
  list.innerHTML = '';

  items.forEach(j => {
    const item = document.createElement('div');
    item.style = 'display: flex; justify-content: space-between; align-items: center; background: var(--surface-0); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);';
    item.innerHTML = `
      <div>
        <strong>${j.role}</strong> @ ${j.company} (${j.date}) [${j.type}]
      </div>
      <button class="btn btn-ghost btn-sm" style="color: var(--accent-rose);" data-id="${j.id}">Delete</button>
    `;
    item.querySelector('button').onclick = () => {
      deleteJourneyItem(j.id);
      renderAdminTimeline();
      renderJourney(getJourney());
      showToast('Milestone removed.', 'info');
    };
    list.appendChild(item);
  });
}

/* Pane G: Certificates CRUD */
function initAdminPaneG() {
  const form = document.getElementById('admin-add-cert-form');
  const fileInput = document.getElementById('cert-file-upload');
  const preview = document.getElementById('cert-thumb-preview');
  const imageInput = document.getElementById('cert-input-image');

  if (fileInput) {
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imageInput.value = e.target.result;
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    };
  }

  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const title = document.getElementById('cert-input-title').value.trim();
      const year = document.getElementById('cert-input-year').value.trim();
      const issuer = document.getElementById('cert-input-issuer').value.trim();
      const verifyUrl = document.getElementById('cert-input-url').value.trim();
      const skills = document.getElementById('cert-input-skills').value.trim();
      const image = imageInput.value.trim() || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop';

      addCertificate({ title, year, issuer, verifyUrl, skills, image });
      form.reset();
      preview.style.display = 'none';
      renderAdminCertificates();
      renderCertificates(getCertificates());
      renderStats();
      showToast('Certificate added.', 'success');
    };
  }
}

function renderAdminCertificates() {
  const list = document.getElementById('admin-certs-list');
  if (!list) return;
  const certs = getCertificates();
  list.innerHTML = '';

  certs.forEach(c => {
    const item = document.createElement('div');
    item.style = 'display: flex; justify-content: space-between; align-items: center; background: var(--surface-0); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);';
    item.innerHTML = `
      <div>
        <strong>${c.title}</strong> (${c.issuer}, ${c.year})
      </div>
      <button class="btn btn-ghost btn-sm" style="color: var(--accent-rose);" data-id="${c.id}">Delete</button>
    `;
    item.querySelector('button').onclick = () => {
      deleteCertificate(c.id);
      renderAdminCertificates();
      renderCertificates(getCertificates());
      renderStats();
      showToast('Certificate removed.', 'info');
    };
    list.appendChild(item);
  });
}

/* Pane H: Coding Platforms CRUD */
function initAdminCodingPlatforms() {
  const form = document.getElementById('admin-add-platform-form');
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const platform = document.getElementById('platform-input-name').value;
    const handle = document.getElementById('platform-input-handle').value.trim();
    const profileUrl = document.getElementById('platform-input-url').value.trim();
    const rating = Number(document.getElementById('platform-input-rating').value);
    const maxRating = Number(document.getElementById('platform-input-max-rating').value) || rating;
    const badge = document.getElementById('platform-input-badge').value.trim();
    const totalSolved = Number(document.getElementById('platform-input-total-solved').value);
    const easySolved = Number(document.getElementById('platform-input-easy').value) || 0;
    const mediumSolved = Number(document.getElementById('platform-input-medium').value) || 0;
    const hardSolved = Number(document.getElementById('platform-input-hard').value) || 0;
    const ranking = document.getElementById('platform-input-ranking').value.trim();
    const contestsCount = Number(document.getElementById('platform-input-contests').value) || 0;
    const streakDays = Number(document.getElementById('platform-input-streak').value) || 0;

    let icon = 'code';
    if (platform.toLowerCase().includes('leetcode')) icon = 'leetcode';
    else if (platform.toLowerCase().includes('codeforces')) icon = 'codeforces';
    else if (platform.toLowerCase().includes('codechef')) icon = 'codechef';
    else if (platform.toLowerCase().includes('codolio')) icon = 'codolio';

    addCodingPlatform({
      platform,
      icon,
      handle,
      profileUrl,
      rating,
      maxRating,
      badge,
      ranking,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      contestsCount,
      streakDays
    });

    form.reset();
    renderAdminCodingPlatforms();
    renderCodingPlatforms(getCodingPlatforms());
    renderStats();
    showToast('Platform profile added.', 'success');
  };
}

function renderAdminCodingPlatforms() {
  const list = document.getElementById('admin-platforms-list');
  if (!list) return;
  const platforms = getCodingPlatforms();
  list.innerHTML = '';

  platforms.forEach(p => {
    const item = document.createElement('div');
    item.style = 'display: flex; justify-content: space-between; align-items: center; background: var(--surface-0); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);';
    item.innerHTML = `
      <div>
        <strong>${p.platform}</strong> (@${p.handle}) — Rating: <span style="color: var(--accent-mint); font-family: var(--font-mono);">${p.rating}</span> [${p.badge}]
        <div style="font-size: 0.8rem; color: var(--text-muted);">Solved: ${p.totalSolved} (E: ${p.easySolved}, M: ${p.mediumSolved}, H: ${p.hardSolved}) • Contests: ${p.contestsCount}</div>
      </div>
      <button class="btn btn-ghost btn-sm" style="color: var(--accent-rose);" data-id="${p.id}">Delete</button>
    `;
    item.querySelector('button').onclick = () => {
      deleteCodingPlatform(p.id);
      renderAdminCodingPlatforms();
      renderCodingPlatforms(getCodingPlatforms());
      renderStats();
      showToast('Platform profile removed.', 'info');
    };
    list.appendChild(item);
  });
}

/* ==========================================================================
   Navigation & Mobile Drawer
   ========================================================================== */

function initNavigation() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  const closeBtn = document.getElementById('close-drawer-btn');
  const backdrop = document.getElementById('drawer-backdrop');

  if (menuBtn && drawer && backdrop) {
    menuBtn.onclick = () => {
      drawer.classList.add('open');
      backdrop.classList.add('open');
    };
    closeBtn.onclick = () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
    };
    backdrop.onclick = () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
    };
    drawer.querySelectorAll('.nav-link').forEach(link => {
      link.onclick = () => {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
      };
    });
  }

  // Active section spy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');

  window.addEventListener('scroll', () => {
    let current = 'home';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   URL Routing (?admin, ?print=resume, ?print=cv)
   ========================================================================== */

function checkUrlRouting() {
  const urlParams = new URLSearchParams(window.location.search);

  // Hidden admin access
  if (urlParams.has('admin')) {
    const authModal = document.getElementById('admin-auth-modal');
    if (isAdminAuthenticated) {
      openAdminDashboard();
    } else if (authModal) {
      authModal.classList.add('open');
    }
  }

  // Printable ATS Resume / CV
  const printMode = urlParams.get('print');
  if (printMode === 'resume' || printMode === 'cv') {
    renderAtsPrintView(printMode);
  }
}

function renderAtsPrintView(mode) {
  const printContainer = document.getElementById('print-container');
  if (!printContainer) return;

  const db = loadData();
  const profile = db.profile;
  const isCv = mode === 'cv';

  printContainer.innerHTML = `
    <div class="print-header">
      <div class="print-name">${profile.name}</div>
      <div class="print-title">${profile.role}</div>
      <div class="print-contact-row">
        <span>${profile.location}</span>
        <span>•</span>
        <span>${profile.email}</span>
        <span>•</span>
        <span>${profile.github}</span>
        <span>•</span>
        <span>${profile.linkedin}</span>
      </div>
    </div>

    <div class="print-section">
      <div class="print-section-title">Professional Summary</div>
      <div class="print-item-body">${profile.bio}</div>
    </div>

    <div class="print-section">
      <div class="print-section-title">Core Technical Proficiencies</div>
      <div class="print-item-body">
        ${(db.skills || []).map(s => `<strong>${s.name}</strong> (${s.category})`).join(' • ')}
      </div>
    </div>

    <div class="print-section">
      <div class="print-section-title">Experience & Career Milestones</div>
      ${(db.journey || [])
        .filter(j => j.type === 'experience')
        .map(j => `
          <div class="print-item">
            <div class="print-item-header">
              <span>${j.role} — ${j.company}</span>
              <span>${j.date}</span>
            </div>
            <div class="print-item-body">${j.description}</div>
          </div>
        `).join('')}
    </div>

    <div class="print-section">
      <div class="print-section-title">Featured Production Architecture Projects</div>
      ${(db.projects || [])
        .slice(0, isCv ? 6 : 3)
        .map(p => `
          <div class="print-item">
            <div class="print-item-header">
              <span>${p.title} [${p.category}]</span>
              <span style="font-size: 8.5pt;">${(p.tags || []).join(', ')}</span>
            </div>
            <div class="print-item-body">${p.longDescription || p.description}</div>
          </div>
        `).join('')}
    </div>

    <div class="print-section">
      <div class="print-section-title">Education</div>
      ${(db.journey || [])
        .filter(j => j.type === 'education')
        .map(j => `
          <div class="print-item">
            <div class="print-item-header">
              <span>${j.role}</span>
              <span>${j.date}</span>
            </div>
            <div class="print-item-sub">${j.company}</div>
            <div class="print-item-body">${j.description}</div>
          </div>
        `).join('')}
    </div>

    ${isCv ? `
      <div class="print-section">
        <div class="print-section-title">Certifications & Competitive Programming</div>
        <div class="print-item-body">
          ${(db.certificates || []).map(c => `• <strong>${c.title}</strong> — ${c.issuer} (${c.year})`).join('<br />')}
          <br />
          ${(db.codingPlatforms || []).map(p => `• <strong>${p.platform}</strong> (@${p.handle}): Rating ${p.rating} [${p.badge}] — ${p.totalSolved} Problems Solved (${p.ranking})`).join('<br />')}
        </div>
      </div>
    ` : ''}
  `;

  // Allow web fonts to paint then trigger print
  setTimeout(() => {
    window.print();
  }, 700);
}
