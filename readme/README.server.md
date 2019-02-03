# swaaplate - server

## Getting started

```bash
# all commands used in ./server
cd server
```

Create property files for `devMode` and `prodMode`.

```bash
cp src/main/resources/application-default.yml src/main/resources/application-dev.yml
cp src/main/resources/application-default.yml src/main/resources/application-prod.yml
```

Update these files for your environment.
Note: These files will not be under version control and listed in .gitignore.

## Usage

### Run in devMode with real data

```bash
spring-boot:run
```

### Run in prodMode with real data

```bash
./mvnw spring-boot:run -Pprod
```

### Package in prodMode with real data

```bash
./mvnw clean package -Pprod

# without tests
./mvnw clean package -Pprod -DskipTests
```
