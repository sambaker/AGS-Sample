kill `ps -ef | grep "[n]ode-inspector" | awk '{print $2}'`
node-inspector &
node --debug AGS-Server/server.js

