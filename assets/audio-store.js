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
    this.image.src = button.dataset.audioImage;
    this.image.alt = button.dataset.audioAlt || '';
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
