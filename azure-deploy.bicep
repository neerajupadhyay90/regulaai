// RegulaAI — Azure Container Apps deployment
// Deploy: az deployment group create --resource-group regulaai-rg --template-file azure-deploy.bicep

@description('Location for all resources')
param location string = resourceGroup().location

@description('App name prefix')
param appName string = 'regulaai'

@description('Container registry server')
param containerRegistryServer string = 'ghcr.io'

@description('Backend image')
param backendImage string = 'your-username/regulaai-backend:latest'

@description('Frontend image')
param frontendImage string = 'your-username/regulaai-frontend:latest'

// ─── Container Apps Environment ───────────────────────────────────────────────
resource environment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${appName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'azure-monitor'
    }
  }
}

// ─── Backend Container App ─────────────────────────────────────────────────────
resource backendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${appName}-backend'
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3001
        transport: 'http'
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      secrets: [
        { name: 'foundry-api-key', value: '' }   // Set via az containerapp secret set
        { name: 'cosmos-connection', value: '' }  // Set via az containerapp secret set
        { name: 'anthropic-api-key', value: '' }  // Set via az containerapp secret set
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: '${containerRegistryServer}/${backendImage}'
          resources: {
            cpu: '0.5'
            memory: '1Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'PORT', value: '3001' }
            { name: 'AZURE_FOUNDRY_API_KEY', secretRef: 'foundry-api-key' }
            { name: 'COSMOS_CONNECTION_STRING', secretRef: 'cosmos-connection' }
            { name: 'ANTHROPIC_API_KEY', secretRef: 'anthropic-api-key' }
            { name: 'FABRIC_WORKSPACE_ID', value: '' }
            { name: 'FABRIC_LAKEHOUSE_ID', value: '' }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
        rules: [
          {
            name: 'http-scaling'
            http: { metadata: { concurrentRequests: '20' } }
          }
        ]
      }
    }
  }
}

// ─── Frontend Container App ────────────────────────────────────────────────────
resource frontendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${appName}-frontend'
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'http'
      }
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: '${containerRegistryServer}/${frontendImage}'
          resources: {
            cpu: '0.25'
            memory: '0.5Gi'
          }
          env: [
            { name: 'VITE_API_URL', value: 'https://${backendApp.properties.configuration.ingress.fqdn}' }
          ]
        }
      ]
      scale: { minReplicas: 1, maxReplicas: 3 }
    }
  }
}

// ─── Outputs ──────────────────────────────────────────────────────────────────
output frontendUrl string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'
output backendUrl string = 'https://${backendApp.properties.configuration.ingress.fqdn}'
