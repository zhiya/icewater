#!/bin/bash
killall sar
killall socket-mon.sh

timestr=`date +%Y-%m-%d_%H-%M-%S`
destlogfile=./log.$timestr

if [[ -f ./logs/conn-task.txt ]];then
    mv ./logs/conn-task.txt ./logs/log/conn-task.txt
fi

mv ./logs/log $destlogfile

cd $destlogfile
../prepare-log.sh

