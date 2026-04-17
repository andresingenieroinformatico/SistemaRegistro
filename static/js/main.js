/** 
 * Sistema de Registro - Logic System 
 * PHP Backend Integration & Data Persistence
 */

const API_BASE = '../../backend/api';

document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registroForm');
    const loginForm = document.getElementById('loginForm');
    const editForm = document.getElementById('editForm');
    const createForm = document.getElementById('adminCreateForm');
    const openCreateUserBtn = document.getElementById('openCreateUserBtn');
    const userTableBody = document.getElementById('userTableBody');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnMobile = document.getElementById('logoutBtnMobile');

    // --- Helper Functions ---

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE}/usuarios.php`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    };

    // --- Protection Middleware ---
    const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;

    if (userTableBody) {
        if (!currentUser) {
            window.location.href = 'login.html';
        } else if (currentUser.role !== 'admin') {
            window.location.href = 'user.html';
        }
    }

    // --- Logout Logic ---
    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', handleLogout);
    }

    // --- Registration Logic ---

    if (registroForm) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('registroError');
            const errorMsg = document.getElementById('registroErrorMessage');

            errorDiv.style.display = 'none';

            try {
                const response = await fetch(`${API_BASE}/registro.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, correo, password })
                });

                const result = await response.json();

                if (result.error) {
                    errorMsg.textContent = result.error;
                    errorDiv.style.display = 'flex';
                    return;
                }

                // Visual transition before automatic redirect
                const card = registroForm.closest('.card');
                if (card) card.classList.add('animate-save');
                
                setTimeout(() => {
                    const currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                    window.location.href = currentPath + 'login.html';
                }, 600);
            } catch (error) {
                errorMsg.textContent = 'Error al conectar con el servidor.';
                errorDiv.style.display = 'flex';
            }
        });
    }

    // --- Login Logic ---

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('loginError');
            const errorMsg = document.getElementById('errorMessage');

            // Hide previous errors
            errorDiv.style.display = 'none';

            try {
                const response = await fetch(`${API_BASE}/login.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, password })
                });

                const result = await response.json();

                if (result.user) {
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                    const isAdmin = result.user.role && result.user.role === 'admin';
                    window.location.href = isAdmin ? 'lista.html' : 'user.html';
                } else {
                    errorMsg.textContent = result.error || 'Credenciales inválidas.';
                    errorDiv.style.display = 'flex';
                }
            } catch (error) {
                errorMsg.textContent = 'Error al conectar con el servidor.';
                errorDiv.style.display = 'flex';
            }
        });
    }

    if (openCreateUserBtn) {
        openCreateUserBtn.addEventListener('click', () => {
            document.getElementById('createModal').classList.add('active');
        });
    }

    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('adminNombre').value;
            const correo = document.getElementById('adminCorreo').value;
            const password = document.getElementById('adminPassword').value;
            const errorDiv = document.getElementById('createError');
            const errorMsg = document.getElementById('createErrorMessage');

            errorDiv.style.display = 'none';

            try {
                const response = await fetch(`${API_BASE}/registro.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, correo, password })
                });

                const result = await response.json();

                if (result.error) {
                    errorMsg.textContent = result.error;
                    errorDiv.style.display = 'flex';
                    return;
                }

                createForm.reset();
                document.getElementById('createModal').classList.remove('active');
                renderUsers();
            } catch (error) {
                errorMsg.textContent = 'Error al conectar con el servidor.';
                errorDiv.style.display = 'flex';
            }
        });
    }

    // --- Edit Logic ---
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editUserId').value;
            const nuevoNombre = document.getElementById('editNombre').value;
            const nuevoCorreo = document.getElementById('editCorreo').value;
            const errorDiv = document.getElementById('editError');
            const errorMsg = document.getElementById('editErrorMessage');

            errorDiv.style.display = 'none';

            try {
                const response = await fetch(`${API_BASE}/usuarios.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, nombre: nuevoNombre, correo: nuevoCorreo })
                });

                const result = await response.json();

                if (result.error) {
                    errorMsg.textContent = result.error;
                    errorDiv.style.display = 'flex';
                    return;
                }

                // Update current user in local storage if they edited themselves
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser && currentUser.id == id) {
                    currentUser.nombre = nuevoNombre;
                    currentUser.correo = nuevoCorreo;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }

                closeModal();
                renderUsers();
            } catch (error) {
                errorMsg.textContent = 'Error al actualizar el usuario.';
                errorDiv.style.display = 'flex';
            }
        });
    }

    // --- Rendering Logic ---

    const userPageTitle = document.getElementById('userPageTitle');
    const userPageEmail = document.getElementById('userPageEmail');
    if (userPageTitle && currentUser) {
        if (currentUser.role === 'admin') {
            window.location.href = 'lista.html';
        }
        userPageTitle.textContent = currentUser.nombre || 'Usuario';
        if (userPageEmail) {
            userPageEmail.textContent = currentUser.correo || '';
        }
    }

    if (userTableBody) {
        renderUsers();
    }
});

async function renderUsers() {
    const userTableBody = document.getElementById('userTableBody');
    if (!userTableBody) return;

    try {
        const response = await fetch('../../backend/api/usuarios.php');
        const users = await response.json();
        
        if (!users || users.length === 0 || users.error) {
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
                        <button class="btn btn-outline" style="padding: 0.5rem;" onclick="openEditModal('${user.id}', '${user.nombre}', '${user.correo}')">
                            <span class="material-symbols-outlined" style="font-size: 1.25rem;">edit</span>
                        </button>
                        <button class="btn btn-outline" style="padding: 0.5rem;" onclick="deleteUser('${user.id}')">
                            <span class="material-symbols-outlined" style="font-size: 1.25rem; color: var(--accent);">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error rendering users:', error);
    }
}

function openEditModal(id, nombre, correo) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editNombre').value = nombre;
    document.getElementById('editCorreo').value = correo;
    document.getElementById('editModal').classList.add('active');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
}

function closeCreateModal() {
    document.getElementById('createModal').classList.remove('active');
}

async function deleteUser(id) {
    if (confirm('¿Estás seguro de eliminar esta identidad?')) {
        try {
            const response = await fetch(`../../backend/api/usuarios.php?id=${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.message) {
                renderUsers();
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Error al eliminar el usuario.');
        }
    }
}
