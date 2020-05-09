#!/bin/bash

set -euo pipefail

export $(cat $1 | xargs)

cd "${BASH_SOURCE%/*}/"

cd ../../server

node ./scripts/import-tests/index.js "${@:2}"
