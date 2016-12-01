#!/bin/bash

# source environment variables for OpenStack and UCD
source ~/openrc

# add example jke application to UCD
curl --verbose -u $DS_USERNAME:$DS_PASSWORD -s --insecure -F "file=@/vagrant/patterns/jke/plugins/WebSphereLiberty-7.778014.zip;type=application/zip" -F "filename=WebSphereLiberty-2.455142.zip" $DS_WEB_URL/rest/plugin/automationPlugin

PATTERN_NAME=jke
PATTERN_HOME=/vagrant/patterns/$PATTERN_NAME

udclient createComponent $PATTERN_HOME/mysql/MySQL+Server.json
udclient createComponentProcess $PATTERN_HOME/mysql/deploy-ubuntu.json
udclient createComponentProcess $PATTERN_HOME/mysql/deploy-windows.json
udclient createComponentProcess $PATTERN_HOME/mysql/deploy.json
udclient createVersion -component "MySQL Server" -name 5.5.49
udclient addVersionFiles -component "MySQL Server" -version 5.5.49 -base $PATTERN_HOME/mysql/artifacts/ -exclude .DS_Store

udclient createComponent $PATTERN_HOME/wlp/WebSphere+Liberty+Profile.json
udclient createComponentProcess $PATTERN_HOME/wlp/open-firewall-port-ubuntu.json
udclient createComponentProcess $PATTERN_HOME/wlp/open-firewall-port-windows.json
udclient createComponentProcess $PATTERN_HOME/wlp/deploy.json
udclient createVersion -component "WebSphere Liberty Profile" -name 8.5.5.5
udclient addVersionFiles -component "WebSphere Liberty Profile" -version 8.5.5.5 -base $PATTERN_HOME/wlp/artifacts/ -exclude .DS_Store

wasLibertyId=`udclient getComponent -component "WebSphere Liberty Profile" | python -c \
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

udclient createComponent $PATTERN_HOME/jke.db/jke.db.json
udclient createComponentProcess $PATTERN_HOME/jke.db/deploy.json
udclient createVersion -component jke.db -name 1.0
udclient addVersionFiles -component jke.db -version 1.0 -base $PATTERN_HOME/jke.db/artifacts/ -exclude .DS_Store
jkeDbId=`udclient getComponent -component jke.db | python -c \
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

udclient createComponent $PATTERN_HOME/jke.war/jke.war.json
udclient createComponentProcess $PATTERN_HOME/jke.war/deploy.json
udclient createVersion -component jke.war -name 1.0
udclient addVersionFiles -component jke.war -version 1.0 -base $PATTERN_HOME/jke.war/artifacts/ -exclude .DS_Store
jkeWarId=`udclient getComponent -component jke.war | python -c \
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

udclient createApplication $PATTERN_HOME/JKE.json
udclient addComponentToApplication -component "MySQL Server" -application JKE
udclient addComponentToApplication -component "WebSphere Liberty Profile" -application JKE
udclient addComponentToApplication -component jke.db -application JKE
udclient addComponentToApplication -component jke.war -application JKE

# add security groups for JKE sample application
nova secgroup-create was-liberty-sg "Ports required for applications hosted on WebSphere Liberty."

# add security group rule to allow http access
nova secgroup-add-rule was-liberty-sg tcp 22 22 '0.0.0.0/0'
nova secgroup-add-rule was-liberty-sg tcp 80 80 '0.0.0.0/0'
nova secgroup-add-rule was-liberty-sg tcp 443 443 '0.0.0.0/0'
nova secgroup-add-rule was-liberty-sg tcp 9080 9080 '0.0.0.0/0'
nova secgroup-add-rule was-liberty-sg tcp 9443 9443 '0.0.0.0/0'

# add security groups for JKE sample application
nova secgroup-create mysql-sg "Ports required for MySQL Server."

#specific to websphere
nova secgroup-add-rule mysql-sg tcp 22 22 '0.0.0.0/0'
nova secgroup-add-rule mysql-sg tcp 3306 3306 '0.0.0.0/0'

$PATTERN_HOME/init-tutorial.sh


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

