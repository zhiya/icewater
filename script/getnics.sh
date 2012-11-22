#!/bin/bash
grep : /proc/net/dev|awk -F: '{print($1)}'
