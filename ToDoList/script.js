document.addEventListener('DOMContentLoaded', () => {
    //Eléments DOM
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const emptyList = document.getElementById('empty-list');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // état de l'application
    let tasks = [];
    let currentFilter = 'all';
    let editingTaskId = null;

    // Charger les tâches depuis le localStorage
    const loadTasks = () => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        } else {
            console.log("la tache n'a pas ete trouve");
        }
        rendertasks();
    };

    // sauvegarder les taches dans le localstorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };
    //generer un identifiant unique pour chaque tache
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };
    // ajouter une tache 
    const addTask = (text) => {
        const newTask = {
            id: generateId(),
            text,
            completed: false,
            createDate: new Date()
        };
        tasks.unshift(newTask);
        saveTasks();
        rendertasks();
    };
    // supprimer la tache
    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        rendertasks();
    };

    // basculer l'état d'accomplissment de la tache
    const toogleTaskCompletion = (id) => {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        rendertasks();
    };

    // modifier une tache 
    const editTask = (id) => {
        editingTaskId = id;
        rendertasks();
    };

    // sauvegarder la tache modifiee
    const saveEditedTask = (id, newText) => {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, text: newText };
            }
            return task;
        });
        editingTaskId = null;
        saveTasks();
        rendertasks();
    };

    // annuler la modification de la tache
    const cancelEdit = (id) => {
        editingTaskId = null;
        rendertasks();
    };

    // filtrer les taches 
    const filterTasks = (filterType) => {
        currentFilter = filterType;

        // Met à jour le filtre actuel
        filterButtons.forEach((btn) => {
            if (btn.dataset.filter === filterType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        renderTasks();
    };

    // afficher les taches
    const renderTasks = () => {
        // filter les taches selon le filtre actuel
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        }
        else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        // afficher ou masquer le message liste vide
        if (filteredTasks.length === 0) {
            emptyList.style.display = 'block';
            taskList.innerHTML = '';
            return;
        } else {
            emptyList.style.display = 'none';
        }
        // generer le HTML pour chaque tache'
        taskList.innerHTML = filteredTasks.map(task => {
            // si la tache est en cours d'edition
            if (task.id === editingTaskId) {
                return `
                    <li class="task-item" data-id="${task.id}">
                        <form class="task-edit-Form" data-id="${task.id}">
                            <input type="text" class="edit-input value="${task.text}" required autofocus>
                            <button type="submit" class="save-btn">✓</button>
                            <button type="button" class="cancel-btn">✕</button>
                        </form>
                    </li>
                `;
            }
            // sinon afficher la tache normalement
            return `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button class="edit-btn">✎</button>
                        <button class="delete-btn">✕</button>
                    </div>
                </li>
            `;
        }).join('');

        //ajouter les gestionnaires d'événements aux éléments dynamique
        attachEventListeners();
    };

    //attacher les éccouteurs d'événements aux éléments dynamique
    const attachEventListeners = () => {

        //Gestionnaires pour les cases à cocher
        document, querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.id;
                toogleTaskCompletion(taskId);
            });
        });

        //Gestionnaires pour les boutons de suppression
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.id;
                deleteTask(taskId);
            });
        });

        //Gestionnaires pour les boutons de modification
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-item').dataset.id;
                editTask(taskId);
            });
        });

        //Gestionnaires pour les formulaires de modification
        document.querySelectorAll('.task-edit-form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const taskId = e.target.dataset.id;
                const newText = e.target.querySelector('.edit-input').value.trim();
                if (newText) {
                    saveEditedTask(taskId, newText);
                }
            });
        });

        //Gestionnaires pour les boutons d'annulation
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                cancelEdit(taskId);
            });
        });
    };
    //Gestionnaires pour le formulaire d'ajout de tâche
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text) {
            addTask(taskText);
            taskInput.value = '';
            taskInput.focus();
        }
    });


    //Gestionnaires pour les boutons de filtre
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterType = e.target.dataset.filter;
            filterTasks(filterType);
        });
    });

    //Initialisation
    loadTasks();

});
