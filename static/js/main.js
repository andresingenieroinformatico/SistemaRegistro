/** 
 * Sistema de Registro - Logic System 
 * PHP Backend Integration & Data Persistence
 */

const API_BASE = '../../backend/api';

document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registroForm');
    const loginForm = document.getElementById('loginForm');
    const editForm = document.getElementById('editForm');
    const userTableBody = document.getElementById('userTableBody');
    const logoutBtn = document.getElementById('logoutBtn');

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
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_BASE}/registro.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, correo, password })
                });

                const result = await response.json();

                if (result.error) {
                    return alert(result.error);
                }

                // Visual transition before automatic redirect
                const card = registroForm.closest('.card');
                if (card) card.classList.add('animate-save');
                
                setTimeout(() => {
                    const currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
                    window.location.href = currentPath + 'login.html';
                }, 600);
            } catch (error) {
                alert('Error al conectar con el servidor.');
            }
        });
    }

    // --- Login Logic ---

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_BASE}/login.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, password })
                });

                const result = await response.json();

                if (result.user) {
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                    window.location.href = 'lista.html';
                } else {
                    alert(result.error || 'Credenciales inválidas.');
                }
            } catch (error) {
                alert('Error al conectar con el servidor.');
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

            try {
                const response = await fetch(`${API_BASE}/usuarios.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, nombre: nuevoNombre, correo: nuevoCorreo })
                });

                const result = await response.json();

                if (result.error) {
                    return alert(result.error);
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
                alert('Error al actualizar el usuario.');
            }
        });
    }

    // --- Rendering Logic ---

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

