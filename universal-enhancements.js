/* universal-enhancements.js — Add to all pages for enhanced functionality */

document.addEventListener('DOMContentLoaded', () => {
  
  // ============================================
  // 1. LIGHTBOX FOR IMAGES/VIDEOS (All Pages)
  // ============================================
  
  // Create lightbox HTML if it doesn't exist
  if (!document.getElementById('lightbox')) {
    const lightboxHTML = `
      <div class="lightbox" id="lightbox">
        <div class="lightbox-content">
          <button class="lightbox-close" onclick="closeLightbox()">×</button>
          <button class="lightbox-nav lightbox-prev" onclick="navigateLightbox(-1)">‹</button>
          <button class="lightbox-nav lightbox-next" onclick="navigateLightbox(1)">›</button>
          <img id="lightbox-img" src="" alt="" style="display:none;">
          <video id="lightbox-video" controls style="display:none;">
            <source src="" type="video/mp4">
          </video>
          <div class="lightbox-caption" id="lightbox-caption"></div>
          <div class="lightbox-counter" id="lightbox-counter"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');

  let currentMediaIndex = 0;
  let mediaItems = [];

  // Collect all gallery items
  function initializeLightbox() {
    mediaItems = Array.from(document.querySelectorAll('.gallery figure'));
    
    mediaItems.forEach((figure, index) => {
      figure.style.cursor = 'pointer';
      figure.addEventListener('click', () => openLightbox(index));
    });
  }

  function openLightbox(index) {
    currentMediaIndex = index;
    showMedia(index);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function showMedia(index) {
    const figure = mediaItems[index];
    const img = figure.querySelector('img');
    const video = figure.querySelector('video');
    const caption = figure.querySelector('figcaption')?.textContent || '';

    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxImg.style.display = 'block';
      lightboxVideo.style.display = 'none';
    } else if (video) {
      const source = video.querySelector('source');
      lightboxVideo.querySelector('source').src = source.src;
      lightboxVideo.load();
      lightboxVideo.style.display = 'block';
      lightboxImg.style.display = 'none';
    }

    lightboxCaption.textContent = caption;
    lightboxCounter.textContent = `${index + 1} / ${mediaItems.length}`;

    // Show/hide navigation buttons
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    if (prevBtn) prevBtn.style.display = mediaItems.length > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = mediaItems.length > 1 ? 'flex' : 'none';
  }

  window.navigateLightbox = function(direction) {
    currentMediaIndex = (currentMediaIndex + direction + mediaItems.length) % mediaItems.length;
    showMedia(currentMediaIndex);
  };

  window.closeLightbox = function() {
    lightbox.classList.remove('active');
    if (lightboxVideo) lightboxVideo.pause();
    document.body.style.overflow = '';
  };

  // Close on background click
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  initializeLightbox();

  // ============================================
  // 2. SMOOTH SCROLL TO TOP BUTTON
  // ============================================
  
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.id = 'scrollTopBtn';
  scrollTopBtn.innerHTML = '↑';
  scrollTopBtn.className = 'scroll-top-btn';
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
  document.body.appendChild(scrollTopBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ============================================
  // 3. READING PROGRESS BAR
  // ============================================
  
  const progressBar = document.createElement('div');
  progressBar.id = 'readingProgress';
  progressBar.className = 'reading-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });

  // ============================================
  // 4. LAZY LOADING FOR IMAGES
  // ============================================
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ============================================
  // 5. COPY CODE BUTTON FOR CODE BLOCKS
  // ============================================
  
  document.querySelectorAll('pre code').forEach(block => {
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    block.parentNode.parentNode.insertBefore(wrapper, block.parentNode);
    wrapper.appendChild(block.parentNode);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn';
    copyBtn.innerHTML = '📋 Copy';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(block.textContent).then(() => {
        copyBtn.innerHTML = '✓ Copied!';
        setTimeout(() => copyBtn.innerHTML = '📋 Copy', 2000);
      });
    });
    wrapper.appendChild(copyBtn);
  });

  // ============================================
  // 6. ACTIVE NAV HIGHLIGHTING
  // ============================================
  
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // ============================================
  // 7. EXTERNAL LINK ICONS
  // ============================================
  
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    if (!link.querySelector('.external-icon')) {
      link.innerHTML += ' <span class="external-icon">↗</span>';
    }
  });

  // ============================================
  // 8. TOOLTIP FOR ABBREVIATIONS
  // ============================================
  
  document.querySelectorAll('abbr, acronym').forEach(abbr => {
    if (abbr.title) {
      abbr.style.cursor = 'help';
      abbr.style.textDecoration = 'underline dotted';
    }
  });

  // ============================================
  // 9. IMAGE ZOOM ON HOVER (Non-gallery images)
  // ============================================
  
  document.querySelectorAll('.page img:not(.gallery img):not(.avatar)').forEach(img => {
    img.style.transition = 'transform 0.3s ease';
    img.addEventListener('mouseenter', () => {
      img.style.transform = 'scale(1.02)';
    });
    img.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1)';
    });
  });

  // ============================================
  // 10. PRINT BUTTON
  // ============================================
  
  const printBtn = document.createElement('button');
  printBtn.className = 'print-btn';
  printBtn.innerHTML = '🖨️ Print';
  printBtn.setAttribute('aria-label', 'Print page');
  printBtn.addEventListener('click', () => window.print());
  
  // Add to quick links if they exist
  const quickLinks = document.querySelector('.quick-links');
  if (quickLinks) {
    const printLink = document.createElement('a');
    printLink.href = '#';
    printLink.textContent = '🖨️ Print';
    printLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
    quickLinks.appendChild(printLink);
  }

  // ============================================
  // 11. SMOOTH ANCHOR LINKS
  // ============================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#!') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ============================================
  // 12. DROPDOWN AUTO-OPEN ON CURRENT PAGE
  // ============================================
  
  document.querySelectorAll('.dropdown ul a.active').forEach(link => {
    const dropdown = link.closest('.dropdown');
    if (dropdown) {
      dropdown.classList.add('open');
      dropdown.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'true');
    }
  });

  // ============================================
  // 13. PERFORMANCE: Preload hover images
  // ============================================
  
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href');
      const preload = document.createElement('link');
      preload.rel = 'prefetch';
      preload.href = href;
      document.head.appendChild(preload);
    }, { once: true });
  });

});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Share functionality (if needed)
function shareProject(title, text) {
  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: window.location.href
    }).catch(err => console.log('Share failed:', err));
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
    });
  }
}

// Export function for potential use
window.portfolioUtils = {
  shareProject,
  openLightbox: (index) => window.openLightbox?.(index),
  closeLightbox: () => window.closeLightbox?.()
};