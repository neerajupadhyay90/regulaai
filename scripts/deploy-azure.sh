#!/bin/bash
# RegulaAI — Azure Deployment Script
# Usage: ./scripts/deploy-azure.sh

set -e

echo "🛡️  RegulaAI — Azure Deployment"
echo "================================"

# Config
RESOURCE_GROUP="regulaai-rg"
LOCATION="eastus"
APP_NAME="regulaai"
REGISTRY="ghcr.io"
GITHUB_USER="${GITHUB_USERNAME:-your-github-username}"

echo ""
echo "📋 Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Location:       $LOCATION"
echo "   App Name:       $APP_NAME"
echo ""

# 1. Create resource group
echo "1️⃣  Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none
echo "   ✅ Resource group ready"

# 2. Build and push Docker images
echo ""
echo "2️⃣  Building Docker images..."
docker build -t $REGISTRY/$GITHUB_USER/regulaai-backend:latest ./backend
docker build -t $REGISTRY/$GITHUB_USER/regulaai-frontend:latest ./frontend
echo "   ✅ Images built"

echo ""
echo "3️⃣  Pushing images to registry..."
docker push $REGISTRY/$GITHUB_USER/regulaai-backend:latest
docker push $REGISTRY/$GITHUB_USER/regulaai-frontend:latest
echo "   ✅ Images pushed"

# 4. Deploy to Azure Container Apps
echo ""
echo "4️⃣  Deploying to Azure Container Apps..."
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file azure-deploy.bicep \
  --parameters \
    appName=$APP_NAME \
    containerRegistryServer=$REGISTRY \
    backendImage="$GITHUB_USER/regulaai-backend:latest" \
    frontendImage="$GITHUB_USER/regulaai-frontend:latest" \
  --output table

echo ""
echo "5️⃣  Setting secrets..."
# Set these after deployment
echo "   Run these commands to set your secrets:"
echo "   az containerapp secret set -n $APP_NAME-backend -g $RESOURCE_GROUP --secrets foundry-api-key=YOUR_KEY"
echo "   az containerapp secret set -n $APP_NAME-backend -g $RESOURCE_GROUP --secrets cosmos-connection=YOUR_CONNECTION_STRING"
echo "   az containerapp secret set -n $APP_NAME-backend -g $RESOURCE_GROUP --secrets anthropic-api-key=YOUR_KEY"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📌 Get your app URLs:"
az containerapp show -n $APP_NAME-frontend -g $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv 2>/dev/null | xargs -I{} echo "   Frontend: https://{}"
az containerapp show -n $APP_NAME-backend -g $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv 2>/dev/null | xargs -I{} echo "   Backend:  https://{}"
