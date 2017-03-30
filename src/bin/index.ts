#!/usr/bin/env node

import * as program from 'commander'

import {handleScreenshots, handleCompare} from '../cli'

const version = require('../package').version

program.version(version)

program
    .command('screenshots [environments...]')
    .description('Capture screenshots of web pages')
    .option('-d, --directory [directory]')
    .option('-c --config [config]')
    .action(handleScreenshots)

program
    .command('compare <original> <comparison>')
    .description('Compare screenshots of web pages')
    .option('-d, --directory [directory]')
    .option('-c --config [config]')
    .action(handleCompare)

program.parse(process.argv)