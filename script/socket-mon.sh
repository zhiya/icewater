#!/bin/bash

logfile=./logs/log/socket.log
interval=30

if (($# >= 1))
then
    interval="$1"
fi

while [[ true ]]
do
    sleep $interval
    dtstr=`date +%H:%M:%S`
    grep ^TCP /proc/net/sockstat|awk '{print(dtstr,$3,$5)}' dtstr="$dtstr">>$logfile
done

