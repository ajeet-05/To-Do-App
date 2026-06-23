(function() {
    "use strict";

    const toast = document.getElementById('toastMessage');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const taskCount = document.getElementById('taskCount');
    const totalTasks = document.getElementById('totalTasks');
    const totalReminders = document.getElementById('totalReminders');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const cancelModal = document.getElementById('cancelModal');
    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitleInput');
    const taskDescInput = document.getElementById('taskDescInput');
    const weekDays = document.querySelectorAll('.week-days .day');

    let tasks = [];
    let taskIdCounter = 0;

    let toastTimeout = null;

    function showToast(message, duration = 2400) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');

        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            toastTimeout = null;
        }, duration);
    }

    function hideToast() {
        if (toast) {
            toast.classList.remove('show');
        }
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }
    }

    function renderTasks() {
        if (tasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.style.display = 'block';
            taskCount.textContent = '0';
            totalTasks.textContent = '0';
            return;
        }

        emptyState.style.display = 'none';
        taskCount.textContent = tasks.length;
        totalTasks.textContent = tasks.length;

        const reminderCount = tasks.filter(t => 
            t.description && t.description.toLowerCase().includes('remind')
        ).length;
        totalReminders.textContent = reminderCount;

        let html = '';
        tasks.forEach((task, index) => {
            const completedClass = task.completed ? 'completed' : '';
            html += `
                <div class="task-card ${completedClass}" data-task-id="${task.id}">
                    <div class="task-header">
                        <span class="task-title">${escapeHtml(task.title)}</span>
                        <span class="task-tag work-tag">work</span>
                    </div>
                    ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                    <div class="task-footer">
                        <span class="task-hashtag">#task</span>
                        <span class="task-due">Due : 6:30 PM</span>
                        <button class="task-delete-btn" data-task-id="${task.id}">✕</button>
                    </div>
                </div>
            `;
        });

        taskList.innerHTML = html;

        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.classList.contains('task-delete-btn')) return;
                toggleTaskComplete(this.dataset.taskId);
            });
        });

        document.querySelectorAll('.task-delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteTask(this.dataset.taskId);
            });
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function addTask(title, description = '') {
        const newTask = {
            id: ++taskIdCounter,
            title: title.trim(),
            description: description.trim(),
            completed: false,
            createdAt: new Date()
        };
        tasks.push(newTask);
        renderTasks();
        showToast(`✅ "${newTask.title}" added successfully!`);
    }

    function toggleTaskComplete(taskId) {
        const task = tasks.find(t => t.id == taskId);
        if (!task) return;

        task.completed = !task.completed;
        renderTasks();

        if (task.completed) {
            showToast(`✅ "${task.title}" marked as complete!`);
        } else {
            showToast(`↩️ "${task.title}" reopened`);
        }
    }

    function deleteTask(taskId) {
        const task = tasks.find(t => t.id == taskId);
        if (!task) return;

        if (confirm(`Delete "${task.title}"?`)) {
            tasks = tasks.filter(t => t.id != taskId);
            renderTasks();
            showToast(`🗑️ "${task.title}" deleted`);
        }
    }

    function openModal() {
        taskModal.classList.add('active');
        taskTitleInput.value = '';
        taskDescInput.value = '';
        taskTitleInput.focus();
    }

    function closeModal() {
        taskModal.classList.remove('active');
    }

    function handleWeekDayClick(e) {
        const day = e.currentTarget;
        weekDays.forEach(d => d.classList.remove('active'));
        day.classList.add('active');
        showToast(`📅 ${day.textContent} selected`);
    }

    // ----- init -----
    function init() {
        tasks = [];
        renderTasks();

        addTaskBtn.addEventListener('click', openModal);

        cancelModal.addEventListener('click', closeModal);

        taskModal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = taskTitleInput.value.trim();
            if (!title) {
                showToast('⚠️ Please enter a task title');
                return;
            }
            const description = taskDescInput.value.trim();
            addTask(title, description);
            closeModal();
        });

        weekDays.forEach(day => {
            day.addEventListener('click', handleWeekDayClick);
        });

        if (toast) {
            toast.addEventListener('click', hideToast);
        }

        setTimeout(() => {
            showToast('👋 Add your first task!', 2000);
        }, 400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();