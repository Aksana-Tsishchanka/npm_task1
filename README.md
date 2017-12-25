# npm_task1
npm start


#for user migration use the following commands
#to create table
npm-run sequelize db:migrate

#to remove table
npm-run sequelize db:migrate:undo

#to fill Users table
npm-run sequelize db:seed:all

#to run docker and postgrest
# Create docker image with tag aksana_postgres from Dockerfile at path ‘.’
$ docker build -t aksana_postgres .

# Run docker image with tag aksana_postgres and name running container image postgres-db
$ docker run -p 5432:5432 --name postgres-db aksana_postgres

# Stopping and removing running container
$ docker stop postgres-db
$ docker rm -v postgres-db

# Checking what is running with docker
$ docker ps
# Checking if something is listening port, for instance, 3000 or 5432
$ lsof -i :port

# to start container
docker start [OPTIONS] CONTAINER [CONTAINER...]