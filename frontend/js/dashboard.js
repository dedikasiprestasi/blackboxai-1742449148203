// API Base URL
const API_URL = 'http://localhost:8000/api';

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }
    return token;
}

// Fetch user data
async function fetchUserData() {
    try {
        const token = checkAuth();
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            updateUserInterface(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        showError('Failed to load user data');
    }
}

// Update UI with user data
function updateUserInterface(user) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userNik').textContent = user.nik || '-';
    document.getElementById('employeeLevel').textContent = user.level;
    document.getElementById('currentBalance').textContent = `Rp ${user.balance.toLocaleString()}`;
}

// Clock In/Out functionality
async function handleClockInOut() {
    try {
        const token = checkAuth();
        const button = document.getElementById('btnClockInOut');
        const isClockingIn = button.textContent.includes('In');
        
        const endpoint = isClockingIn ? 'clock-in' : 'clock-out';
        
        // Get user's location
        const position = await getCurrentPosition();
        
        const response = await fetch(`${API_URL}/employee/attendance/${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coordinates: [position.coords.longitude, position.coords.latitude]
            })
        });

        const data = await response.json();
        
        if (data.success) {
            updateClockStatus(!isClockingIn);
            showSuccess(`Successfully clocked ${isClockingIn ? 'in' : 'out'}`);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error with clock in/out:', error);
        showError(error.message);
    }
}

// Get current position
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// Update clock status UI
function updateClockStatus(isClockedIn) {
    const button = document.getElementById('btnClockInOut');
    const status = document.getElementById('clockStatus');
    
    if (isClockedIn) {
        button.textContent = 'Clock Out';
        status.innerHTML = '<p class="text-gray-600">Current Status:</p><p class="text-xl font-bold text-green-600">Clocked In</p>';
    } else {
        button.textContent = 'Clock In';
        status.innerHTML = '<p class="text-gray-600">Current Status:</p><p class="text-xl font-bold text-red-600">Not Clocked In</p>';
    }
}

// Fetch tasks
async function fetchTasks() {
    try {
        const token = checkAuth();
        const response = await fetch(`${API_URL}/employee/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            updateTasksUI(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showError('Failed to load tasks');
    }
}

// Update tasks UI
function updateTasksUI(tasks) {
    const activeTasks = tasks.filter(task => task.status !== 'completed').length;
    document.getElementById('activeTasks').textContent = activeTasks;
    
    const tasksList = document.getElementById('recentTasksList');
    tasksList.innerHTML = tasks.map(task => `
        <tr>
            <td class="px-6 py-4">${task.title}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs font-semibold ${getStatusClass(task.status)}">
                    ${task.status}
                </span>
            </td>
            <td class="px-6 py-4">${new Date(task.dueDate).toLocaleDateString()}</td>
            <td class="px-6 py-4">Rp ${task.paymentAmount.toLocaleString()}</td>
            <td class="px-6 py-4">
                <button onclick="updateTaskStatus('${task._id}')" class="text-blue-600 hover:text-blue-800">
                    Update Status
                </button>
            </td>
        </tr>
    `).join('');
}

// Get status class for styling
function getStatusClass(status) {
    const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || '';
}

// Fetch attendance history
async function fetchAttendanceHistory() {
    try {
        const token = checkAuth();
        const response = await fetch(`${API_URL}/employee/attendance`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            updateAttendanceUI(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching attendance:', error);
        showError('Failed to load attendance history');
    }
}

// Update attendance UI
function updateAttendanceUI(attendance) {
    const attendanceList = document.getElementById('attendanceHistoryList');
    attendanceList.innerHTML = attendance.map(record => `
        <tr>
            <td class="px-6 py-4">${new Date(record.date).toLocaleDateString()}</td>
            <td class="px-6 py-4">${record.clockIn ? new Date(record.clockIn.time).toLocaleTimeString() : '-'}</td>
            <td class="px-6 py-4">${record.clockOut ? new Date(record.clockOut.time).toLocaleTimeString() : '-'}</td>
            <td class="px-6 py-4">${record.workingHours.toFixed(2)} hours</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs font-semibold ${getAttendanceStatusClass(record.status)}">
                    ${record.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// Get attendance status class for styling
function getAttendanceStatusClass(status) {
    const classes = {
        'present': 'bg-green-100 text-green-800',
        'absent': 'bg-red-100 text-red-800',
        'late': 'bg-yellow-100 text-yellow-800',
        'half_day': 'bg-orange-100 text-orange-800'
    };
    return classes[status] || '';
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    try {
        const token = checkAuth();
        const formData = {
            name: document.getElementById('profileName').value,
            email: document.getElementById('profileEmail').value,
            phoneNumber: document.getElementById('profilePhone').value
        };
        
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Profile updated successfully');
            closeProfileModal();
            fetchUserData();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showError(error.message);
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
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
    fetchUserData();
    fetchTasks();
    fetchAttendanceHistory();
    
    document.getElementById('btnClockInOut').addEventListener('click', handleClockInOut);
    document.getElementById('btnLogout').addEventListener('click', handleLogout);
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
});