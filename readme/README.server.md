# swaaplate - server

## Getting started

```bash
# all commands used in ./server
cd server
```

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
