#!/bin/bash

# Export the environment variables defined within a specified file and execute
# some command using the modified environment.
#
# The first argument to this script will be interpreted as a file containing
# environment variable definitions. All subsequent arguments will be
# interpreted as a distinct command.

set -euo pipefail

export $(cat $1 | xargs)

${@:2}
