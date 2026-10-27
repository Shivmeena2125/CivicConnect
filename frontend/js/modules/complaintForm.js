/**
 * CivicConnect — Complaint Report Form Module
 * 
 * Yeh module complaint report form ki client-side validation,
 * image selection, format checking, client-side canvas compression/resizing,
 * photo preview, aur complaint submission ko handle karta hai.
 */

import { CONFIG } from '../config.js';
import { complaintService } from '../services/complaintService.js';

export class ComplaintForm {
  constructor(options = {}) {
    this.formEl = document.getElementById('complaint-form');
    this.modalEl = document.getElementById('report-modal');
    this.openModalBtn = document.getElementById('open-report-btn');
    this.closeModalBtn = document.getElementById('close-report-modal');
    this.cancelBtn = document.getElementById('cancel-report-btn');

    // Input fields
    this.titleInput = document.getElementById('input-title');
    this.categorySelect = document.getElementById('input-category');
    this.locationInput = document.getElementById('input-location');
    this.descInput = document.getElementById('input-description');
    this.photoInput = document.getElementById('input-photo');

    // Preview elements
    this.previewContainer = document.getElementById('photo-preview-container');
    this.previewImage = document.getElementById('photo-preview-img');
    this.previewName = document.getElementById('photo-preview-name');
    this.removePhotoBtn = document.getElementById('remove-photo-btn');
    this.photoErrorEl = document.getElementById('photo-error');

    // Error messages
    this.titleError = document.getElementById('title-error');
    this.categoryError = document.getElementById('category-error');
    this.locationError = document.getElementById('location-error');
    this.descError = document.getElementById('description-error');
    this.formAlert = document.getElementById('form-alert');

    // State
    this.currentCompressedPhotoUrl = null;
    this.onSubmitSuccess = options.onSubmitSuccess || null;
    this.showToast = options.showToast || null;

    this.initEvents();
  }

  initEvents() {
    // Modal Open / Close buttons
    if (this.openModalBtn) {
      this.openModalBtn.addEventListener('click', () => this.openModal());
    }
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => this.closeModal());
    }
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', () => this.closeModal());
    }

    // Modal background click
    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) {
          this.closeModal();
        }
      });
    }

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl && !this.modalEl.classList.contains('hidden')) {
        this.closeModal();
      }
    });

    // Photo input change event
    if (this.photoInput) {
      this.photoInput.addEventListener('change', (e) => this.handlePhotoSelect(e));
    }

    // Remove photo button
    if (this.removePhotoBtn) {
      this.removePhotoBtn.addEventListener('click', () => this.clearPhoto());
    }

    // Form submit event
    if (this.formEl) {
      this.formEl.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Real-time clearing of error on user input
    [this.titleInput, this.categorySelect, this.locationInput, this.descInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => this.clearFieldError(input));
      }
    });
  }

  openModal() {
    this.resetForm();
    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
      document.body.classList.add('modal-open');
      if (this.titleInput) this.titleInput.focus();
    }
  }

  closeModal() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
    this.resetForm();
  }

  /**
   * Photo select hone par validate aur HTML5 Canvas se compress/resize karta hai.
   */
  async handlePhotoSelect(e) {
    this.setPhotoError('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // 1. File Type Validation
    if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      this.setPhotoError('Invalid file type! Sirf JPG, PNG ya WebP images hi allowed hain.');
      this.clearPhoto();
      return;
    }

    // 2. File Size Validation (Max 2MB)
    if (file.size > CONFIG.MAX_IMAGE_SIZE_BYTES) {
      this.setPhotoError('File size bahut badi hai! Photo 2MB se kam honi chahiye.');
      this.clearPhoto();
      return;
    }

    // 3. Compress & Resize using Canvas to prevent localStorage quota issues
    try {
      const compressedDataUrl = await this.resizeAndCompressImage(file);
      this.currentCompressedPhotoUrl = compressedDataUrl;

      // Show preview
      if (this.previewImage) this.previewImage.src = compressedDataUrl;
      if (this.previewName) this.previewName.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
      if (this.previewContainer) this.previewContainer.classList.remove('hidden');
    } catch (err) {
      console.error('Error processing image:', err);
      this.setPhotoError('Image process karne me error aaya. Kripya doosri photo chunein.');
      this.clearPhoto();
    }
  }

  /**
   * Client-side Image compression helper using HTML5 Canvas.
   * Large photos ko max 800px dimension aur 0.75 quality JPEG me convert karta hai.
   */
  resizeAndCompressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = CONFIG.MAX_CANVAS_DIMENSION;
          let width = img.width;
          let height = img.height;

          // Aspect ratio preserve karte hue scale calculate karo
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Lightweight JPEG Data URL create karo
          const dataUrl = canvas.toDataURL('image/jpeg', CONFIG.CANVAS_QUALITY);
          resolve(dataUrl);
        };

        img.onerror = () => reject(new Error('Invalid image data'));
        img.src = readerEvent.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  clearPhoto() {
    this.currentCompressedPhotoUrl = null;
    if (this.photoInput) this.photoInput.value = '';
    if (this.previewContainer) this.previewContainer.classList.add('hidden');
    if (this.previewImage) this.previewImage.src = '';
    if (this.previewName) this.previewName.textContent = '';
  }

  setPhotoError(msg) {
    if (this.photoErrorEl) {
      this.photoErrorEl.textContent = msg;
      if (msg) {
        this.photoErrorEl.classList.remove('hidden');
      } else {
        this.photoErrorEl.classList.add('hidden');
      }
    }
  }

  clearFieldError(input) {
    input.classList.remove('input-invalid');
    const errorMap = {
      'input-title': this.titleError,
      'input-category': this.categoryError,
      'input-location': this.locationError,
      'input-description': this.descError
    };
    const targetError = errorMap[input.id];
    if (targetError) {
      targetError.textContent = '';
      targetError.classList.add('hidden');
    }
    if (this.formAlert) {
      this.formAlert.classList.add('hidden');
      this.formAlert.textContent = '';
    }
  }

  validateForm() {
    let isValid = true;

    // Title validation
    const titleVal = this.titleInput.value.trim();
    if (!titleVal) {
      this.showFieldError(this.titleInput, this.titleError, 'Complaint Title required hai.');
      isValid = false;
    } else if (titleVal.length < 5) {
      this.showFieldError(this.titleInput, this.titleError, 'Title kam se kam 5 characters ka hona chahiye.');
      isValid = false;
    }

    // Category validation
    const catVal = this.categorySelect.value.trim();
    if (!catVal || !CONFIG.CATEGORIES.includes(catVal)) {
      this.showFieldError(this.categorySelect, this.categoryError, 'Kripya ek valid category select karein.');
      isValid = false;
    }

    // Location validation
    const locVal = this.locationInput.value.trim();
    if (!locVal) {
      this.showFieldError(this.locationInput, this.locationError, 'Location required hai.');
      isValid = false;
    } else if (locVal.length < 5) {
      this.showFieldError(this.locationInput, this.locationError, 'Location kam se kam 5 characters ki honi chahiye.');
      isValid = false;
    }

    // Description validation
    const descVal = this.descInput.value.trim();
    if (!descVal) {
      this.showFieldError(this.descInput, this.descError, 'Description required hai.');
      isValid = false;
    } else if (descVal.length < 10) {
      this.showFieldError(this.descInput, this.descError, 'Description kam se kam 10 characters ka hona chahiye.');
      isValid = false;
    }

    return isValid;
  }

  showFieldError(input, errorEl, message) {
    input.classList.add('input-invalid');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      if (this.formAlert) {
        this.formAlert.textContent = 'Kripya form ke sabhi required fields ko sahi se bharein.';
        this.formAlert.className = 'form-alert form-alert-error';
        this.formAlert.classList.remove('hidden');
      }
      return;
    }

    const complaintData = {
      title: this.titleInput.value.trim(),
      category: this.categorySelect.value.trim(),
      location: this.locationInput.value.trim(),
      description: this.descInput.value.trim(),
      photoUrl: this.currentCompressedPhotoUrl // optional, can be null
    };

    // Business service call
    const result = complaintService.createComplaint(complaintData);

    if (result.success) {
      this.closeModal();

      if (this.showToast) {
        this.showToast(
          `Complaint successfully registered! Assigned ID: ${result.complaint.id}`,
          'success'
        );
      }

      if (this.onSubmitSuccess) {
        this.onSubmitSuccess(result.complaint);
      }
    } else {
      if (this.formAlert) {
        this.formAlert.textContent = result.error || 'Complaint save karne me error aaya.';
        this.formAlert.className = 'form-alert form-alert-error';
        this.formAlert.classList.remove('hidden');
      }
    }
  }

  resetForm() {
    if (this.formEl) this.formEl.reset();
    this.clearPhoto();
    this.setPhotoError('');

    [this.titleInput, this.categorySelect, this.locationInput, this.descInput].forEach(input => {
      if (input) this.clearFieldError(input);
    });

    if (this.formAlert) {
      this.formAlert.textContent = '';
      this.formAlert.classList.add('hidden');
    }
  }
}
