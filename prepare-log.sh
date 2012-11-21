#!/bin/bash

ncpu=`grep processor /proc/cpuinfo|wc -l`

echo "Generating multi core ..."
idx=0
while(($idx<$ncpu))
do
    tmpfile="core.$idx.tmp"
    let num=$idx+1
    cmdstr="awk 'BEGIN{print(\"TIME\",\"U\"$num)}{if(\$2==$idx)print(\$1,100-\$8)}' cores.log>>$tmpfile"
    eval $cmdstr
    if (($idx>0))
    then
        join -i cores.txt $tmpfile>cores.txt.tmp
        mv cores.txt.tmp cores.txt
    else
        cp $tmpfile cores.txt
    fi
    rm -f $tmpfile
    let idx++
done
#check time string
sed -e 's/[时分]/:/g' -e 's/秒//g' cores.txt > cores.txt.tmp
mv cores.txt.tmp cores.txt
echo "Done!"

echo "Generating CPU/RAM ..."
awk 'BEGIN{print("TIME","%cpu")}$3 ~/^[0-9.].*$/{print($1,100-$8)}' cpu.log>cpu.log.tmp
awk 'BEGIN{print("TIME","%mem")}$3 ~/^[0-9.].*$/{print($1,$4)}' mem.log>mem.log.tmp
join -i cpu.log.tmp mem.log.tmp>cpu-mem.txt
rm -f cpu.log.tmp mem.log.tmp

#check time string
sed -e 's/[时分]/:/g' -e 's/秒//g' cpu-mem.txt > cpu-mem.txt.tmp
mv cpu-mem.txt.tmp cpu-mem.txt
echo "Done!"

echo "Generating Socket ..."
echo "TIME inuse orphan">socket.txt
more socket.log>>socket.txt
echo "Done!"

echo "Generating TCP ..."
sed -e 's/[时分]/:/g' -e 's/秒//g' tcp.log>tcp.log.tmp
grep em1 tcp.log.tmp|awk 'BEGIN{print("TIME","rxpck/s","txpck/s")}{print($1,$3,$4)}'>tcp-em1-pkg.txt
grep em1 tcp.log.tmp|awk 'BEGIN{print("TIME","rxkb/s","txkB/s")}{print($1,$5,$6)}'>tcp-em1-size.txt
rm -f tcp.log.tmp
echo "Done!"

