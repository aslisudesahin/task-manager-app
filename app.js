// DOM ELEMENTS
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');

const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authForm = document.getElementById('auth-form');
const authName = document.getElementById('auth-name');
const nameGroup = document.getElementById('name-group');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authMessage = document.getElementById('auth-message');
const submitAuthBtn = document.getElementById('submit-auth-btn');
const switchAuthBtn = document.getElementById('switch-auth-btn');

const userEmailDisplay = document.getElementById('user-email-display');
const logoutBtn = document.getElementById('logout-btn');

const navAddTask = document.getElementById('nav-add-task');
const navMyTasks = document.getElementById('nav-my-tasks');
const taskFormSection = document.getElementById('task-form-section');
const taskListSection = document.getElementById('task-list-section');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');
const taskDateInput = document.getElementById('task-date-input');
const myTasksFilterDropdowns = document.getElementById('my-tasks-filter-dropdowns');
const priorityFilterSelect = document.getElementById('priority-filter-select');
const taskViewTitle = document.getElementById('task-view-title');
const statusFilters = document.getElementById('status-filters');


const navDropdown = document.querySelector('.nav-dropdown');
const dropdownLinks = document.querySelectorAll('.nav-dropdown-content a');

// State tracking
let isLoginMode = true;
let currentUser = null;
let currentStatus = 'all';
let currentCategory = 'all'; 
let currentPriority = 'all';

function showMessage(text, type = 'error') {
    authMessage.textContent = text;
    authMessage.className = `auth-message ${type}`;
    authMessage.classList.remove('hidden');
}

function clearMessage() {
    authMessage.textContent = '';
    authMessage.classList.add('hidden');
}

switchAuthBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    clearMessage();
    authForm.reset();

    if (isLoginMode) {
        authTitle.textContent = "🔐 Sign In";
        authSubtitle.textContent = "Enter your credentials to access Task Manager";
        submitAuthBtn.textContent = "Sign In";
        switchAuthBtn.textContent = "Register";
        nameGroup.classList.add('hidden');
        authName.removeAttribute('required');
    } else {
        authTitle.textContent = "✨ Create Account";
        authSubtitle.textContent = "Sign up to start organizing your daily tasks";
        submitAuthBtn.textContent = "Sign Up";
        switchAuthBtn.textContent = "Back to Sign In";
        nameGroup.classList.remove('hidden');
        authName.setAttribute('required', 'true');
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    const email = authEmail.value.trim().toLowerCase();
    const password = authPassword.value.trim();
    const users = await getUsersFromServer();

    if (!isLoginMode) {
        const name = authName.value.trim();
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            showMessage("This email is already registered! Please sign in.", "error");
            return;
        }

        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            tasks: []
        };

        await saveUserstoStorage(newUser);
        showMessage("Account created successfully! Switching to sign in...", "success");
        setTimeout(() => { switchAuthBtn.click(); }, 1200);
    } else {
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            showMessage("Invalid email or password!", "error");
            return;
        }

        currentUser = user;
        const serverTasks = await getTasksFromServer(currentUser._id || currentUser.id);
        currentUser.tasks = serverTasks || [];

        console.log("--- GİRİŞ SONRASI GELEN TASKLAR ---");
        console.table(currentUser.tasks.map(t => ({ text: t.text, category: t.category, priority: t.priority })));

        userEmailDisplay.textContent = currentUser.name || currentUser.email.split('@')[0];
        showMessage("Welcome back!", "success");

        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        
        navAddTask.click();
        updateCounter();
    }
});

function renderUserTasks(tasksToRender = null) {
    taskList.innerHTML = '';
    let sourceTasks = tasksToRender || (currentUser ? currentUser.tasks : []);

    const filteredTasks = sourceTasks.filter(task => {
        if (currentStatus === 'active' && task.completed) return false;
        if (currentStatus === 'completed' && !task.completed) return false;
        
        if (currentCategory !== 'all' && task.category !== currentCategory) return false;
        if (currentPriority !== 'all' && task.priority !== currentPriority) return false;

        return true;
    });

    updateCounter();

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <li class="empty-state" style="text-align: center; padding: 3rem 1rem; color: #888; list-style: none;">
                <p style="font-size: 1.2rem; margin-bottom: 0.5rem;">📭 No tasks found here yet!</p>
                <small style="color: #aaa;">Add a new task above or change your filter.</small>
            </li>
        `;
        return; 
    }

    filteredTasks.forEach(task => {
        createTaskElement(task);
    });
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    
    const taskId = task._id || task.id;
    li.dataset.id = taskId;

    let badgeClass = ''; 
    if (task.date) {
        const dateToday = new Date(); 
        dateToday.setHours(0, 0, 0, 0); 
        const [year, month, day] = task.date.split('-');
        const dateEnter = new Date(year, month - 1, day); 
        dateEnter.setHours(0, 0, 0, 0);
       
        const diffTime = dateEnter - dateToday;
        const leftDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
        if (leftDay <= 0) badgeClass = 'deadline-danger'; 
        else if (leftDay <= 3) badgeClass = 'deadline-warning'; 
        else badgeClass = 'deadline-safe';   
    }

    const dateHtml = task.date ? `<span class="deadline-badge ${badgeClass}" title="Deadline">⏳ Due: ${task.date}</span>` : '';
    const categoryHtml = task.category ? `<span class="category-badge" style="background: #e2e8f0; color: #334155; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">🏷️ ${task.category}</span>` : '';

    const priorityMeta = {
        high: { label: 'High priority', className: 'priority-high' },
        medium: { label: 'Medium priority', className: 'priority-medium' },
        low: { label: 'Low priority', className: 'priority-low' }
    };
    const priorityInfo = priorityMeta[task.priority];
    const priorityHtml = priorityInfo ? `<span class="priority-badge ${priorityInfo.className}" title="${priorityInfo.label}" aria-label="${priorityInfo.label}"></span>` : '';

    li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            ${categoryHtml}
            ${priorityHtml}
            <span class="task-text ${task.completed ? 'Done' : ''}">${task.text}</span>
        </div>
       <div class="task-actions">
            ${dateHtml}
            <button type="button" class="btn-done ${task.completed ? 'btn-undo' : ''}">
                ${task.completed ? 'Undo' : 'Done'}
            </button>
            <button type="button" class="btn-delete">Delete</button>
       </div>
    `;

    li.querySelector('.btn-done').addEventListener('click', async () => {
        task.completed = !task.completed;
        await updateTaskOnServer(taskId, task);
        applyFiltersAndSort();
    });

    li.querySelector('.btn-delete').addEventListener('click', async () => {
        await deleteTaskFromServer(taskId);
        currentUser.tasks = currentUser.tasks.filter(t => (t._id || t.id) !== taskId);
        applyFiltersAndSort();
        showToast("Task deleted.", "info");
    });

    taskList.appendChild(li);
}

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dateValue = taskDateInput.value;
    const category = document.getElementById('task-category-input').value;
    const priority = document.getElementById('task-priority-input').value; // Priority eksikti, eklendi
    const text = taskInput.value.trim();
    
    if (!text || !currentUser) return;

    const newTask = {
        text: text,
        date: dateValue,
        category: category,
        priority: priority,
        userId: currentUser._id || currentUser.id,
        completed: false
    };

   const responseData = await saveTaskToServer(newTask);
   const savedTask = responseData?.data || responseData;

   if (savedTask) {
        currentUser.tasks.push(savedTask);
        applyFiltersAndSort();
   }
 
   showToast("Task added successfully ✨", "info");
    taskInput.value = '';
    taskDateInput.value = '';
    taskInput.focus();
});

function updateCounter() {
    const count = currentUser && currentUser.tasks ? currentUser.tasks.length : 0;
    if (taskCounter) {
        taskCounter.textContent = `${count} Task${count !== 1 ? 's' : ''}`;
    }
}

function setStatusFilter(status, btnElement) {
    currentStatus = status;
    if (btnElement) {
        const buttons = btnElement.parentElement.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }
    applyFiltersAndSort();
}

function setPriorityTab(priority) {
    currentPriority = priority;
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
  if (!currentUser) return;
  
  let result = [...currentUser.tasks]; 

  if (currentStatus === 'active') {
    result = result.filter(task => !task.completed);
  } else if (currentStatus === 'completed') {
    result = result.filter(task => task.completed);
  }

  if (currentCategory !== 'all') {
    result = result.filter(task => task.category === currentCategory);
  }

  if (currentPriority !== 'all') {
    result = result.filter(task => task.priority === currentPriority);
  }

  const sortValue = document.getElementById('sortSelect')?.value || 'default';
  if (sortValue === 'date-asc') {
    result.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  } else if (sortValue === 'date-desc') {
    result.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  } else if (sortValue === 'priority-desc') {
    const priorityWeight = { 'high': 3, 'medium': 2, 'low': 1 };
    result.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
  }

  renderUserTasks(result);
}

function sortTasks() {
    applyFiltersAndSort();
}

function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container'); 
    if (!toastContainer) return;

    const toast = document.createElement('div'); 
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast); 

    setTimeout(() => { toast.classList.add('show'); }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 300);
    }, duration);
}

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null;
    dashboardSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    authForm.reset();
    clearMessage();
});


navAddTask.addEventListener('click', (e) => {
    e.preventDefault();
    navAddTask.classList.add('active');
    navMyTasks.classList.remove('active');
    taskFormSection.classList.remove('hidden');
    statusFilters.classList.add('hidden');
    
    // Filtreleri ve açılır menüyü gizle
    myTasksFilterDropdowns.style.display = 'none'; 
    if (navDropdown) navDropdown.classList.remove('show');
    
    currentStatus = 'all';
    currentCategory = 'all';
    currentPriority = 'all';
    if(priorityFilterSelect) priorityFilterSelect.value = 'all';
    if (taskViewTitle) taskViewTitle.textContent = 'All Tasks';
    
    applyFiltersAndSort();
    taskInput.focus();
});

// dropdown menu

navMyTasks.addEventListener('click', (e) => {
    e.preventDefault();
    navDropdown.classList.toggle('show');
    navMyTasks.setAttribute('aria-expanded', navDropdown.classList.contains('show'));
});

dropdownLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const selectedCategory = e.currentTarget.getAttribute('data-category');
        
        navDropdown.classList.remove('show');
        navMyTasks.setAttribute('aria-expanded', 'false');
        
        navMyTasks.classList.add('active');
        navAddTask.classList.remove('active');
        taskFormSection.classList.add('hidden');
        statusFilters.classList.remove('hidden');
        myTasksFilterDropdowns.style.display = 'flex';
        
        if (currentUser) {
            const serverTasks = await getTasksFromServer(currentUser._id || currentUser.id);
            currentUser.tasks = serverTasks || [];
        }

        currentCategory = selectedCategory;
        if (taskViewTitle) {
            taskViewTitle.textContent = selectedCategory === 'all' ? 'All Tasks' : `${selectedCategory} Tasks`;
        }
        currentStatus = 'all';
        currentPriority = 'all';
        if(priorityFilterSelect) priorityFilterSelect.value = 'all';
        if (taskViewTitle) taskViewTitle.textContent = selectedCategory === 'all' ? 'All Tasks' : `${selectedCategory} Tasks`;
        const statusButtons = document.getElementById('status-filters').querySelectorAll('button');
        statusButtons.forEach(btn => btn.classList.remove('active'));
        document.getElementById('filter-all').classList.add('active');
    
        applyFiltersAndSort();
    });
});

window.addEventListener('click', (e) => {
    if (!e.target.closest('#nav-my-tasks')) {
        if (navDropdown && navDropdown.classList.contains('show')) {
            navDropdown.classList.remove('show');
            navMyTasks.setAttribute('aria-expanded', 'false');
        }
    }
});