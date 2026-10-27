/**
 * CivicConnect — Dashboard Stats Module
 * 
 * Yeh module Dashboard ke top summary cards (Total, Pending, In Progress, Resolved)
 * ke counters ko update karta hai.
 */

import { complaintService } from '../services/complaintService.js';

export class DashboardStats {
  constructor() {
    this.totalEl = document.getElementById('stat-total');
    this.pendingEl = document.getElementById('stat-pending');
    this.inProgressEl = document.getElementById('stat-inprogress');
    this.resolvedEl = document.getElementById('stat-resolved');
  }

  /**
   * Counters ko complaintService ke calculated stats se update karta hai.
   */
  update() {
    const stats = complaintService.getDashboardStats();

    if (this.totalEl) this.totalEl.textContent = stats.total;
    if (this.pendingEl) this.pendingEl.textContent = stats.pending;
    if (this.inProgressEl) this.inProgressEl.textContent = stats.inProgress;
    if (this.resolvedEl) this.resolvedEl.textContent = stats.resolved;
  }
}
