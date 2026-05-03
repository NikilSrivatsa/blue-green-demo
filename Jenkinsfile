pipeline {
    agent any

    environment {
        REGISTRY = "docker.io"
        IMAGE_REPO = "nikilsrivatsa/blue-green-demo"
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT.take(7)}"
        FULL_IMAGE = "${REGISTRY}/${IMAGE_REPO}:${IMAGE_TAG}"
        NAMESPACE = "blue-green-demo"
        APP_NAME = "blue-green-demo"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Image') {
            steps {
                sh 'docker build -t "$FULL_IMAGE" .'
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-registry', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login "$REGISTRY" -u "$DOCKER_USER" --password-stdin
                        docker push "$FULL_IMAGE"
                    '''
                }
            }
        }

        stage('Choose Target Color') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    script {
                        env.ACTIVE_COLOR = sh(
                            script: './scripts/current-color.sh',
                            returnStdout: true
                        ).trim()
                        env.TARGET_COLOR = env.ACTIVE_COLOR == 'blue' ? 'green' : 'blue'
                        echo "Active color: ${env.ACTIVE_COLOR}; target color: ${env.TARGET_COLOR}"
                    }
                }
            }
        }

        stage('Deploy Target Color') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh './scripts/deploy-color.sh "$TARGET_COLOR" "$FULL_IMAGE"'
                }
            }
        }

        stage('Smoke Test Target Color') {
    steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
            sh '''
                kubectl -n "$NAMESPACE" run smoke-test-"$BUILD_NUMBER" \
                    --restart=Never \
                    --image=curlimages/curl:8.10.1 \
                    --command -- curl -fsS "http://${APP_NAME}-${TARGET_COLOR}/health"

                kubectl -n "$NAMESPACE" wait --for=condition=Ready pod/smoke-test-"$BUILD_NUMBER" --timeout=30s || true
                kubectl -n "$NAMESPACE" logs smoke-test-"$BUILD_NUMBER"
                kubectl -n "$NAMESPACE" delete pod smoke-test-"$BUILD_NUMBER"
            '''
        }
    }
}

        stage('Switch Traffic') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh './scripts/switch-traffic.sh "$TARGET_COLOR"'
                }
            }
        }
    }

    post {
        success {
            echo "Traffic switched to ${env.TARGET_COLOR}: ${env.FULL_IMAGE}"
        }
        failure {
            echo "Deployment failed. Live traffic remains on ${env.ACTIVE_COLOR ?: 'the previous stable color'}."
        }
    }
}
