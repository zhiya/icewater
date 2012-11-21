#!/bin/bash

interval=30

if (($# >= 1))
then
    interval=$1
fi

sar -P ALL $interval > ./logs/log/cores.log &
sar -n DEV $interval > ./logs/log/tcp.log &
sar -r $interval > ./logs/log/mem.log &
sar -u $interval > ./logs/log/cpu.log &

