# ==========================================
# Stage 1: Build & Compile (Standard Maven)
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache Maven dependencies 
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile the production artifact without running integration tests
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Tiny, Secure Alpine Runtime
# ==========================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install Tesseract OCR binary and English language pack
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng

# Install security patches and add a non-root group/user for Alpine
RUN apk update && apk upgrade && \
    addgroup -S amangroup && adduser -S amansaxena -G amangroup

# Set ownership and switch to the unprivileged user
USER amansaxena

# Copy the compiled executable artifact from the builder stage
COPY --from=builder /app/target/*.jar dockhive.jar

# Expose Render's routing port
EXPOSE 8080

# Set production flags and inject the dynamic Spring Profile
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "-Dserver.port=${PORT}", "dockhive.jar"]