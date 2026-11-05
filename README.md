# Astral

Aplicación **Astra Estudio** para organizar cursos y estudiar con materiales propios.

Aplicación de estudio con cursos independientes, un plan de aprendizaje por asignatura, materiales propios, actividades y seguimiento.

## Funciones

- Cursos separados con fecha de examen y un idioma de respuesta propio: castellano, euskera o inglés. La selección se conserva en el curso y se valida también al sincronizarlo con la cuenta.
- Plan de estudio por curso ajustado a la nota objetivo, con pasos marcables, intensidad semanal y progreso guardado.
- Plan de 7 a 10 pasos dentro de cada curso, ajustado a la nota objetivo y seguido de herramientas extra para esa asignatura.
- Hasta 50 fuentes por curso, incluyendo varios PDF, Word, PowerPoint, Excel, imágenes, vídeo, enlaces web y YouTube.
- Inicio de sesión con Netlify Identity. Al entrar, los cursos locales se copian a la cuenta si todavía no hay cursos en la nube.
- Cursos guardados en Netlify Blobs con una clave separada por usuario. Los archivos se suben en bloques y quedan asociados al curso y a la cuenta.
- Sesión con cookies gestionadas en funciones de Netlify; las funciones verifican la identidad antes de leer o guardar datos.
- Actividades, consignas, respuestas de muestra, avisos y controles de aprendizaje traducidos al idioma elegido para cada curso.
- Simulacro escrito en PDF con dificultad y tiempo configurables. Las preguntas y etiquetas del PDF respetan el idioma del curso.

## Ejecutar localmente

Requiere Node.js 18 o posterior. Instala las dependencias y arranca el entorno de Netlify:

```sh
npm install
npm start
```

La app se abre normalmente en `http://localhost:8888`. `netlify dev` conecta las funciones a la aplicación local. Identity y Blobs necesitan que el proyecto esté vinculado a un sitio Netlify; en local sin ese vínculo, la interfaz sigue disponible pero no hay sincronización.

## Publicar en Netlify

1. Sube esta carpeta a un repositorio Git o vincúlala como proyecto en Netlify.
2. Netlify usa `netlify.toml`: ejecuta `npm run build`, publica `dist` y registra las funciones de `netlify/functions`.
3. En la configuración del proyecto, activa **Identity** y permite el registro de usuarios.
4. En **Identity → Registration → External providers**, añade y activa **Google**. La app consulta la configuración de Identity y muestra el botón cuando Google está disponible; no guardes credenciales de Google en este repositorio.
5. Publica el sitio con HTTPS. Netlify crea y conserva los almacenes Blobs compartidos entre despliegues; los datos se guardan en la región de Frankfurt (`eu-central-1`).

## Almacenamiento por cuenta

Las asignaturas se guardan como un registro de datos por ID de cuenta en el almacén `astra-study-data`. Los archivos usan el almacén `astra-study-files`; sus rutas incluyen el ID de cuenta, curso y material. El navegador no recibe acceso directo a esos almacenes: las funciones autentican cada solicitud y construyen las claves usando la identidad verificada por Netlify.

## Alcance actual

Las funciones de estudio tienen contenido de muestra. Para producir respuestas basadas en el contenido de los documentos hace falta conectar un modelo de IA. El idioma elegido se guarda por curso y se aplica al contenido de muestra, los mensajes de las actividades y las preguntas del PDF. La interfaz general de navegación está en castellano.
