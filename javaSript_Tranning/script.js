document.addEventListener("DOMContentLoaded", loadTasks);

function addTask() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const dueDate = document.getElementById("dueDate").value;

    if (!title || !dueDate) {
        alert("Title and Due Date are required!");
        return;
    }

    const task = {
        id: Date.now(),
        title,
        description,
        dueDate,
        completed: false
    };

    let tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);
    displayTasks();
    clearForm();
}

function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function displayTasks(filter = "all") {
    let tasks = getTasks();
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        if (filter === "completed" && !task.completed) return;
        if (filter === "incomplete" && task.completed) return;

        const li = document.createElement("li");
        li.classList.toggle("completed", task.completed);
        li.innerHTML = `
            <div>
                <strong>${task.title}</strong> - ${task.description} (Due: ${task.dueDate})
            </div>
            <div>
                <button class="edit" onclick="editTask(${task.id})">Edit</button>
                <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
                <button class="complete" onclick="toggleComplete(${task.id})">${task.completed ? "Undo" : "Complete"}</button>
            </div>
        `;

        taskList.appendChild(li);
    });
}

function clearForm() {
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("dueDate").value = "";
}

function editTask(id) {
    let tasks = getTasks();
    let task = tasks.find(t => t.id === id);

    if (task) {
        document.getElementById("title").value = task.title;
        document.getElementById("description").value = task.description;
        document.getElementById("dueDate").value = task.dueDate;

        deleteTask(id);
    }
}

function deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
        let tasks = getTasks().filter(task => task.id !== id);
        saveTasks(tasks);
        displayTasks();
    }
}

function toggleComplete(id) {
    let tasks = getTasks();
    let task = tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;

    saveTasks(tasks);
    displayTasks();
}

function filterTasks(filter) {
    displayTasks(filter);
}

function searchTasks() {
    let query = document.getElementById("search").value.toLowerCase();
    let tasks = getTasks();
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        if (task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)) {
            const li = document.createElement("li");
            li.classList.toggle("completed", task.completed);
            li.innerHTML = `
                <div>
                    <strong>${task.title}</strong> - ${task.description} (Due: ${task.dueDate})
                </div>
                <div>
                    <button class="edit" onclick="editTask(${task.id})">Edit</button>
                    <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
                    <button onclick="toggleComplete(${task.id})">${task.completed ? "Undo" : "Complete"}</button>
                </div>
            `;
            taskList.appendChild(li);
        }
    });
}

function loadTasks() {
    displayTasks();
}
