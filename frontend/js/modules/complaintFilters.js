/**
 * CivicConnect — Complaint Filters & Search Module
 * 
 * Yeh module real-time live search (ID, Title, Category, Location),
 * status filter, category filter, aur filter reset functionality manage karta hai.
 */

import { complaintService } from '../services/complaintService.js';

export class ComplaintFilters {
  constructor(options = {}) {
    this.searchInput = document.getElementById('search-input');
    this.categorySelect = document.getElementById('filter-category');
    this.statusSelect = document.getElementById('filter-status');
    this.clearBtn = document.getElementById('clear-filters-btn');

    this.onFilterChange = options.onFilterChange || null;
    this.debounceTimer = null;

    this.initEvents();
  }

  initEvents() {
    // Search input with debounce to prevent sluggishness
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.applyFilters();
        }, 150);
      });
    }

    // Category dropdown filter
    if (this.categorySelect) {
      this.categorySelect.addEventListener('change', () => this.applyFilters());
    }

    // Status dropdown filter
    if (this.statusSelect) {
      this.statusSelect.addEventListener('change', () => this.applyFilters());
    }

    // Clear filters button
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.resetFilters());
    }
  }

  /**
   * Current filter state read karke complaintService se filtered complaints lata hai.
   */
  applyFilters() {
    const query = this.searchInput ? this.searchInput.value : '';
    const category = this.categorySelect ? this.categorySelect.value : 'All';
    const status = this.statusSelect ? this.statusSelect.value : 'All';

    const filtered = complaintService.filterComplaints({
      query,
      category,
      status
    });

    if (this.onFilterChange) {
      this.onFilterChange(filtered);
    }
  }

  /**
   * Sabhi filters ko default ("All" aur empty) par reset karta hai.
   */
  resetFilters() {
    if (this.searchInput) this.searchInput.value = '';
    if (this.categorySelect) this.categorySelect.value = 'All';
    if (this.statusSelect) this.statusSelect.value = 'All';

    this.applyFilters();
  }
}
