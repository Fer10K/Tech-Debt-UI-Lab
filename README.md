# Tech Debt UI Lab — ClientFlow

Segundo proyecto de prueba para auditar deuda técnica. Es un mini CRM con interfaz web, dashboard, directorio de clientes, seguimientos y reportes.

## Requisitos
- Node.js 18 o superior
- npm

## Instalación y ejecución
```bash
npm install
npm run dev
```
Abre la URL que indique Vite (normalmente http://localhost:5173).

Para comprobar que compila:
```bash
npm run build
```

## Funcionalidades
- Dashboard con indicadores y gráfica.
- Alta, edición, búsqueda, filtrado y eliminación de clientes.
- Creación y seguimiento de tareas.
- Reporte de clientes por estado.
- Persistencia sencilla con localStorage.

## Dependencias
El package.json mezcla versiones recientes y antiguas intencionalmente. No actualices las dependencias antes de ejecutar la auditoría.

## Deuda técnica intencional
- Archivo principal con múltiples responsabilidades.
- Funciones extensas y complejidad condicional.
- Código HTML generado mediante concatenación de strings.
- Uso de `innerHTML` con datos que pueden provenir de formularios.
- Funciones globales expuestas en `window` para eventos inline.
- Estado mutable compartido y persistencia acoplada a la UI.
- Duplicación de lógica de presentación y filtrado.
- Dependencias antiguas y una integración externa simulada.
- Importaciones/dependencias que pueden estar sin uso.
- Validación limitada de datos.
- Manejo de errores básico.

## Datos
Los datos iniciales son ficticios y se guardan en el almacenamiento local del navegador. Usa únicamente información de prueba.

## Aviso
Proyecto educativo deliberadamente imperfecto. No utilizar en producción ni introducir datos personales reales.
