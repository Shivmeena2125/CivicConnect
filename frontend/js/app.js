/**
 * CivicConnect — Main Application Bootstrap & Controller
 * 
 * Yeh file pure application ka entry point hai. Yeh sabhi services
 * aur modules (Stats, List, Form, Filters, Modal, Toasts) ko ek saath
 * wire-up karti hai.
 */

import { complaintService } from './services/complaintService.js';
import { DashboardStats } from './modules/dashboardStats.js';
import { DetailsModal } from './modules/detailsModal.js';
import { ComplaintList } from './modules/complaintList.js';
import { ComplaintForm } from './modules/complaintForm.js';
import { ComplaintFilters } from './modules/complaintFilters.js';

class CivicConnectApp {
  constructor() {
    this.stats = null;
    this.detailsModal = null;
    this.complaintList = null;
    this.complaintForm = null;
    this.filters = null;
  }

  init() {
    console.log('🚀 Initializing CivicConnect Citizen Dashboard...');

    // 1. Initialize Sub-modules
    this.stats = new DashboardStats();
    this.detailsModal = new DetailsModal();
    this.complaintList = new ComplaintList(this.detailsModal);

    // Complaint selection handling (Card click -> Details Modal)
    this.complaintList.onSelectComplaint((id) => {
      const complaint = complaintService.getComplaintById(id);
      if (complaint) {
        this.detailsModal.open(complaint);
      }
    });

    // 2. Initialize Report Form
    this.complaintForm = new ComplaintForm({
      showToast: (msg, type) => this.showToast(msg, type),
      onSubmitSuccess: (newComplaint) => {
        // Stats update
        this.stats.update();
        // Filters reset and list re-render
        this.filters.resetFilters();
      }
    });

    // 3. Initialize Filters & Search
    this.filters = new ComplaintFilters({
      onFilterChange: (filteredComplaints) => {
        this.complaintList.render(filteredComplaints);
      }
    });

    // 4. Reset Demo Data flow
    this.initResetDataModal();

    // 5. Mobile Sidebar & UI Navigation
    this.initNavigation();

    // 6. Initial Render
    this.refreshDashboard();

    console.log('✅ CivicConnect Dashboard ready!');
  }

  /**
   * Dashboard ke sabhi components ko fresh state se refresh karta hai.
   */
  refreshDashboard() {
    this.stats.update();
    const complaints = complaintService.getAllComplaints();
    this.complaintList.render(complaints);
  }

  /**
   * Reset Demo Data Modal aur action wire-up.
   */
  initResetDataModal() {
    const resetTriggerBtn = document.getElementById('reset-demo-btn');
    const resetModal = document.getElementById('reset-confirm-modal');
    const confirmBtn = document.getElementById('confirm-reset-btn');
    const cancelBtn = document.getElementById('cancel-reset-btn');
    const closeBtn = document.getElementById('close-reset-modal');

    const openResetModal = () => {
      if (resetModal) {
        resetModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
      }
    };

    const closeResetModal = () => {
      if (resetModal) {
        resetModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
    };

    if (resetTriggerBtn) {
      resetTriggerBtn.addEventListener('click', openResetModal);
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeResetModal);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeResetModal);
    }
    if (resetModal) {
      resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) closeResetModal();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        complaintService.resetDemoData();
        closeResetModal();
        this.refreshDashboard();
        if (this.filters) this.filters.resetFilters();
        this.showToast('Demo data initial 4 sample complaints par reset ho gaya hai.', 'info');
      });
    }
  }

  /**
   * Mobile Sidebar Toggle and responsive controls.
   */
  initNavigation() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const toggleSidebar = () => {
      if (sidebar) sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    };

    const closeSidebar = () => {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('show');
    };

    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', toggleSidebar);
    }
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }
  }

  /**
   * Non-intrusive Toast Notification alert system.
   * @param {string} message
   * @param {'success'|'error'|'info'|'warning'} type
   */
  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };

    toast.innerHTML = `
      <span class="toast-icon">${iconMap[type] || '🔔'}</span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    toastContainer.appendChild(toast);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Bootstrap once DOM content is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new CivicConnectApp();
  app.init();
});
