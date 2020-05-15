#!/usr/bin/env bash
echo "----------------------------------"
echo "| Creating SSH tunnel..."
echo "----------------------------------"
ssh -L 5431:ara.w3.org:5432 root@ara.w3.org -ANf

# Keep track of the SSH tunnel
tunnel_list=$!

echo SSH Tunnel created with PID $tunnel_list. Make sure to kill this process when you are done.

echo "----------------------------------"
echo "| Exporting Postgres variables..."
echo "----------------------------------"
# The RDS credentials live on nest.bocoup.com for consumption (they are in JSON format)
CREDENTIALS=$(ssh root@ara.w3.org cat /home/aria-bot/config.env | grep PG)
for s in $(echo $CREDENTIALS); do
    export $s
done

export PGHOST=localhost
export PGPORT=5431