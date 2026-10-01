# Decisiones de producto y diseño

## Una oferta, tres necesidades

La publicación pide pantallas de alertas, inventario y estados de riesgo; cita TypeScript, React, Next.js, Tailwind, Git y consumo de APIs REST. No adjunta una especificación formal de prueba. Sentinel traduce esas necesidades en tres rutas navegables, con un recorrido completo desde una señal hasta el activo afectado y su seguimiento.

## Jerarquía para leer en segundos

1. Los contadores muestran el tamaño del trabajo pendiente y la cobertura disponible.
2. La postura de seguridad ofrece contexto general; «Primero, lo importante» presenta las cuatro alertas pendientes con mayor prioridad.
3. Las fichas amplían evidencias y recomendaciones cuando se necesitan, sin cargar la tabla con todo el detalle.

La gravedad y el estado responden a preguntas diferentes. Gravedad es impacto potencial; estado es avance de investigación. No se usa el color como única señal: cada nivel tiene un nombre y cada estado aparece escrito.

## Dirección visual

Inspiración en la claridad de herramientas de producto como Linear, con una identidad propia de seguridad: navegación verde oscura, contenido claro, acentos salvia y alertas terracota/ámbar. Sin logos ni composiciones copiadas.

La tipografía usa fuentes del sistema para evitar dependencias de red. El espacio entre bloques permite escanear indicadores; las tablas conservan la densidad necesaria para comparar activos. En pantallas pequeñas las tablas tienen desplazamiento horizontal dentro de su contenedor y el inventario ofrece también tarjetas.

## Estado y API

Un proveedor de React centraliza alertas y activos para que contadores, tablas y fichas compartan la misma información. Se esperan las respuestas HTTP antes de aplicar cambios: si PATCH falla, la alerta conserva su estado anterior y el formulario permite reintentar.

Los cambios persistidos se validan antes de combinarlos con la instantánea. La carga inicial cancela peticiones al desmontarse para evitar resultados de solicitudes obsoletas en el ciclo de montaje de React. Las peticiones tienen un tiempo máximo de 10 segundos.

Se eligió una API stateless y persistencia local para que el proyecto pueda probarse sin instalar una base de datos ni configurar secretos. Esta decisión exige reconocer su límite: el servidor no conserva cambios ni permite colaborar entre usuarios.

## Riesgo explicable

Se usa una media simple de puntuaciones de muestra, con umbrales visibles y comprobados. Es fácil de explicar en una entrevista y no pretende ser un modelo real de cuantificación de riesgo. Cerrar una alerta no rebaja automáticamente la exposición del activo: eso requeriría comprobar una remediación.

## Verificación

Las pruebas de dominio comprueban prioridad sin mutar la lista original, límites de riesgo, validación de entrada y exportación CSV. Playwright recorre los flujos con controles visibles, en escritorio y móvil. axe comprueba automáticamente estructura, nombres y contraste. Se inspeccionan capturas por separado de las pruebas funcionales.

## Evolución hacia un producto real

- Identidad, permisos por organización y analista, y auditoría de cambios.
- Backend persistente, control de concurrencia y validación completa de contratos externos.
- Filtros y paginación de servidor para inventarios grandes.
- Telemetría y riesgo calculados a partir de evidencia real, con trazabilidad de fuentes y fechas.
- Revisiones con usuarios de seguridad, lectores de pantalla y distintos navegadores.
