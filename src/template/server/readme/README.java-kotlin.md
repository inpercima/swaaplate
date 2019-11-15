# {{PROJECT.NAME}} - server

## Getting started

```bash
# all commands used in ./server
cd server
```

Create property files for `devMode` and `prodMode`.

```bash
cp src/main/resources/application.yml src/main/resources/application-dev.yml
cp src/main/resources/application.yml src/main/resources/application-prod.yml
```

**Note**: These files will not be under version control and listed in .gitignore.

## Usage

### Run in devMode

```bash
# short
./mvnw

# long
./mvnw spring-boot:run -Pdev
```

### Run in prodMode

```bash
# short
./mvnw -Pprod

# long
./mvnw spring-boot:run -Pprod
```

### Package and run in prodMode

```bash
# package
./mvnw clean package

# package without tests
./mvnw clean package -DskipTests

# run
java -jar /target/{{PROJECT.NAME}}.jar --spring.profiles.active=prod

# combine package and run
./mvnw clean package && java -jar /target/{{PROJECT.NAME}}.jar --spring.profiles.active=prod
```
