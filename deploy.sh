#!/bin/bash

# Variables
VM_IP="20.195.42.22"                          # Replace with your VM's IP address
IMAGE_NAME="andricomauludi/dotswms-backend:$(Build.BuildId)"
CONTAINER_NAME="dotswms-backend"

# Deploy Docker image to VM
ssh -o StrictHostKeyChecking=no user@$VM_IP << EOF
  docker pull $IMAGE_NAME
  docker stop $CONTAINER_NAME || true
  docker rm $CONTAINER_NAME || true
  docker run -d --name $CONTAINER_NAME -p 3001:3001 $IMAGE_NAME
EOF
