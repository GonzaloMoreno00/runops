# runops
Running analytics platform built with Spring Boot, Angular and PostgreSQL.

## Integración continua

El workflow [CI](.github/workflows/ci.yml) se ejecuta en los PR dirigidos a
`main`, al subir cambios a `main` y manualmente desde la pestaña Actions.
Tiene dos jobs independientes:

- **Backend tests and build:** Java 21 y Maven Wrapper; ejecuta todos los tests
  y genera el JAR con `verify`.
- **Frontend tests and build:** Node.js 26.0.0 (definido en
  `frontend/.nvmrc`) y npm 11.12.1; instala las versiones de `package-lock.json`
  con `npm ci`, ejecuta los tests sin modo watch y compila para producción.

Los tests que cargan Spring usan el perfil `test`, con H2 en memoria.
No necesitan Docker, credenciales ni PostgreSQL local. Esto comprueba las
consultas JPA, pero no sustituye una prueba específica contra PostgreSQL.
Mockito se configura como agente de la JVM de tests en Maven, por lo que no
necesitas añadir argumentos especiales al ejecutar los comandos.

Para repetir las comprobaciones localmente:

```bash
# Desde backend/
./mvnw --batch-mode --no-transfer-progress verify

# Desde frontend/ (con la versión de Node indicada en .nvmrc)
npm ci
npm test -- --watch=false
npm run build -- --configuration production
```

CI valida y compila; no despliega ni publica una release. Para impedir merges
con errores, configura los dos jobs como comprobaciones obligatorias de
`main` en las reglas del repositorio, después de su primera ejecución.
