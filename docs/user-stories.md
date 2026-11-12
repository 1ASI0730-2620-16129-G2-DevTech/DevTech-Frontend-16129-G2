# User Stories — WashTrack

## Overview

Este documento reúne las historias de usuario del informe del proyecto WashTrack. Se conservan los identificadores US, las épicas relacionadas y los criterios de aceptación descritos en el reporte.

## Épicas

| ID | Épica |
|---|---|
| EP-001 | Seguimiento y comunicación |
| EP-002 | Logística y entregas |
| EP-003 | Gestión de pedidos y trazabilidad |
| EP-004 | Gestión de clientes, incidencias y satisfacción |
| EP-005 | Servicios, pagos y suscripciones |
| EP-006 | Administración, reportes y monitoreo |

## US-001: Recibir notificaciones del estado del pedido

**Historia:** Como cliente, quiero recibir y gestionar notificaciones sobre los cambios de estado de mi pedido, para conocer el avance de mis prendas sin tener que comunicarme con la lavandería.  
**Épica:** EP-001 — Seguimiento y comunicación

### Criterios de aceptación

- **Notificación automática por cambio de estado:** Dado que el cliente tiene las notificaciones activadas en la aplicación, cuando el pedido cambie de etapa o estado (recepción, clasificación, lavado, secado/planchado, empaquetado o listo), el sistema envía una notificación que identifica el pedido, la nueva etapa y la fecha y hora del cambio. El cliente puede visualizarla y consultar el nuevo estado en el historial.
- **Configuración de notificaciones:** Dado que el cliente está en la configuración de su perfil, cuando activa o desactiva las notificaciones, el sistema guarda su preferencia y envía notificaciones de acuerdo con ella.

## US-002: Consultar la fecha estimada de finalización

**Historia:** Como cliente, quiero consultar la fecha y hora estimadas de finalización de mi pedido y recibir información cuando esta cambie, para organizar mi tiempo y saber cuándo estarán disponibles mis prendas.  
**Épica:** EP-001 — Seguimiento y comunicación

### Criterios de aceptación

- **Visualización:** Dado que el cliente tiene un pedido en proceso, cuando ingresa a sus detalles, el sistema muestra la fecha y hora estimadas de finalización.
- **Actualización por retraso:** Dado que un pedido presenta un retraso, cuando la lavandería actualiza la fecha u hora estimada, el sistema muestra la nueva estimación y el motivo del cambio, y notifica al cliente.
- **Pedido disponible:** Dado que el pedido ha finalizado y las prendas están disponibles para entrega o recojo, el sistema notifica al cliente que su pedido está listo.

## US-003: Solicitar recojo de prendas a domicilio

**Historia:** Como cliente, quiero solicitar el recojo de mis prendas desde mi domicilio, para enviar mi ropa a la lavandería sin trasladarme al establecimiento.  
**Épica:** EP-002 — Logística y entregas

### Criterio de aceptación

- **Solicitud exitosa:** Dado que el cliente desea enviar prendas a la lavandería, cuando registra o selecciona una dirección y elige una fecha y rango horario, el sistema muestra el costo del servicio. Al confirmar, el cliente recibe la confirmación y el estado del recojo.

## US-004: Solicitar entrega de prendas a domicilio

**Historia:** Como cliente, quiero solicitar la entrega de mis prendas a domicilio cuando estén listas, para recibirlas sin tener que ir a la lavandería.  
**Épica:** EP-002 — Logística y entregas

### Criterio de aceptación

- **Programación de entrega:** Dado que el pedido está «Listo», cuando el cliente selecciona entrega a domicilio, dirección y rango horario, el sistema muestra el costo total antes de confirmar. Tras confirmar, envía notificaciones de asignación, salida y entrega; la entrega se marca completada solo después de la confirmación final.

## US-005: Registrar clientes

**Historia:** Como encargado de lavandería, quiero registrar los datos de mis clientes para mantener organizada su información.  
**Épica:** EP-004 — Gestión de clientes, incidencias y satisfacción

### Criterio de aceptación

- **Registro de cliente:** Dado que el encargado está en el módulo de clientes, cuando ingresa el nombre, teléfono y correo electrónico cumpliendo las validaciones, el sistema guarda el perfil y permite consultarlo y editarlo posteriormente.

## US-006: Crear pedidos

**Historia:** Como encargado de lavandería, quiero crear un pedido asociado a un cliente para controlar el servicio solicitado.  
**Épica:** EP-003 — Gestión de pedidos y trazabilidad

### Criterio de aceptación

- **Creación exitosa:** Dado que el encargado tiene un cliente registrado y sus prendas, cuando ingresa los servicios, las prendas, el precio y la fecha estimada, el sistema genera un código único asociado al cliente y muestra una confirmación.

## US-007: Registrar prendas

**Historia:** Como encargado, quiero registrar las prendas incluidas en un pedido para evitar pérdidas o confusiones.  
**Épica:** EP-003 — Gestión de pedidos y trazabilidad

### Criterio de aceptación

- **Detalle de prendas:** Dado que el encargado crea o edita un pedido, cuando registra el tipo, cantidad, características y observaciones de cada prenda, cada prenda queda asociada a ese pedido y el encargado puede consultar su detalle individual.

## US-008: Actualizar estado del pedido

**Historia:** Como trabajador de lavandería, quiero actualizar el estado de un pedido para que el cliente conozca su progreso.  
**Épica:** EP-001 — Seguimiento y comunicación

### Criterio de aceptación

- **Actualización manual:** Dado que el trabajador ha procesado un pedido, cuando selecciona un nuevo estado (por ejemplo, lavado, secado o listo), el sistema guarda la fecha, hora y usuario que realizó el cambio, y envía una notificación al cliente.

## US-009: Consultar historial de pedidos

**Historia:** Como cliente, quiero consultar mis pedidos anteriores para revisar los servicios realizados y sus detalles.  
**Épica:** EP-004 — Gestión de clientes, incidencias y satisfacción

### Criterio de aceptación

- **Consulta del historial:** Dado que el cliente completó pedidos, cuando accede al historial, el sistema muestra los pedidos ordenados por fecha y permite buscar y visualizar prendas, servicios, precio y estado.

## US-010: Buscar y filtrar pedidos

**Historia:** Como encargado, quiero buscar y filtrar pedidos para encontrar rápidamente una orden.  
**Épica:** EP-003 — Gestión de pedidos y trazabilidad

### Criterio de aceptación

- **Búsqueda de pedidos:** Dado que el encargado necesita localizar una orden, cuando ingresa un código, cliente o teléfono, o aplica filtros de estado o fecha, el sistema muestra los resultados correspondientes.

## US-011: Registrar pagos

**Historia:** Como encargado, quiero registrar el pago de un pedido para mantener actualizado el estado financiero de la orden.  
**Épica:** EP-005 — Servicios, pagos y suscripciones

### Criterio de aceptación

- **Pago en el local:** Dado que el cliente realiza un abono en el local, cuando el encargado registra el monto, método y fecha, el pago queda asociado al pedido y este cambia a estado «Pendiente», «Parcial» o «Pagado».

## US-012: Realizar pagos digitales

**Historia:** Como cliente, quiero pagar mi pedido desde la plataforma para completar el servicio de forma rápida y segura.  
**Épica:** EP-005 — Servicios, pagos y suscripciones

### Criterio de aceptación

- **Procesamiento digital:** Dado que el cliente revisa un pedido con saldo pendiente, cuando selecciona un medio de pago y la pasarela confirma la operación, el estado del pago se actualiza automáticamente en el sistema.

## US-013: Gestionar incidencias

**Historia:** Como encargado, quiero registrar incidencias relacionadas con prendas o pedidos para comunicar una solución al cliente.  
**Épica:** EP-004 — Gestión de clientes, incidencias y satisfacción

### Criterio de aceptación

- **Registro de incidencia:** Dado que ocurre un problema con un pedido, cuando el encargado registra el tipo, descripción y evidencia, el cliente recibe una notificación y la incidencia puede marcarse como abierta, en revisión o resuelta.

## US-014: Visualizar dashboard operativo

**Historia:** Como propietario de lavandería, quiero consultar indicadores del negocio para conocer el estado de mis operaciones.  
**Épica:** EP-006 — Administración, reportes y monitoreo

### Criterio de aceptación

- **Visualización de métricas:** Dado que el propietario accede al dashboard, cuando el panel carga los datos del periodo seleccionado, se muestran los pedidos por estado, ingresos y nuevos clientes.

## US-015: Administrar servicios y precios

**Historia:** Como propietario, quiero configurar los servicios y precios de mi lavandería para mantener actualizada la oferta.  
**Épica:** EP-005 — Servicios, pagos y suscripciones

### Criterio de aceptación

- **Modificación del catálogo:** Dado que el propietario está en la configuración, cuando crea, edita o desactiva servicios indicando su precio y tiempo, los cambios se guardan y se reflejan solo en los nuevos pedidos.

## US-016: Gestionar usuarios y roles

**Historia:** Como propietario, quiero administrar los accesos del personal para controlar qué acciones puede realizar cada usuario.  
**Épica:** EP-006 — Administración, reportes y monitoreo

### Criterio de aceptación

- **Asignación de roles:** Dado que el propietario necesita dar acceso a un trabajador, cuando crea el usuario y le asigna un rol, el sistema restringe las funciones según los permisos asignados.

## US-017: Confirmar entrega del pedido

**Historia:** Como encargado, quiero registrar la entrega de un pedido para cerrar correctamente el proceso.  
**Épica:** EP-002 — Logística y entregas

### Criterio de aceptación

- **Cierre por entrega:** Dado que el pedido llegó al cliente, cuando se solicita y obtiene la confirmación de recepción, el sistema registra la fecha, hora y responsable, y cambia el pedido a estado «Entregado» en el historial.

## US-018: Calificar el servicio

**Historia:** Como cliente, quiero calificar el servicio recibido para expresar mi nivel de satisfacción y ayudar a la lavandería a mejorar.  
**Épica:** EP-004 — Gestión de clientes, incidencias y satisfacción

### Criterio de aceptación

- **Envío de calificación:** Dado que un pedido fue entregado, cuando el cliente lo califica de 1 a 5 y añade un comentario opcional, la evaluación queda asociada al pedido para los reportes.

## US-019: Gestionar suscripción

**Historia:** Como propietario, quiero seleccionar un plan de suscripción para utilizar las funcionalidades disponibles según las necesidades de mi lavandería.  
**Épica:** EP-005 — Servicios, pagos y suscripciones

### Criterio de aceptación

- **Cambio de plan:** Dado que el propietario ingresa al módulo de suscripciones, cuando visualiza los planes y selecciona uno nuevo, el sistema actualiza el estado y habilita o restringe funcionalidades.

## US-020: Exportar reportes

**Historia:** Como propietario, quiero exportar reportes de pedidos y pagos para analizarlos o conservarlos como respaldo.  
**Épica:** EP-006 — Administración, reportes y monitoreo

### Criterio de aceptación

- **Exportación:** Dado que el propietario requiere respaldar información, cuando filtra por periodo y selecciona exportar, el sistema genera un PDF o Excel con los detalles y totales.

## US-021: Priorizar pedidos por fecha de entrega

**Historia:** Como propietario de lavandería, quiero ordenar los pedidos según su fecha prevista de entrega para atender primero los pedidos más próximos a vencer.  
**Épica:** EP-003 — Gestión de pedidos y trazabilidad

### Criterio de aceptación

- **Ordenamiento y alertas:** Dado que existen varios pedidos en proceso, cuando el propietario visualiza la lista, el sistema los ordena por fecha prevista, resalta los atrasados y muestra observaciones clave.

## US-022: Visualizar pedidos pendientes y próximos a entregar

**Historia:** Como trabajador de lavandería, quiero visualizar los pedidos pendientes y próximos a entregar en una sola pantalla para organizar el trabajo durante los periodos de alta demanda.  
**Épica:** EP-001 — Seguimiento y comunicación

### Criterio de aceptación

- **Panel centralizado:** Dado que el trabajador ingresa al panel de control, cuando visualiza los pedidos en curso, puede filtrarlos por estado y fecha, y el sistema diferencia los atrasados de los que están en plazo.

## US-023: Registrar instrucciones especiales del pedido

**Historia:** Como encargado de lavandería, quiero registrar instrucciones especiales y compromisos de recojo o entrega para asegurar que el pedido sea atendido según lo acordado con el cliente.  
**Épica:** EP-003 — Gestión de pedidos y trazabilidad

### Criterio de aceptación

- **Registro de observaciones:** Dado que un pedido tiene requerimientos específicos, cuando el encargado los registra, se muestran visiblemente durante la gestión y entrega, y se conservan en el historial.

## US-024: Registrar comunicaciones con el cliente

**Historia:** Como encargado de lavandería, quiero registrar las comunicaciones realizadas mediante WhatsApp o llamadas telefónicas para mantener un historial de avisos, consultas e inconvenientes del pedido.  
**Épica:** EP-004 — Gestión de clientes, incidencias y satisfacción

### Criterio de aceptación

- **Historial de interacciones:** Dado que el encargado contacta al cliente, cuando registra el canal, motivo y resumen, el sistema guarda la fecha y hora exactas y enlaza la comunicación al cliente y al pedido.

## US-025: Coordinar entregas a domicilio

**Historia:** Como propietario de lavandería, quiero consultar las direcciones y horarios acordados para organizar las entregas a domicilio de manera ordenada.  
**Épica:** EP-002 — Logística y entregas

### Criterio de aceptación

- **Gestión de logística:** Dado que existen entregas a domicilio programadas, cuando el propietario consulta el panel, puede ver direcciones y horarios, y marcar la entrega como programada, realizada o no realizada.

## US-026: Identificar las prendas mediante un código

**Historia:** Como trabajador de lavandería, quiero identificar cada pedido mediante un código o etiqueta para evitar la pérdida, confusión o asignación incorrecta de prendas.  
**Épica:** EP-003 — Gestión de pedidos y trazabilidad

### Criterio de aceptación

- **Trazabilidad por código:** Dado que se creó un pedido, cuando el trabajador consulta el detalle o prepara las prendas, visualiza el código único para procesarlas correctamente.

## US-027: Validar las prendas antes de entregar el pedido

**Historia:** Como trabajador de lavandería, quiero revisar el detalle de las prendas antes de entregar un pedido para confirmar que corresponde al cliente correcto.  
**Épica:** EP-003 — Gestión de pedidos y trazabilidad

### Criterio de aceptación

- **Validación y discrepancias:** Dado que el trabajador está por entregar un pedido, cuando verifica las prendas y cantidades en el sistema, puede confirmar la entrega exitosa o registrar una incidencia antes de cerrarla si existe una diferencia.

## US-028: Panel de Control en Vivo

**Historia:** Como dueño de lavandería, quiero ver un panel central con métricas en tiempo real (pedidos hoy, entregados y alertas IoT) para tener control total de mi operación sin pausas.  
**Épica:** EP-006 — Administración, reportes y monitoreo

### Criterios de aceptación

- **Visualización en vivo:** Dado que el dueño accede al panel principal, cuando consulta la operación del día, el sistema muestra contadores actualizados de pedidos y entregas, y presenta una comparación porcentual con el periodo anterior.
- **Alerta de uso de equipos:** Dado que una lavadora se acerca a su límite de uso, cuando el sensor IoT reporta el umbral configurado, el panel muestra una alerta visual con el nombre del equipo y actualiza la información sin recargar la página.

## US-029: Consultar el seguimiento del pedido en seis etapas

**Historia:** Como cliente final, quiero ver el estado exacto de mi ropa en seis etapas claras para conocer el avance sin llamar a la lavandería.  
**Épica:** EP-001 — Seguimiento y comunicación

### Criterios de aceptación

- **Seguimiento por pedido:** Dado que el cliente cuenta con un número de pedido, cuando ingresa el código en el módulo de seguimiento, el sistema muestra Recepción, Clasificación, Lavado, Secado/Planchado, Empaquetado y Listo, indicando si cada etapa está completada o pendiente.
- **Seguimiento desde celular:** Dado que el cliente consulta desde un dispositivo móvil, cuando la lavandería actualiza una etapa, el estado se refleja automáticamente sin recargar la página y permanece visible y legible.

## US-030: Recibir alertas IoT predictivas

**Historia:** Como dueño de lavandería, quiero recibir alertas sobre el uso de mis equipos para anticipar fallas y planificar su reemplazo.  
**Épica:** EP-006 — Administración, reportes y monitoreo

### Criterios de aceptación

- **Equipo cercano al límite:** Dado que un sensor IoT monitorea una lavadora en operación, cuando el uso alcanza el umbral cercano al límite configurado, el panel genera una alerta visible con el nombre del equipo.
- **Fin de vida útil:** Dado que el uso acumulado de una lavadora alcanza su límite, cuando el sensor reporta el fin de su vida útil, el sistema genera una alerta de reemplazo y permite al propietario consultar el uso y estado del equipo.

## US-031: Enviar formulario de captura de leads

**Historia:** Como nuevo usuario, quiero completar un formulario con mis datos y necesidades para recibir información sobre planes y servicios adecuados para mi negocio.  
**Épica:** EP-005 — Servicios, pagos y suscripciones

### Criterios de aceptación

- **Envío válido:** Dado que el usuario accede a Contacto o Planes, cuando completa Nombres, Correo, Tipo de Usuario, Servicio y Mensaje, seleccionando Cliente o Dueño de lavandería, el sistema confirma el envío.
- **Campos obligatorios:** Dado que falta uno o más campos, cuando el usuario intenta enviar el formulario, el sistema muestra «Complete todos los campos» y no envía la solicitud.

## US-032: Gestionar integralmente los pedidos

**Historia:** Como dueño de lavandería, quiero digitalizar la recepción de pedidos, prendas y notas de cuidado para evitar errores y pérdida de prendas.  
**Épica:** EP-003 — Gestión de pedidos y trazabilidad

### Criterios de aceptación

- **Registro integral:** Dado que el dueño recibe una solicitud de servicio, cuando registra las prendas, cantidades y notas de cuidado especial, el sistema asocia la información al pedido y permite organizarlo en Recepción, Clasificación, Lavado, Secado/Planchado, Empaquetado y Listo.
- **Consulta centralizada:** Dado que el pedido tiene información registrada, cuando el dueño consulta su detalle, visualiza el historial y las observaciones sin depender de cuadernos o papeles sueltos.

## US-033: Coordinar logística y pagos digitales

**Historia:** Como cliente final, quiero coordinar el recojo o envío de mi pedido y realizar pagos digitales para gestionar el servicio sin complicaciones.  
**Épica:** EP-002 — Logística y entregas

### Criterio de aceptación

- **Solicitud con modalidad y pago:** Dado que el cliente crea una solicitud, cuando selecciona recojo o envío a domicilio, registra los datos logísticos y realiza el pago digital, el sistema confirma el resultado del pago y lo asocia al pedido. El dueño puede gestionar el estado logístico desde el panel central.

## US-034: Consultar el avance del pedido en tiempo real

**Historia:** Como cliente, quiero consultar el avance de mi pedido durante el proceso de lavado para saber qué se ha realizado y qué falta completar.  
**Épica:** EP-001 — Seguimiento y comunicación

### Criterio de aceptación

- **Consulta del avance:** Dado que el cliente tiene un pedido en proceso, cuando ingresa a la plataforma, visualiza la etapa completada, la etapa en curso y las etapas pendientes. El estado se actualiza automáticamente sin necesidad de llamar a la lavandería.

## US-035: Garantizar la trazabilidad de las prendas

**Historia:** Como cliente, quiero que mis prendas estén identificadas y registradas correctamente para tener seguridad y confianza durante todo el servicio.  
**Épica:** EP-003 — Gestión de pedidos y trazabilidad

### Criterios de aceptación

- **Trazabilidad:** Dado que se recibe un pedido, cuando el personal registra las prendas, cantidades y características, el sistema asigna un código único, conserva la información durante el proceso y permite verificarla antes de cada etapa y de la entrega.
- **Diferencia en las prendas:** Dado que existe una diferencia durante la verificación, cuando el personal la registra, el sistema crea una incidencia visible en el historial del pedido.

## US-036: Solicitar recojo para prendas voluminosas

**Historia:** Como cliente, quiero solicitar el recojo de prendas voluminosas o pesadas para evitar traslados incómodos hacia la lavandería.  
**Épica:** EP-002 — Logística y entregas

### Criterio de aceptación

- **Recojo de prendas voluminosas:** Dado que el cliente necesita trasladar prendas voluminosas o pesadas, cuando selecciona el recojo a domicilio e indica el tipo o volumen, el sistema muestra disponibilidad, costo y rango horario, confirma la solicitud y permite consultar su estado.

## US-037: Consultar precios antes de confirmar el servicio

**Historia:** Como cliente, quiero conocer el precio del servicio según mis prendas y modalidad para comparar alternativas y tomar una decisión informada.  
**Épica:** EP-005 — Servicios, pagos y suscripciones

### Criterios de aceptación

- **Consulta de precio:** Dado que el cliente selecciona prendas, servicio y modalidad, cuando revisa el resumen de la solicitud, el sistema muestra el precio estimado y separa el costo logístico cuando corresponde. Permite revisar el total antes de confirmar o pagar.
- **Cambio del precio final:** Dado que el precio cambia después de recibir las prendas, cuando la lavandería registra el nuevo monto, el sistema solicita la confirmación del cliente y conserva el motivo del cambio.

## US-038: Registrar prendas y servicio solicitado

**Historia:** Como encargado de lavandería, quiero registrar las prendas y el servicio solicitado al recibirlas para conservar un detalle completo de la orden.  
**Épica:** EP-003 — Gestión de pedidos y trazabilidad

### Criterio de aceptación

- **Registro de prendas y servicio:** Dado que el encargado recibe las prendas, cuando registra tipo, cantidad, servicio solicitado y observaciones de cuidado, el sistema guarda el detalle asociado al pedido y permite que el cliente y el encargado lo consulten antes de iniciar el procesamiento.

## US-039: Mantener una comunicación clara con el cliente

**Historia:** Como cliente, quiero recibir comunicaciones claras y oportunas sobre mi pedido para confiar en el servicio y reducir consultas repetitivas.  
**Épica:** EP-001 — Seguimiento y comunicación

### Criterios de aceptación

- **Comunicación automática:** Dado que ocurre la recepción, un cambio relevante, un retraso o la disponibilidad del pedido, cuando el sistema registra el evento, comunica al cliente un mensaje breve y claro identificado con su pedido, y conserva la comunicación en el historial.
- **Comunicación manual:** Dado que el encargado necesita informar una situación al cliente, cuando registra la comunicación desde el pedido, el sistema la asocia al historial correspondiente.
