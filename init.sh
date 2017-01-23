#!/bin/bash

# # source environment variables for OpenStack and UCD
# source ~/openrc

PATTERN_NAME=jke
DS_USERNAME=admin
DS_PASSWORD=admin
DS_WEB_URL=http://192.168.27.100:8080

# add example jke application to UCD
curl --verbose -u $DS_USERNAME:$DS_PASSWORD -s --insecure -F "file=@/vagrant/patterns/jke/plugins/WebSphereLiberty-7.778014.zip;type=application/zip" -F "filename=WebSphereLiberty-2.455142.zip" $DS_WEB_URL/rest/plugin/automationPlugin

docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponent /artifacts/mysql/MySQL+Server.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponentProcess /artifacts/mysql/deploy-ubuntu.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponentProcess /artifacts/mysql/deploy-windows.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponentProcess /artifacts/mysql/deploy.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createVersion -component "MySQL Server" -name 5.5.49
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client addVersionFiles -component "MySQL Server" -version 5.5.49 -base /artifacts/mysql/artifacts/ -exclude .DS_Store

docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponent /artifacts/wlp/WebSphere+Liberty+Profile.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponentProcess /artifacts/wlp/open-firewall-port-ubuntu.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponentProcess /artifacts/wlp/open-firewall-port-windows.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponentProcess /artifacts/wlp/deploy.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createVersion -component "WebSphere Liberty Profile" -name 16.0.0.4
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client addVersionFiles -component "WebSphere Liberty Profile" -version 16.0.0.4 -base /artifacts/wlp/artifacts/ -exclude .DS_Store

wasLibertyId=`docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client getComponent -component "WebSphere Liberty Profile" | python -c \
"import json; import sys;
data=json.load(sys.stdin); print data['id']"`

curl -u $DS_USERNAME:$DS_PASSWORD \
     -H 'Content-Type: application/json' \
     -X PUT \
     -d "
  {
    \"definitionGroupId\": \"05e2d7ed-6f7c-4b98-93d0-caedca00eb4s\",
    \"description\": \"WAS Liberty Install Directory\",
    \"label\": \"WAS Liberty Install Dir\",
    \"name\": \"liberty.install.dir\",
    \"pattern\": \"\",
    \"required\": \"true\",
    \"type\": \"TEXT\",
    \"value\": \"/opt/was/liberty\"
  }
" \
""$DS_WEB_URL"/property/propSheetDef/components&"$wasLibertyId"&environmentPropSheetDef.-1/propDefs"

docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponent /artifacts/jke.db/jke.db.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponentProcess /artifacts/jke.db/deploy.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createVersion -component jke.db -name 1.0
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client addVersionFiles -component jke.db -version 1.0 -base /artifacts/jke.db/artifacts/ -exclude .DS_Store
jkeDbId=`docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client getComponent -component jke.db | python -c \
"import json; import sys;
data=json.load(sys.stdin); print data['id']"`

curl -u $DS_USERNAME:$DS_PASSWORD \
     -H 'Content-Type: application/json' \
     -X PUT \
     -d "
  {
    \"definitionGroupId\": \"05e2d7ed-6f7c-4b98-93d0-caedca00eb4t\",
    \"description\": \"MySQL bin Directory\",
    \"label\": \"MySQL Bin Dir\",
    \"name\": \"mysql.bin.dir\",
    \"pattern\": \"\",
    \"required\": \"true\",
    \"type\": \"TEXT\",
    \"value\": \"/usr/bin\"
  }
" \
""$DS_WEB_URL"/property/propSheetDef/components&"$jkeDbId"&environmentPropSheetDef.-1/propDefs"

docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponent /artifacts/jke.war/jke.war.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createComponentProcess /artifacts/jke.war/deploy.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createVersion -component jke.war -name 1.0
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client addVersionFiles -component jke.war -version 1.0 -base /artifacts/jke.war/artifacts/ -exclude .DS_Store
jkeWarId=`docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client getComponent -component jke.war | python -c \
"import json; import sys;
data=json.load(sys.stdin); print data['id']"`

curl -u $DS_USERNAME:$DS_PASSWORD \
     -H 'Content-Type: application/json' \
     -X PUT \
     -d "
  {
    \"definitionGroupId\": \"05e2d7ed-6f7c-4b98-93d0-caedca00eb4u\",
    \"description\": \"JKE Database Server Hostname/IP Address\",
    \"label\": \"JKE DB HOST\",
    \"name\": \"jke.db.host\",
    \"pattern\": \"\",
    \"required\": \"true\",
    \"type\": \"TEXT\",
    \"value\": \"\"
  }
" \
""$DS_WEB_URL"/property/propSheetDef/components&"$jkeWarId"&environmentPropSheetDef.-1/propDefs"

curl -u $DS_USERNAME:$DS_PASSWORD \
     -H 'Content-Type: application/json' \
     -X PUT \
     -d "
  {
    \"definitionGroupId\": \"05e2d7ed-6f7c-4b98-93d0-caedca00eb4v\",
    \"description\": \"WAS Liberty Install Directory\",
    \"label\": \"WAS Liberty Install Dir\",
    \"name\": \"liberty.install.dir\",
    \"pattern\": \"\",
    \"required\": \"true\",
    \"type\": \"TEXT\",
    \"value\": \"/opt/was/liberty\"
  }
" \
""$DS_WEB_URL"/property/propSheetDef/components&"$jkeWarId"&environmentPropSheetDef.-1/propDefs"

docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client createApplication /artifacts/JKE.json
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client addComponentToApplication -component "MySQL Server" -application JKE
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client addComponentToApplication -component "WebSphere Liberty Profile" -application JKE
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client addComponentToApplication -component jke.db -application JKE
docker run --rm -v $(pwd):/artifacts stackinabox/urbancode-deploy-client addComponentToApplication -component jke.war -application JKE

# clone "demo" user repo from local gitblit server
# git config --global user.name "gitadmin"
# git config --global 
# git clone http://gitadmin@192.168.27.100:9080/gitblit/r/demo.git

$(pwd)/init-tutorial.sh


# push jke.yml pattern into gitblit repo for ucdp workspace
# sudo apt-get install -qqy expect

# git config --global user.name "gitadmin"
# git config --global user.email "vagrant@stackinabox.io"
# git config --global push.default matching

# expect <<- DONE
#   set timeout -1

#   spawn git clone ssh://gitadmin@192.168.27.100:29418/demo.git
#   match_max 100000

#   # Look for passwod prompt
#   expect "*?assword:*"
#   # Send password aka $password
#   send -- "gitadmin\r"
#   # send blank line (\r) to make sure we get back to gui
#   send -- "\r"
#   expect eof
# DONE

# cp -R pattern/jke demo/
# cd demo/
# git add . -A
# git commit -m "Add JKE Banking Application Blueprint"

# expect <<- DONE
#   set timeout -1

#   spawn git push
#   match_max 100000

#   # Look for passwod prompt
#   expect "*?assword:*"
#   # Send password aka $password
#   send -- "gitadmin\r"
#   # send blank line (\r) to make sure we get back to gui
#   send -- "\r"
#   expect eof
# DONE

