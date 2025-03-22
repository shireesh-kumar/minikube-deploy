# Voting-Based Application with Kubernetes

## Overview

A Kubernetes-based voting application is designed to demonstrate core Kubernetes concepts by deploying it on Minikube, which provides a local, single-node Kubernetes cluster for development and testing

## Components

- **ExpressJS Frontend**: User interface for submitting votes.
- **NodeJS API**: Backend API to handle vote submissions and store temporary votes.
- **Redis Database**: Temporarily stores votes in a list structure.
- **Python Worker App**: Processes votes from Redis and updates the PostgreSQL database.
- **PostgreSQL Database**: Persistent storage for vote counts.

## Workflow

1. Users submit votes via the **ExpressJS frontend**.
2. The **NodeJS API** stores votes in **Redis**.
3. The **Python worker** continuously retrieves votes from Redis and updates the **PostgreSQL** database.
4. The `/result` endpoint (NodeJS API) fetches aggregated results from PostgreSQL and displays them.

## Kubernetes Setup

### Tools & Versions
- **Minikube**: `v1.35.0`
- **kubectl**: `v1.32.0`
- Tested on a **Windows** single-node cluster via Minikube.

### Demonstrated Kubernetes Concepts
- Pods
- ReplicaSets
- Deployments
- Services

## Deployment

### Start the Application
Run these commands sequentially:
```bash
kubectl create -f redis-db-deploy.yaml 
kubectl create -f redis-service.yaml      
kubectl create -f postgres-db-deploy.yaml
kubectl create -f postgres-service.yaml  
kubectl create -f worker-app-deploy.yaml  
kubectl create -f front-end-deploy.yaml 
kubectl create -f front-end-service.yaml
```

### Warning

This application uses the **replica concept** in Kubernetes. As a result, you cannot stop or delete pods using the usual `kubectl delete pod <pod_name>` command. Instead, you must delete the entire deployment using the following command:

```bash
kubectl delete deployment voting-app-deploy worker-app-deploy redis-deploy postgres-deploy
```
Here voting-app-deploy worker-app-deploy etc are the names of the deployment service of individual component of the application,, defined inside their respective yaml files.

To delete the services, which help with the communication within the cluster and that provide a stable network endpoint for accessing a set of Pods

```bash
kubectl delete service node pg-container redis 
```
Here node, pg-container, redis are the names of the services defined inside the respective yaml files


<h6>Acknowledgement: This project briefly refers to the works of kodekloud youtube channel<h6>
