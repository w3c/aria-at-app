#!/bin/bash

sudo -u postgres yarn db-init:test
yarn sequelize:test db:migrate
yarn sequelize:test db:seed
