/** 
 * Sistema de Registro - Logic System 
 * PHP Backend Integration & Data Persistence
 */

const API_BASE = '../../backend/api';

const fetchUsers = async () => {
    try {
        const response = await fetch(`${API_BASE}/usuarios.php`);
        const users = await response.json();
        if (users.error) {
            console.error('Error fetching users:', users.error);
            return { error: users.error };
        }
        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return { error: 'No se pudo conectar al servidor de usuarios.' };
    }
};

const getUserInitials = (user) => {
    const first = user.primer_nombre ? user.primer_nombre.trim().charAt(0).toUpperCase() : '';
    const last = user.primer_apellido ? user.primer_apellido.trim().charAt(0).toUpperCase() : '';
    return `${first}${last}` || 'U';
};

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

    const getUrlParam = (name) => new URLSearchParams(window.location.search).get(name);
    const editUserIdFromQuery = getUrlParam('id');

    // --- Protection Middleware ---
    const currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;

    if (userTableBody) {
        if (!currentUser) {
            window.location.href = 'login.html';
        } else if (currentUser.role !== 'docente') {
            window.location.href = 'user.html';
        }
    }

    if (editForm) {
        if (!currentUser) {
            window.location.href = 'login.html';
        } else if (currentUser.role !== 'docente') {
            window.location.href = 'user.html';
        }

        if (editUserIdFromQuery) {
            loadUserForEdit(editUserIdFromQuery);
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
            const primer_nombre = document.getElementById('primer_nombre').value;
            const segundo_nombre = document.getElementById('segundo_nombre').value;
            const primer_apellido = document.getElementById('primer_apellido').value;
            const segundo_apellido = document.getElementById('segundo_apellido').value;
            const edad = document.getElementById('edad').value;
            const cedula = document.getElementById('cedula').value;
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('registroError');
            const errorMsg = document.getElementById('registroErrorMessage');

            errorDiv.style.display = 'none';

            try {
                const role = document.getElementById('adminRole') ? document.getElementById('adminRole').value : 'estudiante';
                const response = await fetch(`${API_BASE}/registro.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, edad, cedula, correo, password, role })
                });

                const result = await response.json();

                if (result.error) {
                    errorMsg.textContent = result.error;
                    errorDiv.style.display = 'flex';
                    return;
                }

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
                    const isDocente = result.user.role && result.user.role === 'docente';
                    window.location.href = isDocente ? 'lista.html' : 'user.html';
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
            const primer_nombre = document.getElementById('adminPrimerNombre').value;
            const segundo_nombre = document.getElementById('adminSegundoNombre').value;
            const primer_apellido = document.getElementById('adminPrimerApellido').value;
            const segundo_apellido = document.getElementById('adminSegundoApellido').value;
            const edad = document.getElementById('adminEdad').value;
            const cedula = document.getElementById('adminCedula').value;
            const correo = document.getElementById('adminCorreo').value;
            const password = document.getElementById('adminPassword').value;
            const role = document.getElementById('adminRole').value;
            const errorDiv = document.getElementById('createError');
            const errorMsg = document.getElementById('createErrorMessage');

            errorDiv.style.display = 'none';

            try {
                const response = await fetch(`${API_BASE}/usuarios.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, edad, cedula, correo, password, role })
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
            const primer_nombre = document.getElementById('editPrimerNombre').value;
            const segundo_nombre = document.getElementById('editSegundoNombre').value;
            const primer_apellido = document.getElementById('editPrimerApellido').value;
            const segundo_apellido = document.getElementById('editSegundoApellido').value;
            const edad = document.getElementById('editEdad').value;
            const cedula = document.getElementById('editCedula').value;
            const correo = document.getElementById('editCorreo').value;
            const role = document.getElementById('editRole').value;
            const status = document.getElementById('editStatus').value;
            const errorDiv = document.getElementById('editError');
            const errorMsg = document.getElementById('editErrorMessage');

            errorDiv.style.display = 'none';

            try {
                const response = await fetch(`${API_BASE}/usuarios.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, edad, cedula, correo, role, status })
                });

                const result = await response.json();

                if (result.error) {
                    errorMsg.textContent = result.error;
                    errorDiv.style.display = 'flex';
                    return;
                }

                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser && currentUser.id == id) {
                    currentUser.primer_nombre = primer_nombre;
                    currentUser.segundo_nombre = segundo_nombre;
                    currentUser.primer_apellido = primer_apellido;
                    currentUser.segundo_apellido = segundo_apellido;
                    currentUser.edad = edad;
                    currentUser.cedula = cedula;
                    currentUser.correo = correo;
                    currentUser.role = role;
                    currentUser.status = status;
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
        if (currentUser.role === 'docente') {
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
        const users = await fetchUsers();
        
        if (!users || users.error) {
            userTableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 3rem; color: var(--text-muted);">${users && users.error ? users.error : 'No hay registros.'}</td></tr>`;
            return;
        }

        if (users.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 3rem; color: var(--text-muted);">No hay registros.</td></tr>`;
            return;
        }

        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="avatar-initials">${getUserInitials(user)}</div>
                </td>
                <td>${user.primer_nombre || ''}</td>
                <td>${user.segundo_nombre || ''}</td>
                <td>${user.primer_apellido || ''}</td>
                <td>${user.segundo_apellido || ''}</td>
                <td>${user.correo}</td>
                <td>${user.cedula || ''}</td>
                <td>${user.edad || ''}</td>
                <td>${user.role || ''}</td>
                <td><span class="badge ${user.status === 'Activo' ? 'badge-success' : 'badge-warning'}">${user.status || 'Inactivo'}</span></td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <a href="editar-usuario.html?id=${user.id}" class="btn btn-outline" style="padding: 0.5rem; display: inline-flex; align-items: center; justify-content: center;">
                            <span class="material-symbols-outlined" style="font-size: 1.25rem;">edit</span>
                        </a>
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

function openEditModal(id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, edad, cedula, correo, role, status) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editPrimerNombre').value = primer_nombre;
    document.getElementById('editSegundoNombre').value = segundo_nombre;
    document.getElementById('editPrimerApellido').value = primer_apellido;
    document.getElementById('editSegundoApellido').value = segundo_apellido;
    document.getElementById('editEdad').value = edad;
    document.getElementById('editCedula').value = cedula;
    document.getElementById('editCorreo').value = correo;
    document.getElementById('editRole').value = role;
    document.getElementById('editStatus').value = status;
    document.getElementById('editModal').classList.add('active');
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
}

function closeCreateModal() {
    document.getElementById('createModal').classList.remove('active');
}

async function fetchUserById(id) {
    try {
        const response = await fetch(`${API_BASE}/usuarios.php?id=${id}`);
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error cargando usuario:', error);
        return null;
    }
}

async function loadUserForEdit(id) {
    const user = await fetchUserById(id);
    if (!user || user.error) {
        const editFormContainer = document.querySelector('#editForm');
        if (editFormContainer) {
            editFormContainer.innerHTML = `<div class="alert-error" style="display: flex;">Usuario no encontrado o no disponible.</div>`;
        }
        return;
    }

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editPrimerNombre').value = user.primer_nombre || '';
    document.getElementById('editSegundoNombre').value = user.segundo_nombre || '';
    document.getElementById('editPrimerApellido').value = user.primer_apellido || '';
    document.getElementById('editSegundoApellido').value = user.segundo_apellido || '';
    document.getElementById('editEdad').value = user.edad || '';
    document.getElementById('editCedula').value = user.cedula || '';
    document.getElementById('editCorreo').value = user.correo || '';
    document.getElementById('editRole').value = user.role || 'estudiante';
    document.getElementById('editStatus').value = user.status || 'Activo';
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
