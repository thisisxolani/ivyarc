const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Service configuration
const services = [
  {
    name: 'Eureka Server',
    url: 'http://localhost:8761',
    healthEndpoint: '/actuator/health',
    infoEndpoint: '/actuator/info',
    type: 'discovery',
    icon: '🔍'
  },
  {
    name: 'Config Server',
    url: 'http://localhost:8888',
    healthEndpoint: '/actuator/health',
    infoEndpoint: '/actuator/info',
    type: 'infrastructure',
    icon: '⚙️'
  },
  {
    name: 'Auth Service',
    url: 'http://localhost:8081',
    healthEndpoint: '/actuator/health',
    infoEndpoint: '/actuator/info',
    type: 'business',
    icon: '🔐'
  },
  {
    name: 'Authorization Service',
    url: 'http://localhost:8083',
    healthEndpoint: '/actuator/health',
    infoEndpoint: '/actuator/info',
    type: 'business',
    icon: '🛡️'
  },
  {
    name: 'API Gateway',
    url: 'http://localhost:8082',
    healthEndpoint: '/actuator/health',
    infoEndpoint: '/actuator/info',
    type: 'gateway',
    icon: '🚪'
  },
  {
    name: 'Angular Frontend',
    url: 'http://localhost:4200',
    healthEndpoint: '/',
    type: 'frontend',
    icon: '🌐',
    customHealthCheck: true
  },
  {
    name: 'Nginx Proxy',
    url: 'http://localhost:80',
    healthEndpoint: '/health',
    type: 'proxy',
    icon: '🔀',
    customHealthCheck: true
  }
];

// Health check cache to avoid overwhelming services
let healthCache = {};
let lastHealthCheck = 0;
const HEALTH_CACHE_DURATION = 30000; // 30 seconds

// Custom health check functions
const customHealthChecks = {
  'Angular Frontend': async (service) => {
    try {
      const response = await axios.get(service.url, { 
        timeout: 5000,
        headers: { 'User-Agent': 'Health-Monitor/1.0' }
      });
      return {
        status: response.status === 200 ? 'UP' : 'DOWN',
        details: {
          statusCode: response.status,
          responseTime: Date.now() - start
        }
      };
    } catch (error) {
      return {
        status: 'DOWN',
        details: { error: error.message }
      };
    }
  },
  
  'Nginx Proxy': async (service) => {
    try {
      const start = Date.now();
      const response = await axios.get('http://localhost:80/health', {
        timeout: 5000,
        headers: { 'User-Agent': 'Health-Monitor/1.0' }
      });
      return {
        status: 'UP',
        details: {
          statusCode: response.status,
          responseTime: Date.now() - start
        }
      };
    } catch (error) {
      return {
        status: 'DOWN',
        details: { error: error.message }
      };
    }
  }
};

// Check individual service health
async function checkServiceHealth(service) {
  try {
    if (service.customHealthCheck && customHealthChecks[service.name]) {
      return await customHealthChecks[service.name](service);
    }
    
    const start = Date.now();
    const response = await axios.get(service.url + service.healthEndpoint, {
      timeout: 10000,
      headers: { 'User-Agent': 'Health-Monitor/1.0' }
    });
    
    const responseTime = Date.now() - start;
    
    return {
      ...response.data,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'DOWN',
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: error.code === 'ECONNREFUSED' ? 0 : 10000
    };
  }
}

// Get service info
async function getServiceInfo(service) {
  try {
    if (!service.infoEndpoint) return {};
    
    const response = await axios.get(service.url + service.infoEndpoint, {
      timeout: 5000,
      headers: { 'User-Agent': 'Health-Monitor/1.0' }
    });
    
    return response.data;
  } catch (error) {
    return { error: error.message };
  }
}

// Aggregate health checks
async function aggregateHealth() {
  const now = Date.now();
  
  // Use cache if recent
  if (now - lastHealthCheck < HEALTH_CACHE_DURATION && Object.keys(healthCache).length > 0) {
    return healthCache;
  }
  
  const healthPromises = services.map(async (service) => {
    const health = await checkServiceHealth(service);
    const info = await getServiceInfo(service);
    
    return {
      name: service.name,
      type: service.type,
      icon: service.icon,
      url: service.url,
      health,
      info,
      timestamp: new Date().toISOString()
    };
  });
  
  const results = await Promise.allSettled(healthPromises);
  const healthData = {
    services: results.map(result => result.status === 'fulfilled' ? result.value : {
      name: 'Unknown',
      health: { status: 'DOWN', error: 'Health check failed' },
      timestamp: new Date().toISOString()
    }),
    overall: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      upCount: 0,
      downCount: 0,
      totalCount: services.length
    }
  };
  
  // Calculate overall status
  healthData.services.forEach(service => {
    if (service.health.status === 'UP') {
      healthData.overall.upCount++;
    } else {
      healthData.overall.downCount++;
    }
  });
  
  healthData.overall.status = healthData.overall.downCount === 0 ? 'UP' : 
                            healthData.overall.upCount === 0 ? 'DOWN' : 'DEGRADED';
  
  // Update cache
  healthCache = healthData;
  lastHealthCheck = now;
  
  return healthData;
}

// API endpoints
app.get('/health', async (req, res) => {
  try {
    const health = await aggregateHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health/simple', async (req, res) => {
  try {
    const health = await aggregateHealth();
    res.json({
      status: health.overall.status,
      services: health.services.map(s => ({
        name: s.name,
        status: s.health.status,
        responseTime: s.health.responseTime
      })),
      timestamp: health.overall.timestamp
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// Service discovery endpoint
app.get('/services', async (req, res) => {
  try {
    // Get registered services from Eureka
    const eurekaResponse = await axios.get('http://localhost:8761/eureka/apps', {
      headers: { 'Accept': 'application/json' },
      timeout: 5000
    });
    
    const registeredServices = eurekaResponse.data.applications?.application || [];
    
    res.json({
      discoveredServices: registeredServices.map(app => ({
        name: app.name,
        instanceCount: app.instance?.length || 0,
        instances: Array.isArray(app.instance) ? app.instance : [app.instance].filter(Boolean)
      })),
      configuredServices: services.map(s => ({
        name: s.name,
        type: s.type,
        url: s.url
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      configuredServices: services.map(s => ({
        name: s.name,
        type: s.type,
        url: s.url
      })),
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const health = await aggregateHealth();
    
    // Generate Prometheus-style metrics
    let metrics = [];
    metrics.push('# HELP service_health_status Service health status (1=UP, 0=DOWN)');
    metrics.push('# TYPE service_health_status gauge');
    
    health.services.forEach(service => {
      const status = service.health.status === 'UP' ? 1 : 0;
      metrics.push(`service_health_status{service="${service.name}",type="${service.type}"} ${status}`);
    });
    
    metrics.push('# HELP service_response_time_ms Service response time in milliseconds');
    metrics.push('# TYPE service_response_time_ms gauge');
    
    health.services.forEach(service => {
      const responseTime = service.health.responseTime || 0;
      metrics.push(`service_response_time_ms{service="${service.name}",type="${service.type}"} ${responseTime}`);
    });
    
    metrics.push('# HELP system_services_total Total number of monitored services');
    metrics.push('# TYPE system_services_total gauge');
    metrics.push(`system_services_total ${health.overall.totalCount}`);
    
    metrics.push('# HELP system_services_up Number of services that are UP');
    metrics.push('# TYPE system_services_up gauge');
    metrics.push(`system_services_up ${health.overall.upCount}`);
    
    metrics.push('# HELP system_services_down Number of services that are DOWN');
    metrics.push('# TYPE system_services_down gauge');
    metrics.push(`system_services_down ${health.overall.downCount}`);
    
    res.set('Content-Type', 'text/plain');
    res.send(metrics.join('\n') + '\n');
  } catch (error) {
    res.status(500).set('Content-Type', 'text/plain').send(`# Error generating metrics: ${error.message}\n`);
  }
});

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Health monitoring service running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`Health API: http://localhost:${PORT}/health`);
  console.log(`Metrics: http://localhost:${PORT}/metrics`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down health monitoring service...');
  process.exit(0);
});