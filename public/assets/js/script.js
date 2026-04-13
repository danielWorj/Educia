/* ===========================
   EDUCIA ADMIN - Script Principal
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== SIDEBAR MOBILE TOGGLE =====
  const sidebar = document.querySelector('.sidebar');
  const hamburger = document.querySelector('.hamburger-admin');
  const overlay = document.querySelector('.sidebar-overlay');

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay?.classList.toggle('open');
    });
    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  // ===== ACTIVE NAV LINK =====
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || href.endsWith(currentPage))) {
      link.classList.add('active');
    }
  });

  // ===== TOAST =====
  window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 280);
    }, 3500);
  };

  // ===== MODAL =====
  window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
  };
  window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
  };
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
  });

  // ===== FILTER CHIPS =====
  document.querySelectorAll('.filter-bar').forEach(bar => {
    bar.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        document.querySelectorAll('[data-category]').forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.style.opacity = show ? '1' : '0';
          card.style.transition = 'opacity 0.2s';
          setTimeout(() => { card.style.display = show ? '' : 'none'; }, show ? 0 : 200);
          if (show) setTimeout(() => { card.style.opacity = '1'; }, 10);
        });
      });
    });
  });

  // ===== TABLE SEARCH =====
  document.querySelectorAll('.table-search').forEach(input => {
    input.addEventListener('input', () => {
      const query = input.value.toLowerCase();
      const table = document.querySelector(input.dataset.table || 'table');
      if (table) {
        table.querySelectorAll('tbody tr').forEach(row => {
          row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
      }
    });
  });

  // ===== COUNTER ANIMATION =====
  function animateCounter(el, target, suffix = '') {
    let start = 0;
    const duration = 1800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('fr-FR') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.target), el.dataset.suffix || '');
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

  // ===== CHART BARS ANIMATION =====
  document.querySelectorAll('.chart-bar').forEach((bar, i) => {
    const h = bar.dataset.height || '50';
    bar.style.height = '0';
    setTimeout(() => { bar.style.height = h + '%'; bar.style.transition = 'height 0.6s ease'; }, 300 + i * 60);
  });

  // ===== DELETE CONFIRM =====
  document.querySelectorAll('[data-confirm-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.confirmDelete || 'Supprimer cet élément ?';
      if (confirm(msg)) {
        const row = btn.closest('tr') || btn.closest('.profile-card') || btn.closest('.offre-card') || btn.closest('.support-card');
        if (row) {
          row.style.transition = 'opacity 0.3s, transform 0.3s';
          row.style.opacity = '0';
          row.style.transform = 'scale(0.97)';
          setTimeout(() => {
            row.remove();
            // Update tab count after delete
            updateSettingsTabCounts();
          }, 320);
        }
        showToast('Élément supprimé', 'error');
      }
    });
  });

  // ===== APPROVE / REJECT =====
  document.querySelectorAll('[data-approve]').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      const badge = row?.querySelector('.badge');
      if (badge) { badge.className = 'badge badge-green'; badge.textContent = '✓ Approuvé'; }
      btn.disabled = true;
      const rejectBtn = row?.querySelector('[data-reject]');
      if (rejectBtn) rejectBtn.disabled = true;
      showToast('Profil approuvé avec succès !', 'success');
    });
  });
  document.querySelectorAll('[data-reject]').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('tr');
      const badge = row?.querySelector('.badge');
      if (badge) { badge.className = 'badge badge-red'; badge.textContent = '✗ Rejeté'; }
      btn.disabled = true;
      const approveBtn = row?.querySelector('[data-approve]');
      if (approveBtn) approveBtn.disabled = true;
      showToast('Profil rejeté', 'error');
    });
  });

  // ===== FORM SUBMIT =====
  document.querySelectorAll('form.admin-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.closest('.modal')?.querySelector('[type=submit]') ||
                  form.closest('.modal-overlay')?.querySelector('.btn-primary:not(.modal-close)') ||
                  form.querySelector('[type=submit]');
      const orig = btn ? btn.innerHTML : '';
      if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        btn.disabled = true;
      }
      setTimeout(() => {
        if (btn) { btn.innerHTML = orig; btn.disabled = false; }
        const modalEl = form.closest('.modal-overlay');
        if (modalEl) { modalEl.classList.remove('open'); document.body.style.overflow = ''; }
        showToast('Enregistré avec succès !', 'success');
        form.reset();
        updateSettingsTabCounts();
      }, 1200);
    });
  });

  // ===== CURRENT DATE =====
  const dateEl = document.querySelector('.header-date');
  if (dateEl) {
    const now = new Date();
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('fr-FR', opts);
  }

  // ===== VIEW TOGGLE (grid/table) =====
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('btn-primary'));
      btn.classList.add('btn-primary');
      const view = btn.dataset.view;
      document.querySelectorAll('.view-grid, .view-table').forEach(el => {
        el.style.display = el.classList.contains(`view-${view}`) ? '' : 'none';
      });
    });
  });

  // ===========================
  // ===== SETTINGS TABS =====
  // ===========================

  const settingsTabBar = document.getElementById('settingsTabBar');

  if (settingsTabBar) {

    const tabs = settingsTabBar.querySelectorAll('.settings-tab');

    // --- Switch tab ---
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetPanel = tab.dataset.tab;

        // Deactivate all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Deactivate all panels
        document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));

        // Activate selected
        tab.classList.add('active');
        const panel = document.getElementById(`panel-${targetPanel}`);
        if (panel) panel.classList.add('active');
      });
    });

    // --- Settings inline search ---
    document.querySelectorAll('.settings-search-input').forEach(input => {
      input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        const panelId = input.dataset.panel;
        const table = document.getElementById(`table-${panelId}`);
        if (!table) return;
        table.querySelectorAll('tbody tr').forEach(row => {
          const match = row.textContent.toLowerCase().includes(query);
          row.style.display = match ? '' : 'none';
        });
      });
    });

    // --- Edit row ---
    document.querySelectorAll('[data-edit-row]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        if (!row) return;
        const intitule = row.querySelector('.config-intitule')?.textContent || '';
        const desc = row.querySelector('.config-desc')?.textContent || '';

        // Pre-fill generic edit modal
        const editIntitule = document.getElementById('edit-intitule');
        const editDesc = document.getElementById('edit-description');
        if (editIntitule) editIntitule.value = intitule;
        if (editDesc) editDesc.value = desc;

        // Store reference to row for update on submit
        const editForm = document.getElementById('form-edit-generic');
        if (editForm) editForm.dataset.targetRow = '';
        editForm._targetRow = row;

        openModal('modal-edit-generic');
      });
    });

    // Handle edit form submit — update the row in place
    const editForm = document.getElementById('form-edit-generic');
    if (editForm) {
      editForm.addEventListener('submit', e => {
        e.preventDefault();
        const row = editForm._targetRow;
        const newIntitule = document.getElementById('edit-intitule')?.value || '';
        const newDesc = document.getElementById('edit-description')?.value || '';
        if (row) {
          const intEl = row.querySelector('.config-intitule');
          const descEl = row.querySelector('.config-desc');
          if (intEl) intEl.textContent = newIntitule;
          if (descEl) descEl.textContent = newDesc;
          // Highlight updated row briefly
          row.style.transition = 'background 0.3s';
          row.style.background = 'var(--primary-light)';
          setTimeout(() => { row.style.background = ''; }, 800);
        }
        closeModal('modal-edit-generic');
        showToast('Mis à jour avec succès !', 'success');
        editForm.reset();
        editForm._targetRow = null;
      });
    }

    // --- Helper: update tab counts from actual table rows ---
    window.updateSettingsTabCounts = function() {
      const mapping = [
        { tab: 'filiere',    table: 'table-filiere' },
        { tab: 'niveau',     table: 'table-niveau' },
        { tab: 'section',    table: 'table-section' },
        { tab: 'categorie',  table: 'table-categorie' },
        { tab: 'matiere',    table: 'table-matiere' },
        { tab: 'diplome',    table: 'table-diplome' },
        { tab: 'profil-ens', table: 'table-profil-ens' },
      ];
      mapping.forEach(({ tab, table }) => {
        const tbl = document.getElementById(table);
        const countEl = document.getElementById(`count-${tab}`);
        if (tbl && countEl) {
          const visibleRows = tbl.querySelectorAll('tbody tr');
          countEl.textContent = visibleRows.length;
        }
      });
    };

    // Init counts on load
    updateSettingsTabCounts();

  } // end if settingsTabBar

});