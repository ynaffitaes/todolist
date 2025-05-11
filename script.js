// Écouteur d'événement qui se déclenche quand le DOM est complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Récupération des éléments du DOM par leur ID
    const taskForm = document.getElementById('task-form'); // Formulaire d'ajout de tâche
    const taskInput = document.getElementById('task-input'); // Champ de saisie de la tâche
    const taskList = document.getElementById('task-list'); // Liste ul qui contiendra les tâches
    const emptyList = document.getElementById('empty-list'); // Message quand la liste est vide
    const filterBtns = document.querySelectorAll('.filter-btn'); // Boutons de filtrage
    const clearBtn = document.getElementById('clear-btn'); // Bouton de réinitialisation
    
    // Variables
    let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Récupère les tâches du localStorage ou initialise un tableau vide
    let currentFilter = 'all'; // Filtre actif par défaut
    
    // Initialisation de l'application
    renderTasks(); // Affiche les tâches
    updateEmptyState(); // Met à jour l'état de la liste vide
    
    // Gestion des événements
    taskForm.addEventListener('submit', addTask); // Soumission du formulaire
    taskList.addEventListener('click', handleTaskActions); // Clic sur une tâche
    clearBtn.addEventListener('click', clearLocalStorage); // Clic sur le bouton de réinitialisation
    
    // Gestion des boutons de filtre
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Met à jour le style des boutons de filtre
            filterBtns.forEach(b => {
                if (b === btn) { // Si le bouton est actif 
                    // Style pour le bouton actif
                    b.classList.add('bg-[var(--color-primary)]', 'text-black', 'border-[var(--color-primary)]');
                    b.classList.remove('bg-transparent', 'text-[var(--color-title)]', 'border-[var(--color-title)]');
                } else { // Sinon
                    // Style pour les boutons inactifs
                    b.classList.remove('bg-[var(--color-primary)]', 'text-black');
                    b.classList.add('bg-transparent', 'text-[var(--color-title)]', 'border-[var(--color-title)]');
                }
            });
            
            // Met à jour le filtre courant et rafraîchit l'affichage
            currentFilter = btn.dataset.filter; // Récupère le filtre depuis l'attribut data-filter dans le html
            // Met à jour le filtre actif
            renderTasks();
        });
    });
    
    // Fonction pour ajouter une nouvelle tâche
    function addTask(e) {
        e.preventDefault(); // Empêche le rechargement de la page
        
        const taskText = taskInput.value.trim(); // Dans la variable taskText, Récupère et nettoie le texte 
        
        if (taskText) { // Si le texte n'est pas vide
            // Crée un nouvel objet tâche
            const newTask = {
                id: Date.now(), // ID unique basé sur le timestamp
                text: taskText, // Texte de la tâche
                completed: false, // État non complété par défaut
                createdAt: new Date().toISOString() // Date de création
            };
            
            tasks.push(newTask); // Ajoute la nouvelle tâche au tableau
            saveTasks(); // Sauvegarde dans le localStorage
            renderTasks(); // Rafraîchit l'affichage
            taskInput.value = ''; // Vide le champ de saisie
            updateEmptyState(); // Met à jour l'état de la liste vide
        }
    }
    
    // Fonction pour gérer les actions sur les tâches
    function handleTaskActions(e) {
        const target = e.target; // dans la variable target récupère l'Élément cliqué
        const taskItem = target.closest('li'); // dans la variable taskItem récupère la Tâche parente
        if (!taskItem) return; // Si on n'a pas cliqué sur une tâche, on sort
        
        const taskId = parseInt(taskItem.dataset.id); // dans la variable taskId récupère ID de la tâche
        
        // Gestion du clic sur le bouton de suppression
        if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) { // Si on a cliqué sur le bouton de suppression ou sur un de ses parents
            //supprime la tâche	
            deleteTask(taskId);
        } 
        // Gestion du clic sur le bouton de complétion
        else if (target.classList.contains('complete-btn') || target.closest('.complete-btn')) { // Sinon si on a cliqué sur le bouton de complétion ou sur un de ses parents
            // complete la tâche
            toggleComplete(taskId);
        } 
        // Gestion du clic sur le bouton d'édition
        else if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) { // Sinon si on a cliqué sur le bouton d'édition ou sur un de ses parents
            const task = tasks.find(t => t.id === taskId); // Trouve la tâche correspondante
            showEditForm(taskId, task.text); // et affiche le formulaire d'édition
        }
    }
    
    // Fonction pour supprimer une tâche
    function deleteTask(id) { 
        tasks = tasks.filter(task => task.id !== id); // dans la variable tasks filtre les tâches pour supprimer celle avec l'ID donné
        saveTasks(); // Sauvegarde
        renderTasks(); // Rafraîchit l'affichage
        updateEmptyState(); // Met à jour l'état de la liste vide
    }
    
    // Fonction pour basculer l'état de complétion d'une tâche
    function toggleComplete(id) {
        tasks = tasks.map(task => { // dans la variable tasks, on parcourt toutes les tâches
            if (task.id === id) { // Si la tâche a l'ID donné
                return { ...task, completed: !task.completed }; // Inverse l'état de complétion
            }
            return task; // Retourne la tâche inchangée
        });
        
        saveTasks(); // Sauvegarde la liste mise à jour
        renderTasks(); // Rafraîchit l'affichage
    }
    
    // Fonction pour afficher le formulaire d'édition
    function showEditForm(id, currentText) {
        const taskItem = document.querySelector(`li[data-id="${id}"]`); // dans la variable taskItem Trouve l'élément "li" de la tâche
        if (!taskItem) return; // Si elle n'est pas trouvée, on sort
        
        // Remplace le contenu de la tâche par un formulaire d'édition
        taskItem.innerHTML = `
            <form class="task-edit-form flex w-full gap-2">
                <input type="text" 
                       class="edit-input flex-grow px-3 py-1 sm:px-4 sm:py-2 border-none text-sm sm:text-base bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none" 
                       value="${currentText}"
                       style="border-radius: var(--rounded-custom); box-shadow: var(--shadow-custom);"
                       onfocus="this.style.boxShadow='var(--shadow-focus)'" 
                       onblur="this.style.boxShadow='var(--shadow-custom)'">
                <button type="submit" class="save-btn bg-[var(--color-primary)] text-black px-3 py-1 sm:px-4 sm:py-2 font-semibold text-sm sm:text-base" style="border-radius: var(--rounded-custom);">
                    <i class="fas fa-check"></i>
                </button>
                <button type="button" class="cancel-btn bg-[var(--color-lightText)] text-white px-3 py-1 sm:px-4 sm:py-2 font-semibold text-sm sm:text-base" style="border-radius: var(--rounded-custom);">
                    <i class="fas fa-times"></i>
                </button>
            </form>
        `;
        
        // Récupération des éléments du formulaire
        const editForm = taskItem.querySelector('.task-edit-form'); // dans la variable editForm récupère le formulaire
        const editInput = taskItem.querySelector('.edit-input'); // dans la variable editInput récupère le champ de saisie
        const cancelBtn = taskItem.querySelector('.cancel-btn'); // dans la variable cancelBtn récupère le bouton d'annulation
        
        // Gestion de la soumission du formulaire
        editForm.addEventListener('submit', (e) => { // Quand le formulaire est soumis
            e.preventDefault(); // Empêche le rechargement de la page
            updateTask(id, editInput.value.trim()); // Met à jour la tâche
        });
        
        // Gestion de l'annulation
        cancelBtn.addEventListener('click', () => renderTasks()); // Quand on clique sur annuler, on rafraîchit l'affichage
        
        editInput.focus(); // Met le focus sur le champ d'édition
    }
    
    // Fonction pour mettre à jour une tâche
    function updateTask(id, newText) {
        if (!newText) { // Si le texte est vide
            renderTasks(); // Si texte vide, on rafraîchit sans sauvegarder
            return; // On sort
        }
        
        // Met à jour le texte de la tâche correspondante
        tasks = tasks.map(task => // Parcourt toutes les tâches
            task.id === id ? { ...task, text: newText } : task // Si la tâche a l'ID donné, on met à jour le texte
        );
        saveTasks(); // Sauvegarde
        renderTasks(); // Rafraîchit l'affichage
    }
    
    // Fonction pour afficher les tâches
    function renderTasks() {
        taskList.innerHTML = ''; // Vide la liste
        
        // Filtre les tâches selon le filtre actif
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed; // si le filtre est 'active', retourne les tâches non complétées
            if (currentFilter === 'completed') return task.completed; // si le filtre est 'completed', retourne les tâches complétées
            return true; // sinon retourne toutes les tâches
        });
        
        if (filteredTasks.length === 0) {
            updateEmptyState(); // Affiche le message si liste vide
            return; // S'il n'y a aucune tâche, on sort
        }
        
        emptyList.style.display = 'none'; // Cache le message de liste vide
        
        // Crée et ajoute chaque tâche à la liste
        filteredTasks.forEach(task => {
            const taskEl = document.createElement('li'); // dans la variable taskEl crée un nouvel élément "li"
            taskEl.dataset.id = task.id; // Ajoute l'ID de la tâche
            taskEl.className = 'flex items-center justify-between px-4 py-3 border-b border-[var(--color-card)]'; // Ajoute des classes pour le style
            
            const taskContent = document.createElement('div'); // dans la variable taskContent crée un nouvel élément "div"
            taskContent.className = 'flex items-center gap-3'; // Ajoute des classes pour le style
            
            // Bouton de complétion
            const completeBtn = document.createElement('button'); // dans la variable completeBtn crée un nouvel élément "button"
            // Ajoute des classes pour le style
            completeBtn.className = 'complete-btn flex items-center justify-center w-5 h-5 rounded-full border-2 border-[var(--color-secondary)] cursor-pointer transition-colors duration-300';
            // Change le style selon l'état de complétion
            completeBtn.style.backgroundColor = task.completed ? 'var(--color-completed)' : 'transparent';
            // Change la couleur de la bordure selon l'état de complétion
            completeBtn.innerHTML = task.completed ? '<i class="fas fa-check text-white text-xs"></i>' : '';
            
            // Texte de la tâche
            const taskText = document.createElement('span'); // dans la variable taskText crée un nouvel élément "span"
            taskText.className = task.completed ? 'line-through text-[var(--color-lightText)]' : ''; // Ajoute une classe pour barrer le texte si complété
            taskText.textContent = task.text; // Définit le texte de la tâche
            
            // Boutons d'action
            const actionsDiv = document.createElement('div'); // dans la variable actionsDiv crée un nouvel élément "div"
            actionsDiv.className = 'flex gap-3'; // Ajoute des classes pour le style
            
            // Bouton Éditer
            const editBtn = document.createElement('button'); // dans la variable editBtn crée un nouvel élément "button"
            editBtn.className = 'edit-btn text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors duration-300'; // Ajoute des classes pour le style
            editBtn.innerHTML = '<i class="fas fa-pen"></i>'; // Définit l'icône d'édition
            
            // Bouton Supprimer
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn text-[var(--color-delete)] hover:text-[var(--color-secondary)] transition-colors duration-300';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            
            // Construction de la structure DOM
            actionsDiv.appendChild(editBtn); // Ajoute le bouton Éditer
            actionsDiv.appendChild(deleteBtn); // Ajoute le bouton Supprimer
            
            taskContent.appendChild(completeBtn); // Ajoute le bouton de complétion
            taskContent.appendChild(taskText); // Ajoute le texte de la tâche
            taskEl.appendChild(taskContent); // Ajoute le contenu de la tâche
            taskEl.appendChild(actionsDiv); // Ajoute les actions
            taskList.appendChild(taskEl); // Ajoute la tâche à la liste
        });
    }
    
    // Fonction pour mettre à jour l'affichage quand la liste est vide
    function updateEmptyState() {
        // Filtre les tâches selon le filtre actif
        const filteredTasks = tasks.filter(task => { // Dans la variable "filteredTasks", Parcourt toutes les tâches
            if (currentFilter === 'active') return !task.completed; // si le filtre est 'active', retourne les tâches non complétées
            if (currentFilter === 'completed') return task.completed; // si le filtre est 'completed', retourne les tâches complétées
            return true; // sinon retourne toutes les tâches
        });
        
        if (filteredTasks.length === 0) { // Si aucune tâche ne correspond au filtre
            emptyList.style.display = 'block'; // Affiche le message
            // Message différent selon qu'il y a des tâches ou non
            if (tasks.length > 0) { // Si des tâches existent mais ne correspondent pas au filtre
                emptyList.textContent = "Aucune tâche ne correspond à ce filtre."; // Affiche le message
            } else { // Si aucune tâche n'existe
                emptyList.textContent = "Votre liste est vide. Ajoutez une tâche pour commencer."; // Affiche le message
            }
        } else { // Si des tâches correspondent au filtre
            emptyList.style.display = 'none'; // Cache le message
        }
    }
    
    // Fonction pour sauvegarder les tâches dans le localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Convertit en JSON et sauvegarde
    }
    
    // Fonction pour vider le localStorage
    function clearLocalStorage() {
        // Affiche la modale de confirmation
        const confirmModal = document.getElementById('confirm-modal'); // dans la variable "confirmModal", récupère la modale qui à l'ID 'confirm-modal'
        confirmModal.classList.remove('hidden'); // Affiche la modale
        
        // Gestion du bouton Annuler
        document.getElementById('confirm-cancel').addEventListener('click', () => { // Récupère dans le HTML le bouton avec l'ID 'confirm-cancel' lorqu'il est cliqué
            confirmModal.classList.add('hidden'); // Cache la modale
        }, { once: true }); // Le listener ne s'exécutera qu'une fois
        
        // Gestion du bouton Supprimer
        document.getElementById('confirm-delete').addEventListener('click', () => { // Récupère dans le HTML le bouton avec l'ID 'confirm-cancel' lorqu'il est cliqué
            try { // Essaie 
                // Vider les tâches
                localStorage.clear(); // Vide le localStorage
                tasks = []; // Réinitialise le tableau
                renderTasks(); // Rafraîchit l'affichage
                updateEmptyState(); // Met à jour l'état de la liste vide
                
                confirmModal.classList.add('hidden'); // Cache la modale de confirmation
                
                // Affiche la modale de succès
                const successModal = document.getElementById('success-modal'); // dans la variable "successModal" récupère la modale qui à l'ID 'success-modal'
                successModal.classList.remove('hidden'); // Mais cache là après un certain temps
                
                // Cache après 2 secondes
                setTimeout(() => {
                    successModal.classList.add('hidden');
                }, 2000);
                
            } catch (error) {
                // En cas d'erreur, affiche la modale d'erreur
                confirmModal.classList.add('hidden');
                
                const errorModal = document.getElementById('error-modal');
                document.getElementById('error-message').textContent = 
                    `Une erreur s'est produite : ${error.message}`;
                errorModal.classList.remove('hidden');
                
                // Ferme la modale d'erreur quand on clique sur OK
                document.getElementById('error-ok').addEventListener('click', () => {
                    errorModal.classList.add('hidden');
                }, { once: true }); // Le listener ne s'exécutera qu'une fois
            }
        }, { once: true }); // Le listener ne s'exécutera qu'une fois
    }
});