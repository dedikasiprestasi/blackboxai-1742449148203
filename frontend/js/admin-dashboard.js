// API Base URL
const API_URL = 'http://localhost:8000/api';

// Check if admin is logged in
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
        window.location.href = '/index.html';
        return;
    }
    return token;
}

// Fetch dashboard statistics
async function fetchDashboardStats() {
    try {
        const token = checkAdminAuth();
        const [employees, applications, tasks, resignations] = await Promise.all([
            fetch(`${API_URL}/admin/employees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/admin/applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/admin/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/admin/resignations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const [employeesData, applicationsData, tasksData, resignationsData] = await Promise.all([
            employees.json(),
            applications.json(),
            tasks.json(),
            resignations.json()
        ]);

        updateDashboardStats({
            totalEmployees: employeesData.data.length,
            activeTasks: tasksData.data.filter(task => task.status !== 'completed').length,
            pendingApplications: applicationsData.data.length,
            pendingResignations: resignationsData.data.length
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        showError('Failed to load dashboard statistics');
    }
}

// Update dashboard statistics UI
function updateDashboardStats(stats) {
    document.getElementById('totalEmployees').textContent = stats.totalEmployees;
    document.getElementById('activeTasks').textContent = stats.activeTasks;
    document.getElementById('pendingApplications').textContent = stats.pendingApplications;
    document.getElementById('pendingResignations').textContent = stats.pendingResignations;
}

// Fetch and display job applications
async function fetchJobApplications() {
    try {
        const token = checkAdminAuth();
        const response = await fetch(`${API_URL}/admin/applications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            updateApplicationsTable(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching applications:', error);
        showError('Failed to load job applications');
    }
}

// Update applications table UI
function updateApplicationsTable(applications) {
    const table = document.getElementById('applicationsTable');
    table.innerHTML = applications.map(app => `
        <tr>
            <td class="px-6 py-4">${app.name}</td>
            <td class="px-6 py-4">${app.email}</td>
            <td class="px-6 py-4">${app.education}</td>
            <td class="px-6 py-4">${new Date(app.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4">
                <button onclick="processApplication('${app._id}', 'approved')" 
                    class="text-green-600 hover:text-green-800 mr-2">
                    Approve
                </button>
                <button onclick="processApplication('${app._id}', 'rejected')"
                    class="text-red-600 hover:text-red-800">
                    Reject
                </button>
            </td>
        </tr>
    `).join('');
}

// Process job application
async function processApplication(id, status) {
    try {
        const token = checkAdminAuth();
        const response = await fetch(`${API_URL}/admin/applications/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess(`Application ${status} successfully`);
            fetchJobApplications();
            fetchDashboardStats();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error processing application:', error);
        showError(error.message);
    }
}

// Fetch and display tasks
async function fetchTasks() {
    try {
        const token = checkAdminAuth();
        const response = await fetch(`${API_URL}/admin/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            updateTasksTable(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showError('Failed to load tasks');
    }
}

// Update tasks table UI
function updateTasksTable(tasks) {
    const table = document.getElementById('tasksTable');
    table.innerHTML = tasks.map(task => `
        <tr>
            <td class="px-6 py-4">${task.title}</td>
            <td class="px-6 py-4">${task.assignedTo.name}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs font-semibold ${getStatusClass(task.status)}">
                    ${task.status}
                </span>
            </td>
            <td class="px-6 py-4">${new Date(task.dueDate).toLocaleDateString()}</td>
            <td class="px-6 py-4">
                <button onclick="editTask('${task._id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                    Edit
                </button>
                <button onclick="deleteTask('${task._id}')" class="text-red-600 hover:text-red-800">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Create new task
async function createTask(event) {
    event.preventDefault();
    
    try {
        const token = checkAdminAuth();
        const formData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            assignedTo: document.getElementById('taskAssignee').value,
            priority: 'medium',
            paymentType: document.getElementById('taskPaymentType').value,
            paymentAmount: parseFloat(document.getElementById('taskPaymentAmount').value),
            startDate: document.getElementById('taskStartDate').value,
            dueDate: document.getElementById('taskDueDate').value
        };

        const response = await fetch(`${API_URL}/admin/tasks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Task created successfully');
            closeNewTaskModal();
            fetchTasks();
            fetchDashboardStats();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showError(error.message);
    }
}

// Fetch and display employees
async function fetchEmployees() {
    try {
        const token = checkAdminAuth();
        const response = await fetch(`${API_URL}/admin/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            updateEmployeesTable(data.data);
            populateEmployeeSelect(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching employees:', error);
        showError('Failed to load employees');
    }
}

// Update employees table UI
function updateEmployeesTable(employees) {
    const table = document.getElementById('employeesTable');
    table.innerHTML = employees.map(emp => `
        <tr>
            <td class="px-6 py-4">${emp.nik}</td>
            <td class="px-6 py-4">${emp.name}</td>
            <td class="px-6 py-4">${emp.level}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs font-semibold ${getEmployeeStatusClass(emp.status)}">
                    ${emp.status}
                </span>
            </td>
            <td class="px-6 py-4">
                <button onclick="editEmployee('${emp._id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                    Edit
                </button>
                <button onclick="viewAttendance('${emp._id}')" class="text-green-600 hover:text-green-800">
                    Attendance
                </button>
            </td>
        </tr>
    `).join('');
}

// Populate employee select dropdown
function populateEmployeeSelect(employees) {
    const select = document.getElementById('taskAssignee');
    select.innerHTML = employees
        .filter(emp => emp.status === 'active')
        .map(emp => `
            <option value="${emp._id}">${emp.name} (${emp.nik})</option>
        `).join('');
}

// Get status classes for styling
function getStatusClass(status) {
    const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
}

function getEmployeeStatusClass(status) {
    const classes = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-red-100 text-red-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'resigned': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || '';
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}

// Show success message
function showSuccess(message) {
    // TODO: Implement toast notification
    alert(message);
}

// Show error message
function showError(message) {
    // TODO: Implement toast notification
    alert(message);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
    fetchJobApplications();
    fetchTasks();
    fetchEmployees();
    
    document.getElementById('btnLogout').addEventListener('click', handleLogout);
    document.getElementById('newTaskForm').addEventListener('submit', createTask);
});