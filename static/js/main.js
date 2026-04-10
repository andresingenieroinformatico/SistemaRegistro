/** 
 * Sistema de Registro - Logic System 
 * Simulated User Authentication & Data Persistence
 */

document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registroForm');
    const loginForm = document.getElementById('loginForm');
    const editForm = document.getElementById('editForm');
    const userTableBody = document.getElementById('userTableBody');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- Helper Functions ---

    const getUsers = () => {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    };

    const saveUsers = (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    };

    // --- Protection Middleware ---
    if (userTableBody && !localStorage.getItem('currentUser')) {
        window.location.href = 'login.html';
    }

    // --- Logout Logic ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // --- Registration Logic ---

    if (registroForm) {
        registroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            const users = getUsers();

            if (users.find(u => u.correo === correo)) {
                return alert('Este correo ya está registrado.');
            }

            const newUser = {
                nombre,
                correo,
                password,
                fecha: new Date().toLocaleDateString(),
                status: 'Activo'
            };

            users.push(newUser);
            saveUsers(users);
            
            // Visual transition before automatic redirect
            const card = registroForm.closest('.card');
            if (card) card.classList.add('animate-save');
            
            setTimeout(() => {
                const currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                window.location.href = currentPath + 'login.html';
            }, 600);
        });
    }

    // --- Login Logic ---

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            const users = getUsers();
            const user = users.find(u => u.correo === correo && u.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'lista.html';
            } else {
                alert('Credenciales inválidas.');
            }
        });
    }

    // --- Edit Logic ---
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const originalEmail = document.getElementById('editOriginalEmail').value;
            const nuevoNombre = document.getElementById('editNombre').value;
            const nuevoCorreo = document.getElementById('editCorreo').value;

            let users = getUsers();
            const userIndex = users.findIndex(u => u.correo === originalEmail);

            if (userIndex !== -1) {
                // Check if new email already exists (and it's not the same user)
                if (nuevoCorreo !== originalEmail && users.find(u => u.correo === nuevoCorreo)) {
                    return alert('El nuevo correo ya está en uso por otro usuario.');
                }

                users[userIndex].nombre = nuevoNombre;
                users[userIndex].correo = nuevoCorreo;
                saveUsers(users);
                
                // Update current user if they edited themselves
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser && currentUser.correo === originalEmail) {
                    currentUser.nombre = nuevoNombre;
                    currentUser.correo = nuevoCorreo;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }

                closeModal(); // Close first for better UX
                renderUsers(); // Re-render instead of full reload for "immediate" feel
            }
        });
    }

    // --- Rendering Logic ---

    if (userTableBody) {
        renderUsers();
    }
});

function renderUsers() {
    const userTableBody = document.getElementById('userTableBody');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.length === 0) {
        userTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 3rem; color: var(--text-muted);">No hay registros.</td></tr>`;
        return;
    }

    userTableBody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--surface-low); display: flex; align-items: center; justify-content: center; color: var(--primary);">
                        <span class="material-symbols-outlined">person</span>
                    </div>
                    <span style="font-weight: 600;">${user.nombre}</span>
                </div>
            </td>
            <td>${user.correo}</td>
            <td><span class="badge ${user.status === 'Activo' ? 'badge-success' : 'badge-warning'}">${user.status}</span></td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" style="padding: 0.5rem;" onclick="openEditModal('${user.nombre}', '${user.correo}')">
                        <span class="material-symbols-outlined" style="font-size: 1.25rem;">edit</span>
                    </button>
                    <button class="btn btn-outline" style="padding: 0.5rem;" onclick="deleteUser('${user.correo}')">
                        <span class="material-symbols-outlined" style="font-size: 1.25rem; color: var(--accent);">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openEditModal(nombre, correo) {
    document.getElementById('editOriginalEmail').value = correo;
    document.getElementById('editNombre').value = nombre;
    document.getElementById('editCorreo').value = correo;
    document.getElementById('editModal').classList.add('active');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
}

function deleteUser(email) {
    if (confirm('¿Estás seguro de eliminar esta identidad?')) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        users = users.filter(u => u.correo !== email);
        localStorage.setItem('users', JSON.stringify(users));
        location.reload();
    }
}
