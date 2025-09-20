## ARQUITECURA MODULAR PARA SUPER ADMINISTRADOR DE BOOKING SPORT

- #### MODULOS IDENTIFICADOS PARA EL SISTEMA
  - ``admin`` Para administrar a personas con acceso al sistema de super administrador
  - ``auth`` Se encarga de manejar la autenticación para ingresar al sistema
  - ```facilities``` Gestion de instalaciones deportivas existenten en el aplicativo de **BOOKING SPORT.**
                     Crear una nueva Instalacion deportiva, Activar, Inactivar, Gestionar Pagos por alquiles.
- #### CADA MODULO MANEJA EL MISMO  FLUJO Y ESTRUCTURA DE CODIGOS
  - ``component/`` Manejo de componentes JSX que le pertenecen al modulo.
  - ``hooks/`` Encargado de hacer gestion de archivos que manejan estados y funciones locales de cada elemento JSX.
  - ``pages/`` Principales paginas de cada modulo, dentro de los elementos JSX dentro de **pages** se envuelven los componentes y este es llamado en ``App.jsx``.
  - ``context/`` Algunos modulos como ``auth`` pueden manejar este para gestion de estado global.
  - ``store/`` Encargado de manejar estado global que se necesitan compartir entre componentes sin necesidad de pasar **props**, pueden usados dentro de ``hooks``.
  - ``styles/`` Estylos de cada elemento JSX
- #### RECURSOS COMPARTIDOS ENTRE MODULOS
  - ``shared/`` Este posee algunos elementos JSX reutilizables y compartidas entre modulos
  - ``utils/`` Funciones utilitarias para menejar tareas especificas