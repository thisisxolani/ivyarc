window.ui = SwaggerUIBundle({
  urls: [
    {url: 'http://host.docker.internal:8080/auth-service/v3/api-docs', name: 'Auth Service'},
    {url: 'http://host.docker.internal:8080/authorization-service/api-docs', name: 'Authorization Service'},
    {url: 'http://host.docker.internal:8080/user-management-service/v3/api-docs', name: 'User Management Service'},
    {url: 'http://host.docker.internal:8080/audit-service/v3/api-docs', name: 'Audit Service'}
  ],
  dom_id: '#swagger-ui',
  deepLinking: true,
  presets: [
    SwaggerUIBundle.presets.apis,
    SwaggerUIStandalonePreset
  ],
  plugins: [
    SwaggerUIBundle.plugins.DownloadUrl
  ],
  layout: "StandaloneLayout"
});

