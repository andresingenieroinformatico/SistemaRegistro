/** 
 * Nocturne Registry - Logic System 
 * Simulated User Authentication & Data Persistence
 */

document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registroForm');
    const loginForm = document.getElementById('loginForm');
    const userTableBody = document.getElementById('userTableBody');

    // --- Helper Functions ---

    const getUsers = () => {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    };

    const saveUsers = (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    };

    const showMessage = (msg, isError = false) => {
        alert(msg); // Simplified for this demo, can be improved to a toast
    };

    // --- Registration Logic ---

    if (registroForm) {
        registroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            const users = getUsers();

            // Check if user already exists
            if (users.find(u => u.correo === correo)) {
                return showMessage('Este correo ya está registrado.', true);
            }

            const newUser = {
                nombre,
                correo,
                password, // Note: In a real app, passwords should NEVER be saved in plain text
                fecha: new Date().toLocaleDateString(),
                status: 'Activo'
            };

            users.push(newUser);
            saveUsers(users);

            showMessage('¡Registro exitoso! Iniciando sesión...');
            // Optional: Auto-login after registration
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            window.location.href = 'lista.html';
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
                showMessage('Credenciales inválidas. Intenta de nuevo.', true);
            }
        });
    }

    // --- List Display Logic ---

    if (userTableBody) {
        const users = getUsers();
        
        if (users.length === 0) {
            userTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 3rem; color: var(--on-surface-variant);">
                        No hay identidades registradas en el archivo.
                    </td>
                </tr>
            `;
        } else {
            userTableBody.innerHTML = users.map(user => `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--surface-highest); display: flex; align-items: center; justify-content: center; border: 2px solid ${user.status === 'Activo' ? 'var(--primary)' : 'var(--secondary)'};">
                                <span class="material-symbols-outlined" style="font-size: 1.25rem;">person</span>
                            </div>
                            <span style="font-weight: 600;">${user.nombre}</span>
                        </div>
                    </td>
                    <td>${user.correo}</td>
                    <td><span class="status-badge ${user.status === 'Activo' ? '' : 'pending'}">${user.status}</span></td>
                    <td>
                        <span class="material-symbols-outlined" style="cursor: pointer; color: var(--on-surface-variant);" onclick="deleteUser('${user.correo}')">delete</span>
                    </td>
                </tr>
            `).join('');
        }
    }
});

// Global function for deletion (simulated)
function deleteUser(email) {
    if (confirm('¿Estás seguro de que deseas eliminar esta identidad del archivo?')) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        users = users.filter(u => u.correo !== email);
        localStorage.setItem('users', JSON.stringify(users));
        location.reload();
    }
}
