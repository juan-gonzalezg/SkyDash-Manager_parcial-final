# 🌤️ SkyDash-Manager (parcial-final)

> **Plataforma avanzada de visualización y analítica meteorológica georreferenciada.**

SkyDash-Manager es una aplicación web de una sola página (SPA) diseñada para ofrecer una experiencia completa de monitoreo meteorológico en tiempo real. Integra mapas interactivos, geolocalización, pronósticos extendidos a 7 días, gestión de ubicaciones favoritas y persistencia local de datos. La aplicación cuenta con resiliencia de red avanzada, permitiendo su funcionamiento tanto en entornos conectados como en modo offline.

La interfaz de usuario ha sido cuidadosamente diseñada implementando principios de **neumorfismo** y **vidriomorfismo (glassmorphism)**, ofreciendo una estética moderna con colores adaptados para una visualización óptima tanto de día como de noche (modo claro/oscuro).

---

## 📋 Tabla de Contenido
- [✨ Características Principales](#-características-principales)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [📂 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Instrucciones de Ejecución](#-instrucciones-de-ejecución)
- [⚙️ Módulos Clave](#️-módulos-clave)
- [📡 Resiliencia y Modo Offline](#-resiliencia-y-modo-offline)
- [🌓 Tematización Dual](#-tematización-dual)

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- **Formulario de Inicio de Sesión**: Control de acceso con pantalla de bienvenida antes de ingresar al panel privado.
- **Validación Visual**: Indicadores de carga interactivos (spinners) mientras se validan las credenciales.
- **Manejo de Sesión Seguro**: Cierre de sesión con limpieza de tokens y restauración al inicio.
- **Credenciales Demo**: `admin` / `admin`.

### 🗺️ Georreferenciación e Integración de Mapas
- **Ubicación Predeterminada**: Al iniciar, la aplicación se sitúa de forma automática en **Caracas (UCAB Montalbán), Venezuela** (Coordenadas: `10.4632`, `-66.9758`).
- **Mapa Leaflet Interactivo**: Renderizado dinámico de mapas en tiempo real con soporte de eventos al hacer clic.
- **Marcador Adaptativo**: Marcadores geográficos que reflejan visualmente el clima de la zona mediante emojis (`DivIcon`).
- **Geocodificación Directa**: Buscador de locaciones con autocompletado y animación fluida al punto geográfico seleccionado.
- **Geocodificación Inversa**: Conversión de coordenadas de clics en nombres de ubicaciones legibles gracias a la API de Nominatim.

### 🌤️ Panel Meteorológico en Tiempo Real
- **Condiciones Actuales**: Visualización instantánea de temperatura, humedad, velocidad del viento y presión atmosférica.
- **Pronóstico a 7 Días**: Lista detallada con el estado del tiempo para los próximos días mediante datos estructurados.
- **Sincronización Dinámica**: Actualización automática de datos climáticos al reposicionar el mapa o seleccionar una ubicación.

### 📌 Gestión de Favoritos
- **Guardado Rápido**: Guardar la ubicación seleccionada directamente desde la interfaz del mapa.
- **Persistencia con LocalStorage**: Las ubicaciones preferidas se almacenan de forma local en el navegador del usuario y sobreviven a recargas o cierres de sesión.
- **Navegación Instantánea**: Al hacer clic en un favorito, el mapa se desplaza al punto y refresca los datos climáticos.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Propósito y Aplicación |
| :--- | :--- |
| **HTML5** | Estructura semántica de la SPA y contenedores dinámicos. |
| **CSS3** | Estilos visuales personalizados (Neumorfismo, Glassmorphism, CSS Variables, Layouts con Flexbox y Grid). |
| **JavaScript (ES6+ / Módulos)** | Lógica de negocio interactiva estruturada en módulos estándar (`type="module"`), llamadas a APIs asíncronas y almacenamiento. |
| **LeafletJS** | Biblioteca de mapas interactivos adaptables a móviles. |
| **OpenStreetMap / Nominatim** | Servicio para geocodificación inversa y búsqueda de direcciones. |
| **Open-Meteo API** | Consumo de datos meteorológicos actuales y pronósticos de mediano plazo sin necesidad de API Key. |
| **LocalStorage** | Persistencia local de preferencias, favoritos y datos meteorológicos de respaldo (caché). |

---

## 📂 Estructura del Proyecto

El código está estructurado de manera simple y modular para facilitar su mantenimiento:

```
parcial-final/
├── css/
│   └── styles.css          # Variables de diseño, temas claro/oscuro, neumorfismo y layouts.
├── html/
│   └── index.html          # Interfaz principal estructurada por secciones y contenedores semánticos.
├── js/
│   └── app.js              # Controlador principal (Módulo ES6), interacción con APIs, mapas y lógica del negocio.
└── README.md               # Documentación del proyecto.
```

- [html/index.html](file:///c:/Users/cpustorevzla/Documents/Mar-Jul_25-26/Programacion-Orientada-a-la-Web/parcial-final/html/index.html): Define la estructura base de la aplicación.
- [css/styles.css](file:///c:/Users/cpustorevzla/Documents/Mar-Jul_25-26/Programacion-Orientada-a-la-Web/parcial-final/css/styles.css): Proporciona la identidad visual moderna (neumorfismo/vidrio).
- [js/app.js](file:///c:/Users/cpustorevzla/Documents/Mar-Jul_25-26/Programacion-Orientada-a-la-Web/parcial-final/js/app.js): Contiene la lógica interactiva del módulo y conexiones con los servicios externos.

---

## 🚀 Instrucciones de Ejecución

> [!WARNING]
> **Requisito Obligatorio del Navegador (CORS):**
> Dado que la aplicación carga el script principal [app.js](file:///c:/Users/cpustorevzla/Documents/Mar-Jul_25-26/Programacion-Orientada-a-la-Web/parcial-final/js/app.js) como un módulo ES (`type="module"`), no es posible ejecutar el archivo `index.html` haciendo doble clic directamente desde el explorador de archivos (protocolo `file://`). Los navegadores modernos bloquean estas peticiones por seguridad.
> 
> **Debe servirse el proyecto a través de un servidor HTTP local.**

### Servidor Local Recomendado

Ejecuta cualquiera de los siguientes servidores web en el directorio raíz del proyecto:

#### 1. Con Python (Viene preinstalado en la mayoría de sistemas)
```bash
# Ejecutar en la raíz del proyecto
python -m http.server 8000
```
Luego, abre tu navegador e ingresa a `http://localhost:8000/html/index.html`.

#### 2. Con Node.js (Live Server / http-server)
```bash
# Servidor web rápido en Node
npx http-server -p 8000
```
Luego, ingresa a `http://localhost:8000/html/index.html`.

---

## ⚙️ Módulos Clave

### 1. Sistema de Notificaciones (Toasts)
En lugar de los tradicionales e intrusivos `alert()` del navegador, la aplicación cuenta con un gestor dinámico de notificaciones tipo Toast, el cual muestra mensajes flotantes para informar sobre estados de guardado, errores de red y cambios de sesión.

### 2. Sincronización del Mapa y Clima
La lógica en `app.js` encapsula las coordenadas actuales. Cada vez que el usuario hace clic en el mapa, busca una ubicación mediante geocodificación o selecciona un favorito, se disparan simultáneamente:
1. La actualización del marcador visual del mapa.
2. La solicitud de información meteorológica actualizada a la API de **Open-Meteo**.
3. La consulta del nombre legible de la ubicación usando la API de **Nominatim**.

---

## 📡 Resiliencia y Modo Offline
SkyDash-Manager está diseñado para ser tolerante a fallos de red:
- **Detección Automática**: Escucha los eventos `online` y `offline` del navegador.
- **Caché Meteorológico**: Guarda la respuesta del último clima consultado de forma local.
- **Banner de Estado**: Muestra un aviso persistente en la parte superior cuando se pierde la conexión a internet.
- **Recuperación**: Si la red vuelve, oculta el banner y permite realizar nuevas peticiones al servidor web de Open-Meteo.

---

## 🌓 Tematización Dual
El sistema utiliza variables CSS personalizadas (`--bg-primary`, `--text-primary`, `--shadow-dark`, etc.) definidas en `styles.css`. El selector de tema alterna dinámicamente la clase `.dark` en la etiqueta de contenedor principal, actualizando de forma fluida todos los colores y sombras neumórficas de la aplicación.
