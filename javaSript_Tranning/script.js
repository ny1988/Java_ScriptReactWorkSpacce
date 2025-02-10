document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const searchInput = document.getElementById('search');
    const taskFilter = document.getElementById('task-filter');
    const tableHeaders = document.querySelectorAll('#task-table th[data-sort]');
    const dueDateInput = document.getElementById('task-due-date');
    const submitButton = taskForm.querySelector('button[type="submit"]');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let sortOrder = 'asc';
    let sortColumn = 'title';

    // Define today's date globally
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.setAttribute('min', today);

    // Handle task form submission
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('task-id').value;
        if (id) {
            editTask();
        } else {
            addTask();
        }
    });

    // Event listeners
    taskList.addEventListener('click', handleTaskClick);
    searchInput.addEventListener('input', filterTasks);
    taskFilter.addEventListener('change', () => filterTasksByStatus(taskFilter.value));
    tableHeaders.forEach(header => header.addEventListener('click', () => sortTasksBy(header.dataset.sort)));

    function addTask() {
        const title = document.getElementById('task-title').value.trim();
        const desc = document.getElementById('task-desc').value.trim();
        const dueDate = document.getElementById('task-due-date').value;

        if (!title || !desc || !dueDate) {
            alert('Please fill in all fields.');
            return;
        }

        if (new Date(dueDate) < new Date(today)) {
            alert('Due date cannot be in the past.');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            desc,
            dueDate,
            completed: false
        };

        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        taskForm.reset();
        document.getElementById('task-id').value = ''; // Clear hidden input
        submitButton.textContent = 'Add Task';
    }

    function handleTaskClick(e) {
        const taskId = e.target.closest('tr')?.dataset.id;
        if (!taskId) return;

        if (e.target.classList.contains('delete')) {
            deleteTask(taskId);
        } else if (e.target.classList.contains('edit')) {
            populateEditForm(taskId);
        } else if (e.target.classList.contains('complete') || e.target.classList.contains('undo')) {
            toggleTaskCompletion(taskId);
        }
    }

    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id != id);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }
    }

    function populateEditForm(id) {
        const task = tasks.find(task => task.id == id);
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-desc').value = task.desc;
        document.getElementById('task-due-date').value = task.dueDate;
        document.getElementById('task-id').value = task.id;
        submitButton.textContent = 'Edit Task';
    }

    function editTask() {
        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value.trim();
        const desc = document.getElementById('task-desc').value.trim();
        const dueDate = document.getElementById('task-due-date').value;

        if (!title || !desc || !dueDate) {
            alert('Please fill in all fields.');
            return;
        }

        if (new Date(dueDate) < new Date(today)) {
            alert('Due date cannot be in the past.');
            return;
        }

        const taskIndex = tasks.findIndex(task => task.id == id);
        tasks[taskIndex] = { ...tasks[taskIndex], title, desc, dueDate };

        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        taskForm.reset();
        document.getElementById('task-id').value = '';
        submitButton.textContent = 'Add Task';
    }

    function toggleTaskCompletion(id) {
        const task = tasks.find(task => task.id == id);
        task.completed = !task.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        filterTasksByStatus(taskFilter.value);
    }

    function filterTasks() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredTasks = tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) || 
            task.desc.toLowerCase().includes(searchTerm)
        );
        renderTasks(filteredTasks);
    }

    function filterTasksByStatus(status) {
        let filteredTasks = tasks;
        if (status === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (status === 'incomplete') {
            filteredTasks = tasks.filter(task => !task.completed);
        }
        renderTasks(filteredTasks);
    }

    function sortTasksBy(column) {
        sortColumn = column;
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        tasks.sort((a, b) => {
            if (a[column] < b[column]) return sortOrder === 'asc' ? -1 : 1;
            if (a[column] > b[column]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        renderTasks();
    }

    function renderTasks(tasksToRender = tasks) {
        taskList.innerHTML = '';
        tasksToRender.forEach(task => {
            const tr = document.createElement('tr');
            tr.dataset.id = task.id;
            tr.className = task.completed ? 'completed' : 'incomplete';

            tr.innerHTML = `
                <td>${task.title}</td>
                <td>${task.desc}</td>
                <td>${task.completed ? 'Completed' : 'Incomplete'}</td>
                <td>${task.dueDate}</td>
                <td class="actions">
                    <button class="${task.completed ? 'undo' : 'complete'}">
                        <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                        <span>${task.completed ? 'Undo' : 'Complete'}</span>
                    </button>
                    ${!task.completed ? '<button class="edit"><i class="fas fa-edit"></i>Edit</button>' : ''}
                    <button class="delete"><i class="fas fa-trash"></i>Delete</button>
                </td>
            `;
            taskList.appendChild(tr);
        });
    }

    renderTasks();
});
