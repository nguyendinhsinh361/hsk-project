pipeline {
    agent any

    stages {
        
        stage('Setup environment') {
            steps {
                script {
                    if (env.GIT_BRANCH == 'origin/production') {
                        target = 'production'
                    } else if (env.GIT_BRANCH == 'origin/develop') {
                        target = 'dev'
                    } else {
                        target = ''
                    }
                }
            }
        }

        stage('Build'){
            when {
                expression { target == 'production' }
            }
            steps {
                echo "building"
                sshagent(['0a39231d-d882-4824-ae7f-0d892c489685']) {
                   sh """ssh -o StrictHostKeyChecking=no ansible@188.166.208.109 << EOF
                        cd /home/ansible/resource/migii_hsk_api/api/
                        git pull origin production
                        docker build -t registry.gitlab.com/eup/migii-hsk-api:${GIT_COMMIT} .
                        docker push registry.gitlab.com/eup/migii-hsk-api:${GIT_COMMIT}
                        docker rmi registry.gitlab.com/eup/migii-hsk-api:${GIT_COMMIT}
                        exit
                    EOF"""
                }
            }
        }


        stage('Deploy'){
            when {
                expression { target == 'production' }
            }
            steps {
                echo "building"
                sshagent(['0a39231d-d882-4824-ae7f-0d892c489685']) {
                   
                    sh """ssh -o StrictHostKeyChecking=no ansible@159.223.50.230 << EOF
                        cd /home/ansible/resource/migii_hsk_api/api/
                        git checkout production
                        git pull origin production
                        docker pull registry.gitlab.com/eup/migii-hsk-api:${GIT_COMMIT}
                        exit
                    EOF"""

                    sh """ssh -o StrictHostKeyChecking=no ansible@206.189.41.199 << EOF
                        docker service update --image registry.gitlab.com/eup/migii-hsk-api:${GIT_COMMIT} migii_hsk_api_api
                        exit
                    EOF"""
                }
            }
        }
    }

}
