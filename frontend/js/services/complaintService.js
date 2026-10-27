/**
 * CivicConnect — Complaint Business Logic Service
 * 
 * Architecture Note:
 * Yeh service UI modules (forms, list, stats) aur storage layer ke beech
 * ek abstraction provide karti hai (Service Layer Pattern).
 * Kal ko jab Spring Boot REST API aayega, toh sirf is service ke internal
 * methods ko `fetch('/api/complaints')` me badla jayega — UI ko change nahi karna padega!
 */

import { storageService } from './storageService.js';
import { CONFIG } from '../config.js';

class ComplaintService {
  constructor() {
    this.complaints = storageService.loadComplaints();
  }

  /**
   * Saari complaints return karta hai (newest first).
   * @returns {Array<Object>}
   */
  getAllComplaints() {
    // Fresh read from storage in case of multiple tabs or reset
    this.complaints = storageService.loadComplaints();
    return [...this.complaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Specific ID se complaint search karta hai.
   * @param {string} id
   * @returns {Object|null}
   */
  getComplaintById(id) {
    if (!id) return null;
    return this.complaints.find(c => c.id.toLowerCase() === id.trim().toLowerCase()) || null;
  }

  /**
   * Unique Complaint ID generate karta hai.
   * Format: CC-2026-XXXX (e.g. CC-2026-4821)
   * @returns {string}
   */
  generateComplaintId() {
    const currentYear = new Date().getFullYear();
    let newId;
    let attempts = 0;

    do {
      const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
      newId = `CC-${currentYear}-${randomNum}`;
      attempts++;
    } while (this.complaints.some(c => c.id === newId) && attempts < 100);

    return newId;
  }

  /**
   * New Complaint create aur validate karta hai.
   * @param {Object} formData
   * @returns {{ success: boolean, complaint?: Object, error?: string }}
   */
  createComplaint(formData) {
    const { title, category, location, description, photoUrl } = formData;

    // Strict validation
    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      return { success: false, error: 'Complaint title kam se kam 5 characters ka hona chahiye.' };
    }
    if (title.trim().length > 100) {
      return { success: false, error: 'Complaint title 100 characters se zyada nahi ho sakta.' };
    }

    if (!category || !CONFIG.CATEGORIES.includes(category)) {
      return { success: false, error: 'Kripya ek valid category select karein.' };
    }

    if (!location || typeof location !== 'string' || location.trim().length < 5) {
      return { success: false, error: 'Location kam se kam 5 characters ki honi chahiye.' };
    }
    if (location.trim().length > 150) {
      return { success: false, error: 'Location 150 characters se zyada nahi ho sakti.' };
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return { success: false, error: 'Complaint description kam se kam 10 characters ki honi chahiye.' };
    }
    if (description.trim().length > 1000) {
      return { success: false, error: 'Complaint description 1000 characters se zyada nahi ho sakti.' };
    }

    const newComplaint = {
      id: this.generateComplaintId(),
      title: title.trim(),
      category: category.trim(),
      location: location.trim(),
      description: description.trim(),
      status: CONFIG.STATUSES.PENDING, // New complaint is always Pending
      createdAt: new Date().toISOString(),
      photoUrl: photoUrl || null
    };

    // New complaint ko top par insert karte hain (LIFO - Newest first)
    const updatedComplaints = [newComplaint, ...this.complaints];

    // Storage me persist karo
    const saveResult = storageService.saveComplaints(updatedComplaints);
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    // Memory cache update
    this.complaints = updatedComplaints;

    return {
      success: true,
      complaint: newComplaint
    };
  }

  /**
   * Dashboard Counters calculate karta hai.
   * @returns {{ total: number, pending: number, inProgress: number, resolved: number }}
   */
  getDashboardStats() {
    this.complaints = storageService.loadComplaints();
    
    return this.complaints.reduce(
      (stats, complaint) => {
        stats.total++;
        if (complaint.status === CONFIG.STATUSES.PENDING) {
          stats.pending++;
        } else if (complaint.status === CONFIG.STATUSES.IN_PROGRESS) {
          stats.inProgress++;
        } else if (complaint.status === CONFIG.STATUSES.RESOLVED) {
          stats.resolved++;
        }
        return stats;
      },
      { total: 0, pending: 0, inProgress: 0, resolved: 0 }
    );
  }

  /**
   * Search aur Filter logic execute karta hai.
   * @param {{ query?: string, category?: string, status?: string }} filters
   * @returns {Array<Object>}
   */
  filterComplaints({ query = '', category = 'All', status = 'All' } = {}) {
    this.complaints = storageService.loadComplaints();
    const cleanQuery = query.trim().toLowerCase();

    return this.complaints.filter(complaint => {
      // 1. Text Search: ID, Title, Category, Location
      const matchesQuery = 
        !cleanQuery ||
        complaint.id.toLowerCase().includes(cleanQuery) ||
        complaint.title.toLowerCase().includes(cleanQuery) ||
        complaint.category.toLowerCase().includes(cleanQuery) ||
        complaint.location.toLowerCase().includes(cleanQuery) ||
        complaint.description.toLowerCase().includes(cleanQuery);

      // 2. Category Filter
      const matchesCategory = 
        category === 'All' || complaint.category === category;

      // 3. Status Filter
      const matchesStatus = 
        status === 'All' || complaint.status === status;

      return matchesQuery && matchesCategory && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Demo Data reset karta hai.
   * @returns {Array<Object>}
   */
  resetDemoData() {
    this.complaints = storageService.resetToSampleData();
    return this.getAllComplaints();
  }
}

// Singleton instance export
export const complaintService = new ComplaintService();
