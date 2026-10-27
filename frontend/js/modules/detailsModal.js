/**
 * CivicConnect — Complaint Details Modal Module
 * 
 * Yeh module kisi complaint par click karne par uski complete details,
 * location, status, timeline aur full photo view modal dikhata hai.
 */

export class DetailsModal {
  constructor() {
    this.modalEl = document.getElementById('details-modal');
    this.modalBodyEl = document.getElementById('details-modal-body');
    this.closeBtn = document.getElementById('close-details-modal');

    this.initEvents();
  }

  initEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Modal background click se close ho
    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) {
          this.close();
        }
      });
    }

    // Escape key dabane par modal close ho
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.close();
      }
    });
  }

  /**
   * Date ko readable Hinglish/Indian format me format karta hai.
   * e.g., "24 Oct 2026, 02:30 PM"
   */
  formatDate(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoString;
    }
  }

  /**
   * Status ke anusar CSS class return karta hai.
   */
  getStatusBadgeClass(status) {
    switch (status) {
      case 'Pending':
        return 'badge-pending';
      case 'In Progress':
        return 'badge-inprogress';
      case 'Resolved':
        return 'badge-resolved';
      default:
        return 'badge-default';
    }
  }

  /**
   * Modal open karke complaint details render karta hai.
   * @param {Object} complaint
   */
  open(complaint) {
    if (!this.modalEl || !this.modalBodyEl || !complaint) return;

    const formattedDate = this.formatDate(complaint.createdAt);
    const statusClass = this.getStatusBadgeClass(complaint.status);

    this.modalBodyEl.innerHTML = `
      <div class="modal-detail-header">
        <div>
          <span class="detail-id">${complaint.id}</span>
          <h2 class="detail-title">${this.escapeHtml(complaint.title)}</h2>
        </div>
        <div class="detail-badges">
          <span class="badge ${statusClass}">
            <span class="status-dot"></span>${complaint.status}
          </span>
          <span class="badge badge-category">${this.escapeHtml(complaint.category)}</span>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label"><i class="icon-location">📍</i> Location:</span>
          <span class="detail-value">${this.escapeHtml(complaint.location)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label"><i class="icon-calendar">📅</i> Reported On:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
      </div>

      <div class="detail-section">
        <h4 class="detail-section-heading">Detailed Description</h4>
        <p class="detail-description">${this.escapeHtml(complaint.description)}</p>
      </div>

      <div class="detail-section">
        <h4 class="detail-section-heading">Attached Evidence Photo</h4>
        ${complaint.photoUrl ? `
          <div class="detail-photo-container">
            <img src="${complaint.photoUrl}" alt="Complaint Photo" class="detail-photo" />
          </div>
        ` : `
          <div class="no-photo-box">
            <span class="no-photo-icon">📷</span>
            <p>Citizen dwara koi photo attach nahi ki gayi hai (Optional).</p>
          </div>
        `}
      </div>

      <div class="detail-future-note">
        <small>ℹ️ <strong>System Note:</strong> Phase 1 me status read-only hai. Phase 2 me Department Staff dashboard se status update aur comments add kiye ja sakenge.</small>
      </div>
    `;

    this.modalEl.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
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
