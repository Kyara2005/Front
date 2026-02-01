<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Usuarios</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background-color: #f3f4f6;
        }
    </style>
</head>
<body class="p-4 md:p-8">

    <div class="max-w-6xl mx-auto">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Encabezado -->
            <div class="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 class="text-2xl font-bold text-gray-800">Lista de Usuarios</h2>
                <div class="relative">
                    <input type="text" id="searchInput" placeholder="Buscar usuario..." 
                        class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64">
                    <span class="absolute left-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                </div>
            </div>

            <!-- Tabla Responsiva -->
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                            <th class="py-3 px-6 font-semibold">ID</th>
                            <th class="py-3 px-6 font-semibold">Usuario</th>
                            <th class="py-3 px-6 font-semibold">Email</th>
                            <th class="py-3 px-6 font-semibold">Rol</th>
                            <th class="py-3 px-6 font-semibold">Estado</th>
                            <th class="py-3 px-6 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="userTableBody" class="text-gray-600 text-sm font-light">
                        <!-- Los datos se insertan mediante JS -->
                    </tbody>
                </table>
            </div>

            <!-- Footer con contador -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p class="text-gray-500 text-sm">Mostrando <span id="userCount" class="font-medium">0</span> usuarios registrados.</p>
            </div>
        </div>
    </div>

    <script>
        // Datos de ejemplo
        const usuarios = [
            { id: 1, nombre: "Deyaneir", email: "deyan@example.com", rol: "Administrador", estado: "Activo" },
            { id: 2, nombre: "Juan Pérez", email: "juan.p@gmail.com", rol: "Editor", estado: "Inactivo" },
            { id: 3, nombre: "María García", email: "m.garcia@web.es", rol: "Usuario", estado: "Activo" },
            { id: 4, nombre: "Carlos Ruiz", email: "cruiz_dev@outlook.com", rol: "Editor", estado: "Pendiente" },
            { id: 5, nombre: "Ana López", email: "ana.l@tecnologia.com", rol: "Administrador", estado: "Activo" }
        ];

        const tableBody = document.getElementById('userTableBody');
        const searchInput = document.getElementById('searchInput');
        const userCount = document.getElementById('userCount');

        function renderTable(data) {
            tableBody.innerHTML = '';
            data.forEach(user => {
                const row = document.createElement('tr');
                row.className = 'border-b border-gray-200 hover:bg-gray-100 transition-colors';
                
                // Color del badge de estado
                const statusColor = {
                    'Activo': 'bg-green-100 text-green-700',
                    'Inactivo': 'bg-red-100 text-red-700',
                    'Pendiente': 'bg-yellow-100 text-yellow-700'
                }[user.estado] || 'bg-gray-100 text-gray-700';

                row.innerHTML = `
                    <td class="py-3 px-6 text-left whitespace-nowrap font-medium">${user.id}</td>
                    <td class="py-3 px-6 text-left">
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                                ${user.nombre.charAt(0)}
                            </div>
                            <span class="font-medium">${user.nombre}</span>
                        </div>
                    </td>
                    <td class="py-3 px-6 text-left">${user.email}</td>
                    <td class="py-3 px-6 text-left">${user.rol}</td>
                    <td class="py-3 px-6 text-left">
                        <span class="${statusColor} py-1 px-3 rounded-full text-xs font-semibold">
                            ${user.estado}
                        </span>
                    </td>
                    <td class="py-3 px-6 text-center">
                        <div class="flex item-center justify-center gap-3">
                            <button class="text-blue-500 hover:text-blue-700" title="Editar">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button class="text-red-500 hover:text-red-700" title="Eliminar">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            userCount.innerText = data.length;
        }

        // Buscador funcional
        searchInput.addEventListener('input', (e) => {
            const text = e.target.value.toLowerCase();
            const filtered = usuarios.filter(u => 
                u.nombre.toLowerCase().includes(text) || 
                u.email.toLowerCase().includes(text) ||
                u.rol.toLowerCase().includes(text)
            );
            renderTable(filtered);
        });

        // Inicializar tabla
        window.onload = () => renderTable(usuarios);
    </script>
</body>
</html>
