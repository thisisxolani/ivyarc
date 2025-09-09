# Native builds (GraalVM)

All services include `org.graalvm.buildtools:native-maven-plugin`. To build native images:

- With Buildpacks (recommended):

```
./mvnw -Pnative spring-boot:build-image
```

- Or using `native-image` directly (requires GraalVM JDK installed):

```
mvn -Pnative -DskipTests package
```

Run the produced binary with container memory limits for best performance. Ensure any required reflection/config is handled; Spring AOT auto-config covers most cases.

