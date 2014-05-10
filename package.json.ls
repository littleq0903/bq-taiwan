#!/usr/bin/env lsc -cj
author: 'Colin Su'
name: 'bq-taiwan'
descript: 'Query & Visual Tool for Taiwan Location-based Data'
version: '0.0.1'
scripts:
  republish: 'lsc -cj package.json.ls'
  build: 'gulp --require LiveScript build'
  dev: 'gulp --require LiveScript dev'
dependencies: {}
devDependencies:
  express: '3.4.x'
  LiveScript: '1.2.x'
  gulp: '~3.5.0'
  'gulp-livescript': '~0.1.1'
