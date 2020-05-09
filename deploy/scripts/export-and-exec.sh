#!/bin/bash

set -euo pipefail

export $(cat $1 | xargs)

${@:2}
