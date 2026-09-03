const API_URL = 'https://task-manager-app-wm74.onrender.com/api';

// add anew user
async function saveUserstoStorage(user) {
    try { 
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json'
            }
        }); 
          
        if (!response.ok) {
            throw new Error('Failed to save user to server');
        }
        
        const data = await response.json();
        console.log("User saved to server:", data);
        return data; 
    } catch (error) {
        console.error('Error saving user to server:', error);
    }
}

// get all users from server 
async function getUsersFromServer() {
    try {
        const response = await fetch(`${API_URL}/users`);

        if (!response.ok) {
            throw new Error('Failed to fetch users from server');
        }

        const data = await response.json();
        console.log("Users fetched from server:", data);
        return data;
    } catch (error) {
        console.error('Error fetching users from server:', error);
    }
}

// add new task to server
async function saveTaskToServer(task) {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            body: JSON.stringify(task),
            headers: {
                'Content-Type': 'application/json'
            }
        }); 

        if (!response.ok) {
            throw new Error('Failed to save task to server');
        }
        
        const data = await response.json();
        console.log("Task saved to server:", data);
        return data; 
    } catch (error) {
        console.error('Error saving task to server:', error);
    }
}

// get all task from server
async function getTasksFromServer(userId) {
    try {
        const url = userId ? `${API_URL}/tasks?userId=${userId}` : `${API_URL}/tasks`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

//delete task from server
async function deleteTaskFromServer(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task from server');
        }
        
        const data = await response.json();
        console.log("Task deleted from server:", data);
        return data;
    } catch (error) {
        console.error('Error deleting task from server:', error);
    }
}

// update task on server
async function updateTaskOnServer(taskId, updatedTask) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedTask),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task on server');
        }
        
        const data = await response.json();
        console.log("Task updated on server:", data);
        return data;
    } catch (error) {
        console.error('Error updating task on server:', error);
    }
}