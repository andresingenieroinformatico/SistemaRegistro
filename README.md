# Sistema de Registro - Modern Zen Platform

Una plataforma web minimalista y premium diseñada para la gestión eficiente de identidades de usuarios. Este proyecto combina una estética "Modern Zen" con una funcionalidad robusta de persistencia local, enfocada en la claridad visual y la experiencia de usuario fluida.

![Demo Banner](../../static/image/hero.png)

## ✨ Características Principales

-   **Landing Page de Alto Impacto**: Diseño de héroe en dos columnas con ilustraciones 3D personalizadas y propuesta de valor clara.
-   **Sistema de Autenticación Simulado**:
    -   **Registro**: Validación de correos únicos y redirección automática al acceso.
    -   **Acceso (Login)**: Verificación de credenciales contra el almacenamiento local.
-   **Dashboard Administrativo**:
    -   **Listado de Usuarios**: Visualización clara con espaciado optimizado.
    -   **Edición Avanzada**: Formato de edición sobreescrito mediante un overlay de pantalla completa con desenfoque (`glassmorphism`).
    -   **Gestión de Datos**: Capacidad de eliminar registros y actualizar información en tiempo real.
-   **Persistencia Local**: Uso de `LocalStorage` para mantener los datos de los usuarios de forma persistente en el navegador sin necesidad de una base de datos externa inicialmente.
-   **Diseño Modern Zen**: Interfaz ligera basada en tonos Slate e Indigo, centrada en reducir la fatiga visual.

## 🚀 Tecnologías Utilizadas

-   **HTML5 Semántico**: Para una estructura sólida y accesible.
-   **CSS3 (Vanilla)**: Sistema de diseño personalizado, animaciones fluidas y efectos de desenfoque.
-   **JavaScript (ES6+)**: Lógica de persistencia, manejo de eventos de UI y renderizado dinámico.
-   **Google Fonts**: Tipografía profesional (Inter).
-   **Material Symbols**: Iconografía moderna y minimalista.

## 📂 Estructura del Proyecto

```text
SistemaRegistro/
├── public/
│   └── template/
│       ├── index.html     # Página de inicio
│       ├── registro.html  # Formulario de registro
│       ├── login.html     # Formulario de acceso
│       └── lista.html     # Dashboard / Listado de usuarios
├── static/
│   ├── css/
│   │   └── styles.css     # Sistema de diseño "Modern Zen"
│   ├── js/
│   │   └── main.js       # Lógica de autenticación y CRUD
│   └── image/
│       └── hero.png       # Ilustración principal
└── README.md
```

## 🛠️ Instalación y Uso

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/andresingenieroinformatico/SistemaRegistro.git
    ```
2.  **Abrir el proyecto**:
    Simplemente abre el archivo `public/template/index.html` en cualquier navegador moderno. No requiere de servidores backend ni procesos de compilación.

3.  **Flujo de Usuario**:
    -   Regístrate en la página de **Registro**.
    -   Inicia sesión con tus credenciales.
    -   Gestiona tus usuarios desde el **Dashboard**.

## 🎨 Filosofía de Diseño: Modern Zen

El proyecto sigue una filosofía de diseño que prioriza:
-   **Espacio Negativo**: Para permitir que el contenido "respire".
-   **Micro-animaciones**: Proporcionando feedback visual inmediato (como la transición al guardar datos).
-   **Consistencia**: Uso riguroso de una paleta de colores y variables de radio para lograr una apariencia cohesiva en cada pantalla.

---

**Desarrollado por Andres Garcia**
*Elevando la gestión de identidades digitales con diseño editorial.*
