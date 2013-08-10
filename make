#!/bin/bash
cd "$(git rev-parse --show-toplevel)"
cat src/header.js src/category.js src/node.js src/footer.js > treer.js
