/**
 * UI.js
 * Handles Modals, Toasts, and Confetti
 */

export const UI = {
  // Container references
  modalOverlay: null, // Will be created lazily
  toastContainer: null,

  init() {
      // Create Modal Overlay if not exists
      if (!document.getElementById('modal-overlay')) {
          const overlay = document.createElement('div');
          overlay.id = 'modal-overlay';
          overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300';
          overlay.innerHTML = `
              <div id="modal-content" class="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform scale-95 transition-transform duration-300">
                  <!-- Dynamic Content -->
              </div>
          `;
          document.body.appendChild(overlay);
          this.modalOverlay = overlay;
      }

      // Create Toast Container
      if (!document.getElementById('toast-container')) {
          const container = document.createElement('div');
          container.id = 'toast-container';
          container.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 z-50 space-y-3 pointer-events-none';
          document.body.appendChild(container);
          this.toastContainer = container;
      }
  },

  showModal(htmlContent) {
      this.init();
      const content = this.modalOverlay.querySelector('#modal-content');
      content.innerHTML = htmlContent;
      
      this.modalOverlay.classList.remove('hidden');
      // Slight delay to allow display block to apply before opacity transition
      requestAnimationFrame(() => {
          this.modalOverlay.classList.remove('opacity-0');
          content.classList.remove('scale-95');
          content.classList.add('scale-100');
      });

      return new Promise(resolve => {
          // Helper to close
           window.closeModal = (result) => {
              this.modalOverlay.classList.add('opacity-0');
              content.classList.remove('scale-100');
              content.classList.add('scale-95');
              setTimeout(() => {
                  this.modalOverlay.classList.add('hidden');
                  resolve(result);
              }, 300);
          };
      });
  },

  async confirm(title, message) {
      const html = `
          <h3 class="text-xl font-bold text-white mb-2">${title}</h3>
          <p class="text-slate-300 mb-6">${message}</p>
          <div class="flex gap-3">
              <button onclick="window.closeModal(false)" class="flex-1 px-4 py-2 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition">Cancel</button>
              <button onclick="window.closeModal(true)" class="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">Confirm</button>
          </div>
      `;
      return this.showModal(html);
  },

  async alert(title, message, icon = 'fa-info-circle') {
      const html = `
          <div class="text-center">
              <div class="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <i class="fas ${icon} text-emerald-500 text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-white mb-2">${title}</h3>
              <p class="text-slate-300 mb-6">${message}</p>
              <button onclick="window.closeModal(true)" class="w-full px-4 py-3 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition">Got it</button>
          </div>
      `;
      return this.showModal(html);
  },

  async promptDate(title, initialDateMs) {
      // Correctly format datetime-local (YYYY-MM-DDTHH:mm) with local offset
      const d = new Date(initialDateMs);
      const pad = n => n < 10 ? '0'+n : n;
      const localIso = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

      const html = `
          <h3 class="text-xl font-bold text-white mb-4">${title}</h3>
          <div class="mb-6">
              <labek class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">New Start Time</label>
              <input type="datetime-local" id="modal-date-input" value="${localIso}" class="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 text-lg">
          </div>
          <div class="flex gap-3">
              <button onclick="window.closeModal(null)" class="flex-1 px-4 py-2 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition">Cancel</button>
              <button onclick="window.closeModal(document.getElementById('modal-date-input').value)" class="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">Save</button>
          </div>
      `;
      return this.showModal(html);
  },

  async promptNumber(title, label, initialValue) {
      const html = `
          <h3 class="text-xl font-bold text-white mb-4">${title}</h3>
          <div class="mb-6">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">${label}</label>
              <input type="number" id="modal-num-input" value="${initialValue}" class="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 text-2xl font-bold text-center">
          </div>
          <div class="flex gap-3">
              <button onclick="window.closeModal(null)" class="flex-1 px-4 py-2 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition">Cancel</button>
              <button onclick="window.closeModal(document.getElementById('modal-num-input').value)" class="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">Set Goal</button>
          </div>
      `;
      return this.showModal(html);
  },

  async promptSelection(title, options) {
      // options = [{label: 'Good', value: 'good', icon: 'fa-smile'}, ...]
      const buttonsHtml = options.map(opt => `
        <button onclick="window.closeModal('${opt.value}')" class="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-700 hover:bg-emerald-500/20 hover:border-emerald-500 border border-transparent transition group">
            <i class="fas ${opt.icon} text-3xl mb-2 text-slate-400 group-hover:text-emerald-400"></i>
            <span class="text-sm font-medium text-slate-300 group-hover:text-white">${opt.label}</span>
        </button>
      `).join('');

      const html = `
        <h3 class="text-xl font-bold text-white mb-6 text-center">${title}</h3>
        <div class="grid grid-cols-3 gap-3">
            ${buttonsHtml}
        </div>
      `;
      return this.showModal(html);
  },

  toast(message, type = 'success') {
      this.init();
      const el = document.createElement('div');
      el.className = 'glass px-4 py-2 rounded-full flex items-center gap-3 shadow-xl transform translate-y-[-20px] opacity-0 transition-all duration-300 pointer-events-auto';
      
      const icon = type === 'success' ? 'fa-check-circle text-emerald-400' : 'fa-info-circle text-blue-400';
      
      el.innerHTML = `
          <i class="fas ${icon}"></i>
          <span class="text-sm font-medium text-white">${message}</span>
      `;
      
      this.toastContainer.appendChild(el);
      
      requestAnimationFrame(() => {
          el.classList.remove('translate-y-[-20px]', 'opacity-0');
      });

      setTimeout(() => {
          el.classList.add('opacity-0', 'translate-y-[-20px]');
          setTimeout(() => el.remove(), 300);
      }, 3000);
  },

  confetti() {
      // Simple confetti implementation
      const colors = ['#10b981', '#34d399', '#059669', '#ffffff', '#fcd34d'];
      for(let i=0; i<50; i++) {
          const conf = document.createElement('div');
          conf.className = 'fixed z-40 w-2 h-2 rounded-sm pointer-events-none';
          conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          conf.style.left = '50%';
          conf.style.top = '50%';
          document.body.appendChild(conf);

          // Animate
          const destX = (Math.random() - 0.5) * window.innerWidth;
          const destY = (Math.random() - 0.5) * window.innerHeight;
          const rotate = Math.random() * 360;

          const anim = conf.animate([
              { transform: 'translate(0,0) rotate(0)', opacity: 1 },
              { transform: `translate(${destX}px, ${destY}px) rotate(${rotate}deg)`, opacity: 0 }
          ], {
              duration: 1000 + Math.random() * 1000,
              easing: 'cubic-bezier(0, .9, .57, 1)'
          });

          anim.onfinish = () => conf.remove();
      }
  }
};
