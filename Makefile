MAKEFLAGS += --warn-undefined-variables
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := build

INSTANCE = default
# infinity-dev-01
DOCKER_REGISTRY = "009160068722.dkr.ecr.us-west-2.amazonaws.com"


# REPO ?= $(shell basename `git rev-parse --show-toplevel`)
REPO ?= "kauth-zitadel-ui"
VERSION ?= $(shell basename `git rev-parse HEAD`)
BRANCH ?= $(shell basename `git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/'`)
export REPO := ${REPO}
export VERSION := ${VERSION}
export NAME := ${REPO}
export BRANCH := ${BRANCH}

.PHONY: compose shell run start up stop


sleep:
	sleep 10

bash:
	docker-compose exec kauth_app_ui /bin/bash

.PHONY: build
build: npmbuild buildx
	echo "Built"

.PHONY: npmbuild
npmbuild:
	pnpm build

.PHONY: init-buildx
init-buildx:
	@echo "Creating Docker multi-builder-platform"
	docker buildx create --use --platform=linux/arm64,linux/amd64 --name multi-platform-builder

.PHONY: buildx
buildx: docker-login
	docker buildx inspect --bootstrap
	docker buildx build --no-cache --push -f Dockerfile.kelvin --platform linux/arm64,linux/amd64 -t ${DOCKER_REGISTRY}/$(REPO):$(VERSION) -t ${DOCKER_REGISTRY}/$(REPO):$(BRANCH) .

.PHONY: docker-login
docker-login:
	aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin ${DOCKER_REGISTRY}

.PHONY: compose
compose: docker-login
	mkdir -p docker-fs/postgres
	docker pull ${DOCKER_REGISTRY}/${REPO}:${BRANCH}
	docker-compose up --build --force-recreate -d

composedie:
	docker-compose rm -f app

rebuild: composedie compose

up:
	docker-compose up -d

stop:
	docker-compose stop

