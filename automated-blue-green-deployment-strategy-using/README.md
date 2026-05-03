# Automated Blue-Green Deployment with Jenkins, Kubernetes, and Docker

This project is a working starter for a blue-green deployment pipeline:

- Jenkins builds and pushes a Docker image.
- Kubernetes keeps two deployments: `blue` and `green`.
- Jenkins deploys the new image to the inactive color.
- A smoke test runs against the inactive color.
- If the test passes, the main Kubernetes Service switches traffic to the new color.
- Rollback is a fast Service selector switch back to the previous color.

## Project Layout

```text
.
├── Jenkinsfile
├── Dockerfile
├── app/
│   ├── package.json
│   └── server.js
├── k8s/
│   ├── namespace.yaml
│   ├── blue-deployment.yaml
│   ├── green-deployment.yaml
│   ├── service.yaml
│   ├── blue-preview-service.yaml
│   └── green-preview-service.yaml
└── scripts/
    ├── deploy-color.sh
    ├── switch-traffic.sh
    └── current-color.sh
```

## Prerequisites

- Docker
- Kubernetes cluster
- `kubectl` configured for the cluster
- Jenkins with Docker and Kubernetes access
- Docker registry account, for example Docker Hub

## Jenkins Credentials

Create these credentials in Jenkins:

| ID | Type | Purpose |
| --- | --- | --- |
| `docker-registry` | Username/password | Push image to Docker registry |
| `kubeconfig` | Secret file | Kubernetes cluster access |

Update these values in `Jenkinsfile`:

```groovy
REGISTRY = "docker.io"
IMAGE_REPO = "your-dockerhub-user/blue-green-demo"
```

## Local Build

```bash
docker build -t blue-green-demo:local .
docker run --rm -p 8080:8080 blue-green-demo:local
curl http://localhost:8080/health
```

## Kubernetes Bootstrap

Apply the namespace, both deployments, and services:

```bash
kubectl apply -f k8s/
kubectl -n blue-green-demo get all
```

The public Service starts by routing traffic to `blue`:

```bash
kubectl -n blue-green-demo get service blue-green-demo
kubectl -n blue-green-demo get endpoints blue-green-demo
```

## Manual Blue-Green Flow

Deploy a new image to green:

```bash
./scripts/deploy-color.sh green docker.io/your-dockerhub-user/blue-green-demo:123
```

Smoke test green:

```bash
kubectl -n blue-green-demo port-forward service/blue-green-demo-green 8081:80
curl http://localhost:8081/health
```

Switch live traffic to green:

```bash
./scripts/switch-traffic.sh green
```

Rollback to blue:

```bash
./scripts/switch-traffic.sh blue
```

## Jenkins Pipeline Flow

1. Checkout source.
2. Build Docker image.
3. Push image to registry.
4. Detect active Service color.
5. Deploy image to inactive color.
6. Wait for rollout.
7. Smoke test inactive color through its preview Service.
8. Switch live Service selector to inactive color.

## Notes

- `blue-green-demo` is the live Service.
- `blue-green-demo-blue` and `blue-green-demo-green` are preview Services for validation.
- The app exposes `/health` for pipeline smoke tests.
- The Service selector is the traffic switch:

```yaml
selector:
  app: blue-green-demo
  color: green
```

