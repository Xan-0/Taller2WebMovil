## Taller 3 – Aplicación Móvil con Capacitor

## Objetivo

Transformar la aplicación desarrollada durante el Taller 2 en una aplicación móvil para Android utilizando Capacitor, incorporando funcionalidades propias de dispositivos móviles y estableciendo un proceso de construcción y distribución de la aplicación.

## Descripción

Cada equipo deberá continuar el desarrollo de la aplicación realizada durante el Taller 2. La aplicación Angular existente deberá integrarse con Capacitor para generar una aplicación Android instalable.

Además, se deberán incorporar funcionalidades que aprovechen capacidades propias de los dispositivos móviles, como cámara, ubicación, sensores y notificaciones. Estas funcionalidades deberán integrarse con el propósito y flujo principal de la aplicación, evitando implementarlas únicamente como demostraciones aisladas.

El resultado final deberá corresponder a una aplicación funcional que pueda ser instalada y ejecutada en un dispositivo Android real.

## Requerimientos

## 1. Integración con Capacitor

La aplicación deberá integrar Capacitor para permitir su ejecución como aplicación móvil Android. Se deberá:

- Configurar Capacitor dentro del proyecto Angular.

- Incorporar y configurar la plataforma Android.

- Definir correctamente el identificador y nombre de la aplicación.

- Configurar los recursos básicos de la aplicación, como ícono y pantalla de inicio.

- Sincronizar correctamente el proyecto Angular con el proyecto Android.

- Ejecutar la aplicación en un dispositivo Android real.

## 2. Build de producción y APK

El equipo deberá generar una versión instalable de la aplicación para Android. Se deberá:

- Generar el build de producción de Angular.

- Sincronizar el build generado con Capacitor.


- Compilar correctamente el proyecto Android.

- Generar un archivo APK instalable.

- Instalar el APK en un dispositivo Android real.

- Verificar el funcionamiento de las funcionalidades principales de la aplicación desde el dispositivo.

## 3. Cámara y lectura de códigos

La aplicación deberá utilizar la cámara del dispositivo dentro de una funcionalidad relacionada con el propósito de la aplicación. Además, deberá permitir la lectura de al menos uno de los siguientes elementos:

- código QR;

- código de barras.

La información obtenida mediante la lectura deberá ser utilizada por alguna funcionalidad de la aplicación. Por ejemplo, podrá utilizarse para identificar usuarios, productos, eventos, ubicaciones, registros u otras entidades relacionadas con el sistema.

## 4. Ubicación

La aplicación deberá utilizar la ubicación del dispositivo mediante GPS o servicios de geolocalización. La ubicación obtenida deberá utilizarse dentro de una funcionalidad real de la aplicación. Por ejemplo:

- registrar dónde ocurrió un evento;

- realizar un check-in;

- validar una ubicación;

- asociar coordenadas a un registro;

- mostrar información relacionada con la ubicación actual.

## 5. Sensor del dispositivo

La aplicación deberá utilizar al menos un sensor adicional disponible en el dispositivo. Por ejemplo:

- acelerómetro;

- giroscopio;

- orientación;

- movimiento;

- otro sensor apropiado para la aplicación.

La información obtenida deberá participar en alguna funcionalidad de la aplicación.


## 6. Integración con el backend

Las nuevas funcionalidades móviles deberán integrarse con el backend cuando la naturaleza de la funcionalidad requiera persistencia o procesamiento de información. La información generada desde el dispositivo podrá incluir, por ejemplo:

- códigos escaneados;

- coordenadas;

- fecha y hora;

- registros de eventos;

- información generada mediante sensores.

La comunicación deberá realizarse utilizando la API desarrollada durante el Taller 2.

## 7. Permisos y manejo de errores

La aplicación deberá gestionar correctamente los permisos requeridos por las funcionalidades móviles implementadas. Se deberá considerar:

- solicitar permisos cuando corresponda;

- informar al usuario cuando un permiso sea necesario;

- manejar correctamente el rechazo de permisos;

- manejar situaciones donde una capacidad o sensor no esté disponible;

- entregar retroalimentación cuando ocurra un error.

## 8. Construcción automatizada de la aplicación Android

El repositorio deberá incorporar un flujo automatizado utilizando GitHub Actions para construir la aplicación Android. El workflow deberá ejecutarse automáticamente ante cambios realizados en la rama principal del proyecto. Como mínimo deberá:

- Obtener el código fuente del repositorio.

- Instalar las dependencias necesarias para la construcción de la aplicación.

- Generar el build de producción de Angular.

- Sincronizar el proyecto con Android mediante Capacitor.

- Compilar el proyecto Android.

- Generar automáticamente un APK en modo debug.

- Dejar el APK generado disponible como artefacto descargable desde GitHub Actions.

No se requerirá la generación de un APK firmado ni su publicación en Google Play Store. El workflow deberá permitir verificar que la aplicación puede ser construida correctamente a partir del código disponible en el repositorio.


## Entrega

Cada equipo deberá entregar:

- enlace al repositorio Git con la solución completa;

- archivo APK generado;

- README actualizado con las instrucciones necesarias para construir y ejecutar la aplicación.

## Demo Day

La evaluación final del Taller 3 se realizará mediante un Demo Day. Cada equipo deberá presentar su aplicación funcionando en un dispositivo Android real. Durante la demostración se deberá evidenciar:

- instalación y ejecución de la aplicación;

- funcionamiento de las principales funcionalidades de la aplicación;

- uso de cámara y lectura de QR o código de barras;

- utilización de la ubicación del dispositivo;

- utilización del sensor adicional seleccionado;

- ejecución del flujo que integra las capacidades móviles;

- comunicación con el backend;

- proceso de build de producción;

- funcionamiento del flujo de CI/CD implementado.

## Consideraciones

Las funcionalidades móviles deberán estar relacionadas con el propósito de la aplicación. No será suficiente incorporar cámara, ubicación o sensores pantallas independientes únicamente para demostrar su funcionamiento.

Durante el Demo Day se podrá solicitar a cualquier integrante del equipo que explique o demuestre una parte específica de la implementación.

El equipo deberá ser capaz de explicar el proceso utilizado para transformar la aplicación Angular en una aplicación Android, la integración con Capacitor, el uso de las capacidades del dispositivo y el proceso de construcción y distribución de la aplicación.


## Evaluación

La evaluación del Taller 3 se realizará mediante un Demo Day, en el cual cada equipo deberá presentar y demostrar el funcionamiento de su aplicación en un dispositivo Android.

## RA4

## Identificar las herramientas y tecnologías utilizadas en el desarrollo de aplicaciones móviles multiplataforma.

- Demostrar la ejecución de la aplicación Angular integrada con Capacitor en un dispositivo Android real. (5%)

- Instalar y ejecutar correctamente el APK generado en un dispositivo Android real. (5%)

- Demostrar la construcción automática del APK en modo debug mediante GitHub Actions y su disponibilidad como artefacto descargable. (10%)

Ponderación RA4: 20%

## RA5

## Construir aplicaciones móviles multiplataforma utilizando las tecnologías más importantes utilizadas por la industria.

- Implementar una funcionalidad que utilice la cámara del dispositivo para leer un código QR o código de barras y utilice la información obtenida dentro de la aplicación. (15%)

- Implementar una funcionalidad que obtenga y utilice la ubicación del dispositivo mediante GPS o servicios de geolocalización. (15%)

- Implementar una funcionalidad que utilice el acelerómetro u otro sensor disponible en el dispositivo. (15%)

- Integrar las capacidades móviles implementadas dentro de uno o más flujos funcionales relacionados con el propósito de la aplicación. (10%)

- Gestionar correctamente los permisos requeridos por las capacidades del dispositivo y responder adecuadamente ante permisos rechazados o errores. (5%)

## Ponderación RA5: 60%

## RA6

## Aplicar herramientas TIC para el almacenamiento, la comunicación, la transmisión e intercambio de información de manera efectiva.

- Integrar las funcionalidades móviles con el backend cuando estas requieran almacenar, consultar o procesar información. (10%)

- Demostrar el intercambio de información entre el dispositivo móvil y el backend durante la ejecución de una funcionalidad. (5%)


- Demostrar el funcionamiento completo de la aplicación desde el dispositivo móvil, manteniendo la comunicación con los servicios desarrollados durante el Taller 2. (5%)

Ponderación RA6: 20%


## Niveles de la escala de apreciación

Cada indicador será evaluado utilizando los siguientes niveles de desempeño:

- Excelente (1.0): cumple completamente con el indicador y demuestra su funcionamiento correcto durante el Demo Day.

- Bueno (0.6): cumple con el indicador, presentando errores menores que no impiden demostrar la funcionalidad.

- Regular (0.3): cumple parcialmente con el indicador o presenta errores que afectan la demostración de la funcionalidad.

- Insatisfactorio (0.0): no cumple con el indicador o no logra demostrar la funcionalidad solicitada durante el Demo Day.
