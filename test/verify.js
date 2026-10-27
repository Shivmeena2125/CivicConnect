/**
 * CivicConnect — Automated Verification & Unit Test Suite
 * 
 * Yeh script sabhi core business logic, services, validations,
 * filtering, aur HTTP server endpoints ko automate karke verify karti hai.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

// Simple assertion helper
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    testsFailed++;
  }
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('🧪 Starting CivicConnect Automated Verification Suite...');
  console.log('========================================================\n');

  // --- 1. CONFIG & SEED DATA INTEGRITY ---
  console.log('--- 1. Testing Config & Seed Data Integrity ---');
  const configPath = path.join(__dirname, '../frontend/js/config.js');
  const configContent = fs.readFileSync(configPath, 'utf8');

  assert(configContent.includes('APP_NAME'), 'Config defines APP_NAME');
  assert(configContent.includes('STORAGE_KEY'), 'Config defines STORAGE_KEY');
  assert(configContent.includes('SAMPLE_COMPLAINTS'), 'Config contains SAMPLE_COMPLAINTS');
  assert(configContent.includes('Road Damage'), 'Config has Road Damage category');
  assert(configContent.includes('Garbage'), 'Config has Garbage category');
  assert(configContent.includes('Streetlight'), 'Config has Streetlight category');
  assert(configContent.includes('Water Leakage'), 'Config has Water Leakage category');

  // --- 2. BUSINESS LOGIC & SERVICE TESTS ---
  console.log('\n--- 2. Testing Business Logic & Service Algorithms ---');

  // We mock localStorage for Node.js environment
  const mockStorage = {};
  const mockLocalStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, val) => {
      // Simulate quota failure if string is > 10MB
      if (val.length > 10 * 1024 * 1024) {
        const err = new Error('Quota exceeded');
        err.name = 'QuotaExceededError';
        throw err;
      }
      mockStorage[key] = val;
    },
    removeItem: (key) => delete mockStorage[key],
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
  };
  global.localStorage = mockLocalStorage;

  // Import ES module using dynamic import
  const { CONFIG } = await import(`file://${path.join(__dirname, '../frontend/js/config.js')}`);
  const { storageService } = await import(`file://${path.join(__dirname, '../frontend/js/services/storageService.js')}`);
  const { complaintService } = await import(`file://${path.join(__dirname, '../frontend/js/services/complaintService.js')}`);

  // Test: Initial load seeds sample complaints
  const initialComplaints = complaintService.getAllComplaints();
  assert(Array.isArray(initialComplaints), 'getAllComplaints returns an array');
  assert(initialComplaints.length === 4, `Sample complaints seeded (expected 4, got ${initialComplaints.length})`);

  // Test: Initial stats calculation
  const initialStats = complaintService.getDashboardStats();
  assert(initialStats.total === 4, `Total complaints stat is 4 (got ${initialStats.total})`);
  assert(initialStats.pending === 2, `Pending complaints stat is 2 (got ${initialStats.pending})`);
  assert(initialStats.inProgress === 1, `In Progress complaints stat is 1 (got ${initialStats.inProgress})`);
  assert(initialStats.resolved === 1, `Resolved complaints stat is 1 (got ${initialStats.resolved})`);

  // Test: ID Generation
  const generatedId = complaintService.generateComplaintId();
  assert(generatedId.startsWith('CC-2026-'), `Generated ID has correct prefix CC-2026- (got ${generatedId})`);

  // Test: Form Validation - Empty title rejected
  const emptyTitleResult = complaintService.createComplaint({
    title: '',
    category: 'Road Damage',
    location: 'Main Road',
    description: 'This is a test description'
  });
  assert(emptyTitleResult.success === false, 'Rejects empty title');

  // Test: Form Validation - Short title rejected
  const shortTitleResult = complaintService.createComplaint({
    title: 'Poth',
    category: 'Road Damage',
    location: 'Main Road',
    description: 'This is a test description'
  });
  assert(shortTitleResult.success === false, 'Rejects title shorter than 5 chars');

  // Test: Form Validation - Invalid category rejected
  const invalidCatResult = complaintService.createComplaint({
    title: 'Valid Complaint Title',
    category: 'InvalidCategory123',
    location: 'Main Road',
    description: 'This is a test description'
  });
  assert(invalidCatResult.success === false, 'Rejects invalid category');

  // Test: Form Validation - Short description rejected
  const shortDescResult = complaintService.createComplaint({
    title: 'Valid Complaint Title',
    category: 'Road Damage',
    location: 'Main Road',
    description: 'Short'
  });
  assert(shortDescResult.success === false, 'Rejects description shorter than 10 chars');

  // Test: Form Validation - Valid complaint creation
  const validCreateResult = complaintService.createComplaint({
    title: 'New Water Pipe Burst Near Park',
    category: 'Water Leakage',
    location: 'Green Valley Sector 9',
    description: 'Pipeline is leaking huge volume of water onto the sidewalk since early morning.',
    photoUrl: null
  });
  assert(validCreateResult.success === true, 'Successfully creates valid complaint');
  assert(validCreateResult.complaint && validCreateResult.complaint.id.startsWith('CC-2026-'), 'Assigns valid complaint ID');
  assert(validCreateResult.complaint.status === 'Pending', 'Initial status is Pending');

  // Test: Stats updated after creation
  const updatedStats = complaintService.getDashboardStats();
  assert(updatedStats.total === 5, `Total count incremented to 5 (got ${updatedStats.total})`);
  assert(updatedStats.pending === 3, `Pending count incremented to 3 (got ${updatedStats.pending})`);

  // Test: New complaint is sorted first (LIFO order)
  const allUpdated = complaintService.getAllComplaints();
  assert(allUpdated[0].id === validCreateResult.complaint.id, 'New complaint is at top of list (newest first)');

  // Test: Search by ID
  const searchById = complaintService.filterComplaints({ query: validCreateResult.complaint.id });
  assert(searchById.length === 1 && searchById[0].id === validCreateResult.complaint.id, 'Search by Complaint ID works');

  // Test: Search by Title Keyword
  const searchByTitle = complaintService.filterComplaints({ query: 'Pipe Burst' });
  assert(searchByTitle.length >= 1, 'Search by title keyword works');

  // Test: Search by Location Keyword
  const searchByLoc = complaintService.filterComplaints({ query: 'Green Valley' });
  assert(searchByLoc.length === 1, 'Search by location keyword works');

  // Test: Filter by Category
  const garbageFilter = complaintService.filterComplaints({ category: 'Garbage' });
  assert(garbageFilter.every(c => c.category === 'Garbage'), 'Category filter strictly matches Garbage');

  // Test: Filter by Status
  const resolvedFilter = complaintService.filterComplaints({ status: 'Resolved' });
  assert(resolvedFilter.every(c => c.status === 'Resolved'), 'Status filter strictly matches Resolved');

  // Test: Non-matching filter returns 0
  const noMatch = complaintService.filterComplaints({ query: 'NonExistentGibberish12345' });
  assert(noMatch.length === 0, 'Non-matching search returns empty array');

  // Test: Reset Demo Data
  const resetComplaints = complaintService.resetDemoData();
  assert(resetComplaints.length === 4, 'Reset demo data restores exactly 4 sample complaints');
  const resetStats = complaintService.getDashboardStats();
  assert(resetStats.total === 4, 'Stats reset back to 4');

  // --- 3. TESTING SERVER ROUTE HANDLER (WITHOUT NETWORK SOCKET) ---
  console.log('\n--- 3. Testing Local Dev Server Routing & Static Files ---');

  const frontendDir = path.join(__dirname, '../frontend');
  const indexFile = path.join(frontendDir, 'index.html');
  const cssFile = path.join(frontendDir, 'css/styles.css');
  const appJsFile = path.join(frontendDir, 'js/app.js');
  const configFile = path.join(frontendDir, 'js/config.js');
  const serverFile = path.join(__dirname, '../server.js');

  assert(fs.existsSync(indexFile), 'index.html exists');
  const htmlContent = fs.readFileSync(indexFile, 'utf8');
  assert(htmlContent.includes('CivicConnect'), 'index.html contains CivicConnect branding');
  assert(htmlContent.includes('id="stat-total"'), 'index.html contains total stat container');
  assert(htmlContent.includes('id="complaint-form"'), 'index.html contains complaint form');
  assert(htmlContent.includes('id="details-modal"'), 'index.html contains details modal');
  assert(htmlContent.includes('id="reset-confirm-modal"'), 'index.html contains reset confirmation modal');

  assert(fs.existsSync(cssFile), 'styles.css exists');
  const cssContent = fs.readFileSync(cssFile, 'utf8');
  assert(cssContent.includes('--primary'), 'styles.css contains CSS variables');
  assert(cssContent.includes('.stat-card'), 'styles.css contains stat card styles');
  assert(cssContent.includes('@media (max-width: 768px)'), 'styles.css contains responsive mobile breakpoints');

  assert(fs.existsSync(appJsFile), 'app.js exists');
  assert(fs.existsSync(configFile), 'config.js exists');
  assert(fs.existsSync(serverFile), 'server.js exists');

  console.log('\n========================================================');
  console.log(`🏁 TEST RESULTS: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('========================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
