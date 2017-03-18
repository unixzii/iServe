#!/bin/bash

if [[ -f "${HOME}/.bash_profile" ]]; then
    source "${HOME}/.bash_profile"
fi

set -e

cd "${SRCROOT}/node"

npm install

set +e
