#!/bin/bash

mkdir -p ./logs/log

./script/sar-mon.sh
./script/socket-mon.sh&

