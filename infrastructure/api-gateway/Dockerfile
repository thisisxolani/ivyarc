# Multi-stage build
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN apk add --no-cache wget && addgroup -S spring && adduser -S spring -G spring

ARG JAR_FILE=target/api-gateway-*.jar
COPY ${JAR_FILE} app.jar

USER spring:spring

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep '"status":"UP"' || exit 1

ENV JVM_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh","-c","java $JVM_OPTS -jar app.jar"]
