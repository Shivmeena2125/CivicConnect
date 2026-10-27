/**
 * CivicConnect — Storage Service
 * 
 * Yeh service browser ke localStorage ke saath directly communicate karti hai.
 * Future mein jab Java Spring Boot backend banega, toh complaintService.js
 * is file ke bajay REST API service se baat karegi, bina UI ko change kiye.
 */

import { CONFIG } from '../config.js';

class StorageService {
  constructor() {
    this.storageKey = CONFIG.STORAGE_KEY;
  }

  /**
   * Browser mein localStorage supported aur available hai ya nahi check karta hai.
   * @returns {boolean}
   */
  isStorageAvailable() {
    try {
      const testKey = '__civic_storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage is not available in this environment:', e);
      return false;
    }
  }

  /**
   * LocalStorage se saved complaints read karta hai.
   * Agar pehli baar run ho raha ho ya data corrupt ho,
   * toh automatically default sample data seed karta hai.
   * @returns {Array<Object>}
   */
  loadComplaints() {
    if (!this.isStorageAvailable()) {
      console.warn('Falling back to in-memory sample data (localStorage unavailable)');
      return JSON.parse(JSON.stringify(CONFIG.SAMPLE_COMPLAINTS));
    }

    try {
      const rawData = localStorage.getItem(this.storageKey);
      if (!rawData) {
        // Initial first-time launch: seed demo complaints
        this.saveComplaints(CONFIG.SAMPLE_COMPLAINTS);
        return JSON.parse(JSON.stringify(CONFIG.SAMPLE_COMPLAINTS));
      }

      const parsed = JSON.parse(rawData);
      if (!Array.isArray(parsed)) {
        throw new Error('Stored data is not a valid array');
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse stored complaints data. Re-seeding sample data.', error);
      this.saveComplaints(CONFIG.SAMPLE_COMPLAINTS);
      return JSON.parse(JSON.stringify(CONFIG.SAMPLE_COMPLAINTS));
    }
  }

  /**
   * Complaints array ko localStorage mein save karta hai.
   * Storage Quota error ko safely handle karta hai taaki app crash na ho.
   * @param {Array<Object>} complaints
   * @returns {{ success: boolean, error?: string }}
   */
  saveComplaints(complaints) {
    if (!this.isStorageAvailable()) {
      return { success: false, error: 'Browser localStorage is not available.' };
    }

    try {
      const serialized = JSON.stringify(complaints);
      localStorage.setItem(this.storageKey, serialized);
      return { success: true };
    } catch (error) {
      console.error('Error saving to localStorage:', error);

      // QuotaExceededError check (code 22 in standard browsers)
      const isQuotaError = 
        error.name === 'QuotaExceededError' || 
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.code === 22;

      if (isQuotaError) {
        return {
          success: false,
          error: 'Browser demo storage full ho gaya hai! Large photos remove karein ya Demo Data reset karein.'
        };
      }

      return {
        success: false,
        error: 'Data save karte waqt unknown error aaya: ' + (error.message || 'Storage error')
      };
    }
  }

  /**
   * Demo Data ko initial 4 sample complaints par restore karta hai.
   * @returns {Array<Object>}
   */
  resetToSampleData() {
    const freshSampleData = JSON.parse(JSON.stringify(CONFIG.SAMPLE_COMPLAINTS));
    this.saveComplaints(freshSampleData);
    return freshSampleData;
  }
}

// Singleton instance export
export const storageService = new StorageService();
