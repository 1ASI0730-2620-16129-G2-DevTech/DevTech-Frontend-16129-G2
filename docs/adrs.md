# Architecture Decision Records (ADRs) — WashTrack

## Overview

Este documento registra las decisiones de arquitectura de WashTrack según lo definido en el informe del proyecto. Distingue las decisiones ya adoptadas de las tecnologías y componentes que el informe todavía presenta como propuestos; no implica que los servicios aún no desplegados estén implementados.

## Tabla de contenidos

- [ADR-001: Domain-Driven Design y bounded contexts](#adr-001-domain-driven-design-y-bounded-contexts)
- [ADR-002: Arquitectura por capas y Shared Kernel](#adr-002-arquitectura-por-capas-y-shared-kernel)
- [ADR-003: Vue.js para la aplicación web](#adr-003-vuejs-para-la-aplicación-web)
- [ADR-004: API REST con ASP.NET Core](#adr-004-api-rest-con-aspnet-core)
- [ADR-005: Persistencia relacional con PostgreSQL](#adr-005-persistencia-relacional-con-postgresql)
- [ADR-006: Worker dedicado para notificaciones](#adr-006-worker-dedicado-para-notificaciones)
- [ADR-007: Despliegue separado de landing page y aplicación](#adr-007-despliegue-separado-de-landing-page-y-aplicación)

---

## ADR-001: Domain-Driven Design y bounded contexts

### Estado
Adoptado

### Contexto
WashTrack cubre procesos distintos para clientes y proveedores de lavandería: identidad, pedidos, operación de lavandería, suscripciones y pagos, seguimiento y notificaciones. Mantener todas estas reglas en un único modelo dificultaría delimitar responsabilidades y evolucionar cada área.

### Decisión
Organizar el dominio aplicando Domain-Driven Design (DDD) y separar sus responsabilidades en seis bounded contexts:

- **Identity & Access:** identidad, autenticación y autorización.
- **Customer & Business Management:** clientes, lavanderías e información operativa.
- **Order Management:** solicitudes y órdenes de servicio.
- **Laundry Operations:** procesamiento y recursos de lavandería.
- **Subscription & Payment:** membresías, créditos, beneficios y pagos.
- **Tracking & Notifications:** seguimiento de estados y notificaciones.

Los contextos se relacionan mediante identificadores y mantienen sus propios modelos y reglas de negocio.

### Consecuencias
- **Positivas:** las reglas de cada área quedan delimitadas; el diseño puede evolucionar por contexto y reflejar el lenguaje del negocio.
- **Negativas:** se requiere definir con cuidado las responsabilidades y contratos entre contextos para evitar dependencias indebidas.

---

## ADR-002: Arquitectura por capas y Shared Kernel

### Estado
Adoptado en el diseño

### Contexto
La solución incluye interfaces web, servicios, reglas de negocio y adaptadores a persistencia y sistemas externos. Mezclar estas responsabilidades acoplaría el dominio a detalles de presentación o infraestructura.

### Decisión
Distribuir las responsabilidades en cuatro capas:

1. **Domain:** agregados, entidades, objetos de valor, enumeraciones e interfaces de repositorio.
2. **Application:** servicios de aplicación y puertos para coordinar los casos de uso.
3. **Infrastructure:** implementaciones de repositorios e integración con servicios externos.
4. **Presentation:** controladores y componentes de interfaz.

Compartir únicamente elementos transversales definidos en el **Shared Kernel**, como `AggregateRoot`, `Repository`, `DomainEvent` y `Money`, junto con la infraestructura común necesaria.

### Consecuencias
- **Positivas:** separa las reglas de negocio de sus mecanismos de entrada, persistencia e integración; facilita probar las capas con responsabilidades claras.
- **Negativas:** añade contratos y estructura que el equipo debe mantener coherentes a medida que crezca el sistema.

---

## ADR-003: Vue.js para la aplicación web

### Estado
Adoptado

### Contexto
WashTrack requiere interfaces para los actores Customer y Laundry Provider. El informe describe la implementación del frontend utilizando Vue.js.

### Decisión
Utilizar **Vue.js** para la aplicación web. Mantener la **Landing Page** como una unidad diferenciada, desarrollada con HTML, CSS y JavaScript.

### Consecuencias
- **Positivas:** la aplicación web cuenta con una tecnología definida para construir sus interfaces, separada de la página informativa.
- **Negativas:** deben mantenerse las herramientas y dependencias propias del frontend; la interacción con el dominio debe realizarse a través de los servicios previstos, no duplicando reglas de negocio en la interfaz.

---

## ADR-004: API REST con ASP.NET Core

### Estado
Propuesto

### Contexto
La aplicación web necesita acceder a casos de uso y datos del sistema mediante una interfaz independiente de la presentación. El informe define una API y sus servicios como parte de la arquitectura, pero describe su despliegue como trabajo futuro.

### Decisión
Desarrollar los **Web Services** como una **API RESTful** con **C# y ASP.NET Core**. Aplicar la separación por capas descrita en ADR-002 para organizar la exposición HTTP, los casos de uso, el dominio y las integraciones.

### Consecuencias
- **Positivas:** establece una interfaz de servicio clara para los clientes de WashTrack y permite mantener las reglas fuera de las interfaces web.
- **Negativas:** requiere desplegar y configurar los servicios, sus dependencias y su conexión con la base de datos; la API debe aplicar sus propias reglas de validación y autorización.

---

## ADR-005: Persistencia relacional con PostgreSQL

### Estado
Propuesto

### Contexto
WashTrack debe persistir información relacionada de usuarios, clientes, lavanderías, órdenes, prendas, operaciones, suscripciones, pagos, seguimiento y notificaciones. El informe propone una base relacional y un modelo normalizado.

### Decisión
Utilizar **PostgreSQL** como tecnología propuesta para la base de datos relacional. Modelar las entidades con claves primarias y foráneas, mantener la integridad referencial y normalizar el esquema hasta la **Tercera Forma Normal (3FN)**, según el diseño presentado.

### Consecuencias
- **Positivas:** las relaciones e integridad de los datos se expresan en el esquema; la normalización reduce duplicación y facilita el mantenimiento.
- **Negativas:** el backend debe administrar el esquema, las migraciones y las transacciones; los cambios al modelo requieren coordinación entre contextos que comparten datos persistidos.

---

## ADR-006: Worker dedicado para notificaciones

### Estado
Propuesto

### Contexto
Los cambios de estado de una orden pueden generar comunicaciones para los usuarios. El diseño de WashTrack contempla notificaciones y muestra un Notification Worker separado de la API, además de un servicio externo de correo.

### Decisión
Implementar un **Notification Worker** como **.NET Worker Service en C#** para procesar eventos y generar notificaciones. Considerar el **Email Service** y el **Payment Gateway** como sistemas externos; el informe no define un proveedor concreto ni el mecanismo de comunicación entre componentes.

### Consecuencias
- **Positivas:** separa el procesamiento de notificaciones del manejo de solicitudes HTTP y permite integrar servicios externos mediante adaptadores.
- **Negativas:** requiere definir y operar la comunicación, los reintentos y el manejo de fallos antes de la implementación; no se fija aquí una tecnología de mensajería ni un proveedor externo.

---

## ADR-007: Despliegue separado de landing page y aplicación

### Estado
Parcialmente implementado

### Contexto
La Landing Page, la aplicación web, la API y el Notification Worker son unidades con necesidades de ejecución distintas. El informe registra la publicación de la Landing Page en GitHub Pages y deja el despliegue de la aplicación y los servicios para una versión funcional posterior.

### Decisión
Publicar la **Landing Page** en **GitHub Pages** desde la rama `main`. Mantener separado el despliegue de la aplicación web y los servicios: su publicación requiere completar la versión funcional y configurar el entorno, las dependencias y la conexión a la base de datos.

### Consecuencias
- **Positivas:** la página informativa puede publicarse de forma independiente sin esperar a que estén listos los servicios de la aplicación.
- **Negativas:** cada unidad requiere configuración y validación de despliegue propias; este ADR no prescribe todavía un proveedor para alojar la aplicación, la API o el worker.
