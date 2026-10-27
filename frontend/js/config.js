/**
 * CivicConnect — Configuration and Constants
 * 
 * Yeh file pure project ke configuration settings aur sample demo data ko
 * ek jagah centrally manage karti hai.
 */

// SVG placeholder images for sample data (Lightweight Data URIs)
const sampleRoadSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23334155"/><rect y="130" width="400" height="40" fill="%23475569"/><line x1="20" y1="150" x2="100" y2="150" stroke="%23fbbf24" stroke-width="6" stroke-dasharray="16,16"/><line x1="140" y1="150" x2="260" y2="150" stroke="%23fbbf24" stroke-width="6" stroke-dasharray="16,16"/><line x1="300" y1="150" x2="380" y2="150" stroke="%23fbbf24" stroke-width="6" stroke-dasharray="16,16"/><ellipse cx="200" cy="180" rx="60" ry="25" fill="%231e293b"/><text x="200" y="240" fill="%23f8fafc" font-size="16" font-family="sans-serif" text-anchor="middle" font-weight="bold">Road Damage Evidence</text></svg>';

const sampleGarbageSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><rect x="130" y="90" width="140" height="150" rx="8" fill="%2310b981"/><path d="M120 90 L280 90" stroke="%23059669" stroke-width="8" stroke-linecap="round"/><circle cx="160" cy="150" r="12" fill="%23ffffff" opacity="0.4"/><circle cx="200" cy="150" r="12" fill="%23ffffff" opacity="0.4"/><circle cx="240" cy="150" r="12" fill="%23ffffff" opacity="0.4"/><text x="200" y="275" fill="%23f8fafc" font-size="16" font-family="sans-serif" text-anchor="middle" font-weight="bold">Overflowing Bin Evidence</text></svg>';

export const CONFIG = {
  APP_NAME: 'CivicConnect',
  VERSION: '1.0.0',
  STORAGE_KEY: 'civicconnect_complaints_v1',
  
  // Image handling limits
  MAX_IMAGE_SIZE_BYTES: 2 * 1024 * 1024, // 2MB max upload limit
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_CANVAS_DIMENSION: 800, // Resize to max 800px width/height for localStorage safety
  CANVAS_QUALITY: 0.75, // 75% JPEG compression quality
  
  // Categories & Statuses
  CATEGORIES: [
    'Road Damage',
    'Garbage',
    'Streetlight',
    'Water Leakage',
    'Other'
  ],
  
  STATUSES: {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved'
  },
  
  // Initial Sample Demo Complaints (Default Seed Data)
  SAMPLE_COMPLAINTS: [
    {
      id: 'CC-2026-1001',
      title: 'Deep Pothole near City Hospital Gate 2',
      category: 'Road Damage',
      location: 'MG Road, Near City Civil Hospital',
      description: 'A deep pothole has formed in the middle of the road causing severe traffic slowdown and multiple two-wheeler skids. Needs urgent asphalt patching.',
      status: 'Pending',
      createdAt: '2026-10-24T09:30:00.000Z',
      photoUrl: sampleRoadSvg
    },
    {
      id: 'CC-2026-1002',
      title: 'Overflowing Community Garbage Dumpster',
      category: 'Garbage',
      location: 'Sector 4 Central Market, Opp. Post Office',
      description: 'Municipal garbage bin has not been cleared for over 4 days. Waste is overflowing onto the pedestrian pathway creating health hazards and bad odor.',
      status: 'In Progress',
      createdAt: '2026-10-25T14:15:00.000Z',
      photoUrl: sampleGarbageSvg
    },
    {
      id: 'CC-2026-1003',
      title: 'Non-Functional Streetlights on Main Crossing',
      category: 'Streetlight',
      location: 'Ring Road Crossing 7, Near Metro Pillar 142',
      description: 'Three consecutive street lights have been broken for a week. The stretch is completely dark at night and risky for pedestrians and vehicles.',
      status: 'Resolved',
      createdAt: '2026-10-22T18:45:00.000Z',
      photoUrl: null
    },
    {
      id: 'CC-2026-1004',
      title: 'Clean Water Main Pipeline Leakage',
      category: 'Water Leakage',
      location: 'Block B Residential Park, Water Tank Road',
      description: 'Fresh drinking water is leaking from the underground main supply valve since yesterday morning. Thousands of liters of water are getting wasted continuously.',
      status: 'Pending',
      createdAt: '2026-10-26T08:00:00.000Z',
      photoUrl: null
    }
  ]
};
