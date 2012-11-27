#!/bin/bash

if (( $# >= 1 ));then
    pushd .
    cd $1
fi

sfx='ice'
ncpu=`grep processor /proc/cpuinfo|wc -l`

if [ -f cores.log ];then
    echo "Generating multi core ..."
    sed -e 's/[时分]/:/g' -e 's/秒//g' -e 's/ [PA]M//g' cores.log > cores.log.tmp
    idx=0
    while(($idx<$ncpu))
    do
        tmpfile="core.$idx.tmp"
        let num=$idx+1
        cmdstr="awk 'BEGIN{print(\"TIME\",\"U\"$num)}{if(\$2==$idx)print(\$1,100-\$8)}' cores.log.tmp>>$tmpfile"
        eval $cmdstr
        if (($idx>0))
        then
            join -i cores.$sfx $tmpfile>cores.$sfx.tmp
            mv cores.$sfx.tmp cores.$sfx
        else
            cp $tmpfile cores.$sfx
        fi
        rm -f $tmpfile
        let idx++
    done
    #check time string
    rm cores.log.tmp
    echo "Done!"
fi

if [ -f cpu.log ] && [ -f mem.log ];then
    echo "Generating CPU/RAM ..."
    sed -e 's/[时分]/:/g' -e 's/秒//g' -e 's/ [PA]M//g' cpu.log > cpu.log.tmp
    sed -e 's/[时分]/:/g' -e 's/秒//g' -e 's/ [PA]M//g' mem.log > mem.log.tmp
    awk 'BEGIN{print("TIME","%cpu")}$3 ~/^[0-9.].*$/{print($1,100-$8)}' cpu.log.tmp>cpu.log.tmp2
    awk 'BEGIN{print("TIME","%mem")}$3 ~/^[0-9.].*$/{print($1,$4)}' mem.log.tmp>mem.log.tmp2
    join -i cpu.log.tmp2 mem.log.tmp2 > cpu-mem.$sfx
    rm -f cpu.log.tmp2 mem.log.tmp2 cpu.log.tmp mem.log.tmp
    #check time string
    #mv cpu-mem.$sfx.tmp cpu-mem.$sfx
    echo "Done!"
fi

if [ -f  socket.log ];then
    echo "Generating Socket ..."
    echo "TIME inuse orphan">socket.$sfx
    cat socket.log>>socket.$sfx
    echo "Done!"
fi

if [ -f  tcp.log ];then
    echo "Generating TCP ..."
    sed -e 's/[时分]/:/g' -e 's/秒//g' -e 's/ [PA]M//g' tcp.log>tcp.log.tmp
    nics=`../../script/getnics.sh`
    for nic in ${nics[@]};do
        grep $nic tcp.log.tmp|awk -v tag=$nic 'BEGIN{print("TIME",tag "-rxpck/s",tag "-txpck/s")}{print($1,$3,$4)}'>tcp-$nic-pkg.$sfx
        grep $nic tcp.log.tmp|awk -v tag=$nic 'BEGIN{print("TIME",tag "-rxkb/s",tag "-txkb/s")}{print($1,$5,$6)}'>tcp-$nic-size.$sfx
    done
    rm -f tcp.log.tmp
    echo "Done!"
fi

if (( $# >= 1 ));then
    popd
fi

