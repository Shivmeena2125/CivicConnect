/**
 * CivicConnect — Complaint List View Module
 * 
 * Yeh module complaints ko modern responsive cards ke roop me render karta hai,
 * empty state handle karta hai, aur details modal open karne ke events manage karta hai.
 */

export class ComplaintList {
  constructor(detailsModal) {
    this.containerEl = document.getElementById('complaint-list-container');
    this.resultsCountEl = document.getElementById('results-count');
    this.detailsModal = detailsModal;

    this.initEvents();
  }

  initEvents() {
    if (!this.containerEl) return;

    // Event delegation: Card ya "View Details" button par click ko handle karna
    this.containerEl.addEventListener('click', (e) => {
      const card = e.target.closest('.complaint-card');
      if (!card) return;

      const complaintId = card.dataset.id;
      if (complaintId && this.onSelectCallback) {
        this.onSelectCallback(complaintId);
      }
    });
  }

  /**
   * Card select hone par callback function register karta hai.
   */
  onSelectComplaint(callback) {
    this.onSelectCallback = callback;
  }

  /**
   * Date formatting helper.
   */
  formatDate(isoString) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  }

  /**
   * Status ke hisaab se CSS class return karta hai.
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
   * Category ke hisaab se visual icon return karta hai.
   */
  getCategoryIcon(category) {
    switch (category) {
      case 'Road Damage':
        return '🚧';
      case 'Garbage':
        return '🗑️';
      case 'Streetlight':
        return '💡';
      case 'Water Leakage':
        return '🚰';
      default:
        return '📌';
    }
  }

  /**
   * Complaints list ko DOM me render karta hai.
   * @param {Array<Object>} complaints
   */
  render(complaints) {
    if (!this.containerEl) return;

    if (this.resultsCountEl) {
      this.resultsCountEl.textContent = `${complaints.length} complaint${complaints.length === 1 ? '' : 's'} found`;
    }

    if (!complaints || complaints.length === 0) {
      this.containerEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>Koi Complaint Nahi Mili</h3>
          <p>Aapke search query ya selected filters ke mutabik koi complaint record nahi hai.</p>
          <button id="empty-reset-filters-btn" class="btn btn-secondary btn-sm">Clear All Filters</button>
        </div>
      `;

      // Clear filters button inside empty state
      const emptyResetBtn = document.getElementById('empty-reset-filters-btn');
      if (emptyResetBtn) {
        emptyResetBtn.addEventListener('click', () => {
          const clearBtn = document.getElementById('clear-filters-btn');
          if (clearBtn) clearBtn.click();
        });
      }
      return;
    }

    const html = complaints.map(complaint => {
      const statusClass = this.getStatusBadgeClass(complaint.status);
      const categoryIcon = this.getCategoryIcon(complaint.category);
      const formattedDate = this.formatDate(complaint.createdAt);

      return `
        <article class="complaint-card" data-id="${complaint.id}">
          <div class="card-header">
            <div class="card-id-wrapper">
              <span class="card-id">${complaint.id}</span>
              <span class="badge ${statusClass}">
                <span class="status-dot"></span>${complaint.status}
              </span>
            </div>
            <span class="card-date">${formattedDate}</span>
          </div>

          <h3 class="card-title">${this.escapeHtml(complaint.title)}</h3>

          <p class="card-description">${this.escapeHtml(complaint.description)}</p>

          <div class="card-metadata">
            <span class="meta-item">
              <span class="meta-icon">${categoryIcon}</span>
              <span class="meta-text">${this.escapeHtml(complaint.category)}</span>
            </span>
            <span class="meta-item" title="${this.escapeHtml(complaint.location)}">
              <span class="meta-icon">📍</span>
              <span class="meta-text">${this.escapeHtml(complaint.location)}</span>
            </span>
            ${complaint.photoUrl ? `
              <span class="meta-item meta-photo" title="Photo attached">
                <span class="meta-icon">📷</span>
                <span class="meta-text">Photo</span>
              </span>
            ` : ''}
          </div>

          <div class="card-footer">
            <button class="btn btn-outline btn-sm view-details-btn" data-id="${complaint.id}">
              View Details & Tracking →
            </button>
          </div>
        </article>
      `;
    }).join('');

    this.containerEl.innerHTML = html;
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
