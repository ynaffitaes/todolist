document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const emptyList = document.getElementById('empty-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    // Variables
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialisation
    renderTasks();
    updateEmptyState();
    
    // Événements
    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', handleTaskActions);
    clearBtn.addEventListener('click', clearLocalStorage);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                if (b === btn) {
                    b.classList.add('bg-[var(--color-primary)]', 'text-black', 'border-[var(--color-primary)]');
                    b.classList.remove('bg-transparent', 'text-[var(--color-title)]', 'border-[var(--color-title)]');
                } else {
                    b.classList.remove('bg-[var(--color-primary)]', 'text-black');
                    b.classList.add('bg-transparent', 'text-[var(--color-title)]', 'border-[var(--color-title)]');
                }
            });
            
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    // Fonctions
    function addTask(e) {
        e.preventDefault();
        
        const taskText = taskInput.value.trim();
        
        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            taskInput.value = '';
            updateEmptyState();
        }
    }
    
    function handleTaskActions(e) {
        const target = e.target;
        const taskItem = target.closest('li');
        if (!taskItem) return;
        
        const taskId = parseInt(taskItem.dataset.id);
        
        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
            deleteTask(taskId);
        } else if (target.classList.contains('complete-btn') || target.closest('.complete-btn')) {
            toggleComplete(taskId);
        } else if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
            const task = tasks.find(t => t.id === taskId);
            showEditForm(taskId, task.text);
        }
    }
    
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateEmptyState();
    }
    
    function toggleComplete(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }
    
    function showEditForm(id, currentText) {
        const taskItem = document.querySelector(`li[data-id="${id}"]`);
        if (!taskItem) return;
        
        taskItem.innerHTML = `
            <form class="task-edit-form flex w-full gap-2">
                <input type="text" 
                       class="edit-input flex-grow px-4 py-2 border-none text-base bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none" 
                       value="${currentText}"
                       style="border-radius: var(--rounded-custom); box-shadow: var(--shadow-custom);"
                       onfocus="this.style.boxShadow='var(--shadow-focus)'" 
                       onblur="this.style.boxShadow='var(--shadow-custom)'">
                <button type="submit" class="save-btn bg-[var(--color-primary)] text-black px-4 py-2 font-semibold" style="border-radius: var(--rounded-custom);">
                    <i class="fas fa-check"></i>
                </button>
                <button type="button" class="cancel-btn bg-[var(--color-lightText)] text-white px-4 py-2 font-semibold" style="border-radius: var(--rounded-custom);">
                    <i class="fas fa-times"></i>
                </button>
            </form>
        `;
        
        const editForm = taskItem.querySelector('.task-edit-form');
        const editInput = taskItem.querySelector('.edit-input');
        const cancelBtn = taskItem.querySelector('.cancel-btn');
        
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateTask(id, editInput.value.trim());
        });
        
        cancelBtn.addEventListener('click', () => renderTasks());
        
        editInput.focus();
    }
    
    function updateTask(id, newText) {
        if (!newText) {
            renderTasks();
            return;
        }
        
        tasks = tasks.map(task => 
            task.id === id ? { ...task, text: newText } : task
        );
        saveTasks();
        renderTasks();
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });
        
        if (filteredTasks.length === 0) {
            updateEmptyState();
            return;
        }
        
        emptyList.style.display = 'none';
        
        filteredTasks.forEach(task => {
            const taskEl = document.createElement('li');
            taskEl.dataset.id = task.id;
            taskEl.className = 'flex items-center justify-between px-4 py-3 border-b border-[var(--color-card)]';
            
            const taskContent = document.createElement('div');
            taskContent.className = 'flex items-center gap-3';
            
            // Bouton de complétion
            const completeBtn = document.createElement('button');
            completeBtn.className = 'complete-btn flex items-center justify-center w-5 h-5 rounded-full border-2 border-[var(--color-secondary)] cursor-pointer transition-colors duration-300';
            completeBtn.style.backgroundColor = task.completed ? 'var(--color-completed)' : 'transparent';
            completeBtn.innerHTML = task.completed ? '<i class="fas fa-check text-white text-xs"></i>' : '';
            
            // Texte de la tâche
            const taskText = document.createElement('span');
            taskText.className = task.completed ? 'line-through text-[var(--color-lightText)]' : '';
            taskText.textContent = task.text;
            
            // Boutons d'action
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'flex gap-3';
            
            // Bouton Éditer
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors duration-300';
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            
            // Bouton Supprimer
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn text-[var(--color-delete)] hover:text-[var(--color-secondary)] transition-colors duration-300';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            
            taskContent.appendChild(completeBtn);
            taskContent.appendChild(taskText);
            taskEl.appendChild(taskContent);
            taskEl.appendChild(actionsDiv);
            taskList.appendChild(taskEl);
        });
    }
    
    function updateEmptyState() {
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });
        
        if (filteredTasks.length === 0) {
            emptyList.style.display = 'block';
            if (tasks.length > 0) {
                emptyList.textContent = "Aucune tâche ne correspond à ce filtre.";
            } else {
                emptyList.textContent = "Votre liste est vide. Ajoutez une tâche pour commencer.";
            }
        } else {
            emptyList.style.display = 'none';
        }
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    function clearLocalStorage() {
        // Afficher la modale de confirmation
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.classList.remove('hidden');
        
        // Gérer les boutons de la modale
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            confirmModal.classList.add('hidden');
        }, { once: true }); // Le listener ne s'exécutera qu'une fois
        
        document.getElementById('confirm-delete').addEventListener('click', () => {
            try {
                // Vider les tâches
                localStorage.clear();
                tasks = [];
                renderTasks();
                updateEmptyState();
                
                // Cacher la modale de confirmation
                confirmModal.classList.add('hidden');
                
                // Afficher la modale de succès
                const successModal = document.getElementById('success-modal');
                successModal.classList.remove('hidden');
                
                // Cacher après 3 secondes
                setTimeout(() => {
                    successModal.classList.add('hidden');
                }, 2000);
                
            } catch (error) {
                // En cas d'erreur, afficher la modale d'erreur
                confirmModal.classList.add('hidden');
                
                const errorModal = document.getElementById('error-modal');
                document.getElementById('error-message').textContent = 
                    `Une erreur s'est produite : ${error.message}`;
                errorModal.classList.remove('hidden');
                
                // Fermer la modale d'erreur quand on clique sur OK
                document.getElementById('error-ok').addEventListener('click', () => {
                    errorModal.classList.add('hidden');
                }, { once: true });
            }
        }, { once: true });
    }
});