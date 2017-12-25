FROM postgres:latest

ENV POSTGRES_USER=aksana_tolstoguzova

ADD docker-entrypoint-initdb.d docker-entrypoint-initdb.d/


