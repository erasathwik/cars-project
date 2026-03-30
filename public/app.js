// State Management
let currentUser = JSON.parse(localStorage.getItem('cars_user')) || null;
let currentAdmin = JSON.parse(localStorage.getItem('cars_admin')) || null;
let allItems = [];
let myClaims = [];
let allClaims = [];

// API Client
const API_URL = '/api';

async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

// UI Utilities
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

function showToast(message, type = 'success') {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.className = 'toast', 3000);
}

// Navigation & Routing
function navigate(viewId) {
  // Hide all views
  $$('.view').forEach(v => v.classList.remove('active'));
  $(`#${viewId}-view`).classList.add('active');
  
  // Re-render nav
  renderNav();
  
  // Load initial data based on view
  if (viewId === 'items') loadItems();
  if (viewId === 'my-posts' && currentUser) loadMyPosts();
  if (viewId === 'my-claims' && currentUser) loadMyClaims();
  if (viewId === 'admin-dashboard' && currentAdmin) loadAdminData();
  
  lucide.createIcons();
}

function renderNav() {
  const navLinks = $('#nav-links');
  navLinks.innerHTML = ''; // Clear

  if (currentAdmin) {
    navLinks.innerHTML = `
      <div class="user-menu"><i data-lucide="shield"></i> Admin: ${currentAdmin.name || currentAdmin.email}</div>
      <button class="nav-btn" onclick="navigate('admin-dashboard')">Dashboard</button>
      <button class="btn btn-ghost" onclick="logoutAdmin()">Logout</button>
    `;
  } else if (currentUser) {
    navLinks.innerHTML = `
      <a class="nav-link" onclick="navigate('items')">Items</a>
      <a class="nav-link" onclick="navigate('post-item')">Report Found</a>
      <a class="nav-link" onclick="navigate('my-posts')">My Reports</a>
      <a class="nav-link" onclick="navigate('my-claims')">My Claims</a>
      <div class="user-menu ml-4"><i data-lucide="user"></i> ${currentUser.name}</div>
      <button class="btn btn-ghost" onclick="logoutUser()">Logout</button>
    `;
  } else {
    navLinks.innerHTML = `
      <a class="nav-link" onclick="navigate('items')">Browse Items</a>
      <button class="btn btn-ghost" onclick="navigate('login')">Sign In</button>
      <button class="nav-btn" onclick="navigate('signup')">Sign Up</button>
    `;
  }
  lucide.createIcons();
}

// Auth Actions
async function handleLogin(e) {
  e.preventDefault();
  const email = $('#login-email').value;
  const password = $('#login-password').value;
  const btn = $('#login-btn');
  btn.innerText = 'Signing in...'; btn.disabled = true;
  
  try {
    const data = await fetchAPI('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    currentUser = data.profile || data.user; // Depends on backend return form
    localStorage.setItem('cars_user', JSON.stringify(currentUser));
    localStorage.removeItem('cars_admin');
    currentAdmin = null;
    showToast('Logged in successfully!');
    navigate('items');
  } catch (error) {
    $('#login-error').textContent = error.message;
    $('#login-error').style.display = 'block';
  } finally {
    btn.innerHTML = '<span>Sign In</span>'; btn.disabled = false;
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const userData = {
    name: $('#signup-name').value,
    roll_number: $('#signup-roll').value,
    branch: $('#signup-branch').value,
    mobile_number: $('#signup-mobile').value,
    email: $('#signup-email').value,
    password: $('#signup-password').value,
  };
  const btn = $('#signup-btn');
  btn.innerText = 'Creating account...'; btn.disabled = true;

  try {
    await fetchAPI('/signup', { method: 'POST', body: JSON.stringify(userData) });
    showToast('Account created! Please sign in.');
    navigate('login');
  } catch (error) {
    $('#signup-error').textContent = error.message;
    $('#signup-error').style.display = 'block';
  } finally {
    btn.innerHTML = '<span>Create Account</span>'; btn.disabled = false;
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const email = $('#admin-email').value;
  const password = $('#admin-password').value;
  const btn = $('#admin-login-btn');
  btn.innerText = 'Accessing...'; btn.disabled = true;

  try {
    const data = await fetchAPI('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    currentAdmin = data.admin;
    localStorage.setItem('cars_admin', JSON.stringify(currentAdmin));
    localStorage.removeItem('cars_user');
    currentUser = null;
    showToast('Admin access granted');
    navigate('admin-dashboard');
  } catch (error) {
    $('#admin-login-error').textContent = error.message;
    $('#admin-login-error').style.display = 'block';
  } finally {
    btn.innerHTML = '<span>Access Portal</span>'; btn.disabled = false;
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('cars_user');
  showToast('Logged out');
  navigate('home');
}

function logoutAdmin() {
  currentAdmin = null;
  localStorage.removeItem('cars_admin');
  showToast('Admin logged out');
  navigate('home');
}

// Items Handling
async function loadItems() {
  $('#items-container').innerHTML = '<p class="text-gray">Loading items...</p>';
  try {
    allItems = await fetchAPI('/items');
    renderItems();
  } catch (error) {}
}

function renderItems() {
  const container = $('#items-container');
  const search = $('#search-items').value.toLowerCase();
  const category = $('#category-filter').value;
  
  let filtered = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
    const matchesCategory = category ? item.category === category : true;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p class="col-span-full text-center text-gray">No items found matching your criteria.</p>`;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="card item-card">
      <div class="card-image-wrap">
        <img src="${item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" 
             alt="${item.title}" class="card-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      </div>
      <div class="card-header">
        <h3 class="card-title">${item.title}</h3>
        <span class="badge badge-${item.status}">${item.status}</span>
      </div>
      <div class="card-meta">
        <i data-lucide="tag"></i> <span style="text-transform:capitalize">${item.category || 'General'}</span>
      </div>
      <div class="card-meta">
        <i data-lucide="map-pin"></i> <span>Found at: ${item.location_found}</span>
      </div>
      <div class="card-meta mb-4">
        <i data-lucide="clock"></i> <span>${new Date(item.created_at).toLocaleDateString()}</span>
      </div>
      <p class="card-desc">${item.description}</p>
      
      ${item.status === 'found' ? `
        <button class="btn btn-primary btn-block mt-4" onclick="initClaim('${item.id}')">
          Claim this item
        </button>
      ` : `
        <button class="btn btn-outline btn-block mt-4" disabled>
           Already ${item.status}
        </button>
      `}
    </div>
  `).join('');

  lucide.createIcons();
}

async function loadMyPosts() {
  const container = $('#my-posts-container');
  if (!allItems.length) await loadItems();
  const myPosts = allItems.filter(i => i.posted_by === currentUser.id);
  
  if (!myPosts.length) {
    container.innerHTML = '<p>You haven\'t reported any found items yet.</p>';
    return;
  }
  // Render similar to renderItems just a subset
  container.innerHTML = myPosts.map(item => `
    <div class="card border border-primary">
      <div class="card-header">
        <h3 class="card-title">${item.title}</h3>
        <span class="badge badge-${item.status}">${item.status}</span>
      </div>
      <p class="card-desc mt-2">${item.description}</p>
      <div class="card-meta mt-2">
        <i data-lucide="map-pin"></i> <span>Location: ${item.location_found}</span>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

// Posting Item Workflow
function addQuestionField() {
  const container = $('#questions-container');
  const div = document.createElement('div');
  div.className = 'question-row';
  div.innerHTML = `
    <input type="text" class="q-input" placeholder="Question" required>
    <input type="text" class="a-input" placeholder="Expected Answer" required>
    <button type="button" class="btn btn-ghost text-danger" onclick="this.parentElement.remove()"><i data-lucide="trash-2"></i></button>
  `;
  container.appendChild(div);
  lucide.createIcons();
}

async function handlePostItem(e) {
  e.preventDefault();
  if (!currentUser) return showToast('Please login to post items', 'error');

  const questions = Array.from($$('.question-row')).map(row => ({
    question: row.querySelector('.q-input').value,
    answer: row.querySelector('.a-input').value
  })).filter(q => q.question && q.answer);

  const itemData = {
    title: $('#item-title').value,
    category: $('#item-category').value,
    location_found: $('#item-location').value,
    description: $('#item-desc').value,
    image_url: $('#item-image').value,
    posted_by: currentUser.id,
    questions
  };

  const btn = $('#post-item-btn');
  btn.innerText = 'Submitting...'; btn.disabled = true;

  try {
    await fetchAPI('/items', { method: 'POST', body: JSON.stringify(itemData) });
    showToast('Item successfully reported!');
    $('#post-item-form').reset();
    $('#questions-container').innerHTML = `
      <div class="question-row">
        <input type="text" class="q-input" placeholder="Question 1" required>
        <input type="text" class="a-input" placeholder="Expected Answer" required>
      </div>
    `;
    navigate('items');
  } catch (error) {
    $('#post-error').textContent = error.message;
    $('#post-error').style.display = 'block';
  } finally {
    btn.innerText = 'Submit Item'; btn.disabled = false;
  }
}

// Claiming Workflow
async function initClaim(itemId) {
  if (!currentUser) return navigate('login');
  
  $('#claim-item-id').value = itemId;
  $('#claim-error').style.display = 'none';
  const container = $('#claim-questions-container');
  container.innerHTML = '<p class="text-sm">Loading security questions...</p>';
  $('#claim-modal').classList.add('active');

  try {
    const questions = await fetchAPI(`/items/${itemId}/questions`);
    if (!questions || questions.length === 0) {
      container.innerHTML = `
        <p class="mb-4">No security questions set for this item.</p>
        <div class="form-group">
          <label>Provide proof of ownership (Details, exact contents, etc):</label>
          <textarea id="general-proof" class="claim-answer-input" rows="3" required></textarea>
        </div>
      `;
    } else {
      container.innerHTML = questions.map((q, idx) => `
        <div class="form-group">
          <label>Q: ${q.question}</label>
          <input type="text" data-qid="${q.id}" data-qtext="${q.question}" class="claim-answer-input" placeholder="Your answer" required>
        </div>
      `).join('');
    }
  } catch (err) {
    container.innerHTML = `<p class="error-msg">Failed to load questions: ${err.message}</p>`;
  }
}

function closeModal(id) {
  $(`#${id}`).classList.remove('active');
}

async function handleClaimSubmit(e) {
  e.preventDefault();
  const itemId = $('#claim-item-id').value;
  const btn = $('#claim-submit-btn');
  
  // Gather answers
  let answers = {};
  const inputs = $$('.claim-answer-input');
  if (inputs.length === 1 && inputs[0].id === 'general-proof') {
    answers = { proof: inputs[0].value };
  } else {
    inputs.forEach(input => {
      answers[input.getAttribute('data-qtext')] = input.value;
    });
  }

  btn.innerText = 'Submitting...'; btn.disabled = true;

  try {
    await fetchAPI('/claim', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, claimed_by: currentUser.id, answers })
    });
    showToast('Claim submitted successfully! Awaiting admin approval.');
    closeModal('claim-modal');
  } catch (error) {
    $('#claim-error').textContent = error.message;
    $('#claim-error').style.display = 'block';
  } finally {
    btn.innerText = 'Submit Claim'; btn.disabled = false;
  }
}

async function loadMyClaims() {
  const container = $('#my-claims-container');
  container.innerHTML = '<p>Loading claims...</p>';
  try {
    myClaims = await fetchAPI(`/claims/user/${currentUser.id}`);
    if (myClaims.length === 0) {
      container.innerHTML = '<p>You have not made any claims yet.</p>';
      return;
    }
    
    container.innerHTML = myClaims.map(claim => `
      <div class="card mb-4" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 class="card-title">${claim.items?.title || 'Unknown Item'}</h3>
          <p class="text-sm mt-1">Claim Date: ${new Date(claim.created_at).toLocaleDateString()}</p>
        </div>
        <span class="badge badge-${claim.status}">${claim.status}</span>
      </div>
    `).join('');
  } catch (err) {}
}

// Admin Dashboard
function switchAdminTab(tabName) {
  $$('.admin-nav-link').forEach(l => l.classList.remove('active'));
  $(`#tab-admin-${tabName}`).classList.add('active');
  
  $$('.admin-tab').forEach(t => t.classList.remove('active'));
  $(`#admin-${tabName}-tab`).classList.add('active');
}

async function loadAdminData() {
  try {
    const [items, claims] = await Promise.all([
      fetchAPI('/admin/items'),
      fetchAPI('/admin/claims')
    ]);
    allClaims = claims;
    
    // Render Admin Items
    $('#admin-items-table').innerHTML = items.map(item => `
      <tr>
        <td><strong>${item.title}</strong></td>
        <td><span style="text-transform:capitalize">${item.category}</span></td>
        <td>${item.location_found}</td>
        <td>${item.users?.name || 'Unknown'}</td>
        <td><span class="badge badge-${item.status}">${item.status}</span></td>
        <td>${new Date(item.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
    
    // Render Admin Claims
    $('#admin-claims-container').innerHTML = claims.map(claim => {
      const answers = claim.proof;
      let proofHtml = '';
      try {
        const parsed = JSON.parse(answers);
        proofHtml = Object.entries(parsed).map(([q,a]) => `<p class="text-sm mt-2"><strong>Q:</strong> ${q} <br/> <strong>A:</strong> ${a}</p>`).join('');
      } catch(e) { proofHtml = `<p class="text-sm mt-2">${answers}</p>`; }
      
      return `
      <div class="card">
        <div class="card-header border-b pb-2 mb-2">
          <h4>Item: ${claim.items?.title}</h4>
          <span class="badge badge-${claim.status}">${claim.status}</span>
        </div>
        <div class="mt-2">
          <p class="text-sm"><strong>Claimant:</strong> ${claim.users?.name} (${claim.users?.roll_number})</p>
          <p class="text-sm"><strong>Email:</strong> ${claim.users?.email}</p>
        </div>
        <div class="bg-gray-50 p-3 rounded mt-3" style="background:var(--bg-color); padding: 1rem; border-radius: var(--radius-md);">
          <h5 class="text-sm border-b pb-1 mb-2">Provided Proof</h5>
          ${proofHtml}
        </div>
        ${claim.status === 'pending' ? `
          <div class="flex gap-2 mt-4" style="display:flex; gap: 0.5rem; margin-top: 1rem;">
            <button class="btn btn-success btn-sm w-full" onclick="verifyClaim('${claim.id}', '${claim.item_id}', 'approved')">Approve</button>
            <button class="btn btn-danger btn-sm w-full" onclick="verifyClaim('${claim.id}', '${claim.item_id}', 'rejected')">Reject</button>
          </div>
        ` : ''}
      </div>
    `}).join('');
    
  } catch (err) {
    showToast('Failed to load admin data', 'error');
  }
}

async function verifyClaim(claimId, itemId, status) {
  if (!confirm(`Are you sure you want to ${status} this claim?`)) return;
  
  try {
    await fetchAPI('/admin/verify-claim', {
      method: 'POST',
      body: JSON.stringify({ claim_id: claimId, item_id: itemId, status })
    });
    showToast(`Claim ${status} successfully`);
    loadAdminData(); // Refresh
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Initialization & Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  lucide.createIcons();
  
  // Decide initial view
  if (currentAdmin) {
    navigate('admin-dashboard');
  } else if (currentUser) {
    navigate('items');
  } else {
    navigate('home');
  }

  // Attach precise listeners
  $('#login-form').addEventListener('submit', handleLogin);
  $('#signup-form').addEventListener('submit', handleSignup);
  $('#admin-login-form').addEventListener('submit', handleAdminLogin);
  $('#post-item-form').addEventListener('submit', handlePostItem);
  $('#claim-form').addEventListener('submit', handleClaimSubmit);
  
  // Filter listeners
  $('#search-items').addEventListener('input', renderItems);
  $('#category-filter').addEventListener('change', renderItems);
});
