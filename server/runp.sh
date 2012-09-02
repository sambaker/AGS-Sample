kill `ps -ef | grep "[n]ode-inspector" | awk '{print $2}'`
node-inspector &
NODE_ENV=production node gameserver/server.js

