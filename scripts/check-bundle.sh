#!/usr/bin/env bash
# Quick sanity bundle without Vite (CI-style smoke test)
set -e
ESB=${ESBUILD:-npx esbuild}
$ESB src/main.jsx --bundle --outdir=dist-test --loader:.js=jsx --loader:.jpeg=file --loader:.png=file \
  --alias:@=./src --format=esm --jsx=automatic --define:import.meta.env=undefined \
  --define:process.env.NODE_ENV=\"development\" --log-level=error
