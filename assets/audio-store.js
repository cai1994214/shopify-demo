class AudioTabs extends HTMLElement {
  connectedCallback() {
    this.buttons = [...this.querySelectorAll('[data-audio-tab]')];
    this.panels = [...this.querySelectorAll('[data-audio-panel]')];
    this.buttons.forEach((button) => button.addEventListener('click', () => this.select(button.dataset.audioTab)));
  }

  select(id) {
    this.buttons.forEach((button) => button.classList.toggle('is-active', button.dataset.audioTab === id));
    this.panels.forEach((panel) => panel.hidden = panel.dataset.audioPanel !== id);
  }
}

class AudioGallery extends HTMLElement {
  connectedCallback() {
    this.image = this.querySelector('[data-audio-main-image]');
    this.buttons = [...this.querySelectorAll('[data-audio-thumb]')];
    this.buttons.forEach((button) => button.addEventListener('click', () => this.select(button)));
  }

  select(button) {
    if (!this.image) return;
    this.buttons.forEach((item) => item.classList.toggle('is-active', item === button));
    this.image.classList.remove('is-changing');
    this.image.src = button.dataset.audioImage;
    this.image.alt = button.dataset.audioAlt || '';
    requestAnimationFrame(() => this.image.classList.add('is-changing'));
  }
}

class AudioQuantity extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input');
    this.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const step = button.dataset.audioQty === 'plus' ? 1 : -1;
        const current = parseInt(this.input.value || '1', 10);
        this.input.value = Math.max(parseInt(this.input.min || '1', 10), current + step);
      });
    });
  }
}

class AudioToast extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', () => this.hide());
    document.addEventListener('submit', (event) => {
      if (event.target.closest('product-form')) {
        setTimeout(() => this.show('已加入购物车'), 450);
      }
    }, true);
  }

  show(message) {
    this.textContent = message;
    this.hidden = false;
    this.classList.add('is-visible');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.hide(), 2200);
  }

  hide() {
    this.classList.remove('is-visible');
    this.hidden = true;
  }
}

customElements.define('audio-tabs', AudioTabs);
customElements.define('audio-gallery', AudioGallery);
customElements.define('audio-quantity', AudioQuantity);
customElements.define('audio-toast', AudioToast);

const audioMotion = {
  observer: null,
  parallaxItems: new Set(),
  depthItems: new Set(),
  frame: 0,
};

const audioMotionReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const audioMotionSelector = '.audio-reveal, [data-audio-reveal]';

function initAudioReveal(root = document) {
  const items = [...root.querySelectorAll(audioMotionSelector)];
  if (!items.length) return;

  document.documentElement.classList.add('audio-motion-ready');

  if (audioMotionReduced() || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  if (!audioMotion.observer) {
    audioMotion.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        audioMotion.observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }

  items.forEach((item) => {
    if (item.dataset.audioMotionReady === 'true') return;
    item.dataset.audioMotionReady = 'true';
    const siblings = [...(item.parentElement?.children || [])].filter((sibling) => sibling.matches(audioMotionSelector));
    const index = Math.max(0, siblings.indexOf(item));
    item.style.setProperty('--audio-delay', `${Math.min(index * 70, 280)}ms`);
    audioMotion.observer.observe(item);
  });
}

function initAudioTilt(root = document) {
  if (audioMotionReduced()) return;

  root.querySelectorAll('.audio-tilt').forEach((item) => {
    if (item.dataset.audioTiltReady === 'true') return;
    item.dataset.audioTiltReady = 'true';

    item.addEventListener('pointermove', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      item.style.setProperty('--audio-delay', '0ms');
      item.style.setProperty('--audio-tilt-x', `${(y * -3.5).toFixed(2)}deg`);
      item.style.setProperty('--audio-tilt-y', `${(x * 4).toFixed(2)}deg`);
    });

    item.addEventListener('pointerleave', () => {
      item.style.setProperty('--audio-tilt-x', '0deg');
      item.style.setProperty('--audio-tilt-y', '0deg');
    });
  });
}

function initAudioHoverScene(root = document) {
  if (audioMotionReduced()) return;

  root.querySelectorAll('[data-audio-hover-scene]').forEach((item) => {
    if (item.dataset.audioHoverReady === 'true') return;
    item.dataset.audioHoverReady = 'true';

    const reset = () => {
      item.style.setProperty('--audio-hover-x', '50%');
      item.style.setProperty('--audio-hover-y', '50%');
      item.style.setProperty('--audio-hover-dx', '0px');
      item.style.setProperty('--audio-hover-dy', '0px');
      item.style.setProperty('--audio-hover-active', '0');
    };

    item.addEventListener('pointerenter', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      item.style.setProperty('--audio-hover-active', '1');
    });

    item.addEventListener('pointermove', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      const rect = item.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      item.style.setProperty('--audio-hover-x', `${(x * 100).toFixed(1)}%`);
      item.style.setProperty('--audio-hover-y', `${(y * 100).toFixed(1)}%`);
      item.style.setProperty('--audio-hover-dx', `${((x - 0.5) * 14).toFixed(2)}px`);
      item.style.setProperty('--audio-hover-dy', `${((y - 0.5) * 10).toFixed(2)}px`);
      item.style.setProperty('--audio-hover-active', '1');
    });

    item.addEventListener('pointerleave', reset);
    reset();
  });
}

function initAudioParallax(root = document) {
  root.querySelectorAll('[data-audio-parallax]').forEach((item) => audioMotion.parallaxItems.add(item));
  root.querySelectorAll('[data-audio-depth]').forEach((item) => audioMotion.depthItems.add(item));
  requestAudioMotionFrame();
}

function requestAudioMotionFrame() {
  if (audioMotion.frame || audioMotionReduced()) return;
  audioMotion.frame = requestAnimationFrame(updateAudioMotion);
}

function updateAudioMotion() {
  audioMotion.frame = 0;
  const viewportCenter = window.innerHeight / 2;

  audioMotion.parallaxItems.forEach((item) => {
    if (!document.documentElement.contains(item)) {
      audioMotion.parallaxItems.delete(item);
      return;
    }
    const rect = item.getBoundingClientRect();
    const distance = (viewportCenter - (rect.top + rect.height / 2)) / Math.max(window.innerHeight, 1);
    const shift = Math.max(-18, Math.min(18, distance * 18));
    item.style.setProperty('--audio-parallax-y', `${shift.toFixed(2)}px`);
  });

  audioMotion.depthItems.forEach((item) => {
    if (!document.documentElement.contains(item)) {
      audioMotion.depthItems.delete(item);
      return;
    }
    const rect = item.getBoundingClientRect();
    const distance = (viewportCenter - (rect.top + rect.height / 2)) / Math.max(window.innerHeight, 1);
    const shift = Math.max(-8, Math.min(8, distance * 8));
    const scale = 1 + Math.max(0, 1 - Math.min(1, Math.abs(distance))) * 0.018;
    item.style.setProperty('--audio-depth-y', `${shift.toFixed(2)}px`);
    item.style.setProperty('--audio-depth-scale', scale.toFixed(4));
  });
}

function initAudioMotion(root = document) {
  initAudioReveal(root);
  initAudioTilt(root);
  initAudioHoverScene(root);
  initAudioParallax(root);
}

const bootAudioMotion = () => initAudioMotion(document);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAudioMotion, { once: true });
} else {
  bootAudioMotion();
}

document.addEventListener('scroll', requestAudioMotionFrame, { passive: true });
window.addEventListener('resize', requestAudioMotionFrame);
document.addEventListener('shopify:section:load', (event) => initAudioMotion(event.target));

document.addEventListener('click', (event) => {
  const buyNowButton = event.target.closest('[data-audio-buy-now]');
  if (buyNowButton) {
    const form = buyNowButton.closest('form');
    if (!form) return;
    buyNowButton.setAttribute('aria-disabled', 'true');
    const spinner = buyNowButton.querySelector('.loading__spinner');
    spinner?.classList.remove('hidden');
    const formData = new FormData(form);
    fetch(window.routes?.cart_add_url || '/cart/add.js', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: formData,
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status) throw new Error(response.description || 'Add to cart failed');
        window.location.href = '/checkout';
      })
      .catch(() => {
        buyNowButton.removeAttribute('aria-disabled');
        spinner?.classList.add('hidden');
      });
    return;
  }

  const variantButton = event.target.closest('[data-audio-variant]');
  if (variantButton) {
    const scope = variantButton.closest('.audio-product-info');
    scope?.querySelectorAll('[data-audio-variant]').forEach((button) => {
      button.classList.toggle('is-active', button === variantButton);
    });
    const variantInput = scope?.querySelector('[data-audio-selected-variant]');
    if (variantInput) variantInput.value = variantButton.dataset.variantId;
    const price = scope?.querySelector('[data-audio-product-price]');
    if (price && variantButton.dataset.variantPrice) price.textContent = variantButton.dataset.variantPrice;
  }

  const trigger = event.target.closest('[data-audio-scroll]');
  if (!trigger) return;
  const target = document.querySelector(trigger.dataset.audioScroll);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
