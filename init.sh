#!/bin/bash

# source environment variables for OpenStack and UCD
source ~/openrc

# add security group rule to allow ssh access
nova secgroup-add-group-rule default default tcp 22 22

udclient createComponent /vagrant/scripts/aio/agent-linux-x86_64.json
# udclient createVersion -component ucd-agent-linux-x86_64 -name 7.1
# udclient addVersionFiles -component ucd-agent-linux-x86_64 -version 7.1 -base /Users/tpouyer/Development/workspace/ucdp/juno/allinone/ibm-ucd-install/agent-package-install/lib/linux-x86_64

udclient createComponent /vagrant/scripts/aio/agent-win-x86_64.json
# udclient createVersion -component ucd-agent-win-x86_64 -name 7.1
# udclient addVersionFiles -component ucd-agent-win-x86_64 -version 7.1 -base /Users/tpouyer/Development/workspace/ucdp/juno/allinone/landscaper/win-x86_64/lib/win-x86_64


# add example jke application to UCD
curl --verbose -u $DS_USERNAME:$DS_PASSWORD -s --insecure -F "file=@/vagrant/patterns/jke/plugins/WebSphereLiberty-2.455142.zip;type=application/zip" -F "filename=WebSphereLiberty-2.455142.zip" $DS_WEB_URL/rest/plugin/automationPlugin

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

udclient createComponent $PATTERN_HOME/jke.db/jke.db.json
udclient createComponentProcess $PATTERN_HOME/jke.db/deploy.json
udclient createVersion -component jke.db -name 1.0
udclient addVersionFiles -component jke.db -version 1.0 -base $PATTERN_HOME/jke.db/artifacts/ -exclude .DS_Store

udclient createComponent $PATTERN_HOME/jke.war/jke.war.json
udclient createComponentProcess $PATTERN_HOME/jke.war/deploy.json
udclient createVersion -component jke.war -name 1.0
udclient addVersionFiles -component jke.war -version 1.0 -base $PATTERN_HOME/jke.war/artifacts/ -exclude .DS_Store

udclient createApplication $PATTERN_HOME/JKE.json
udclient addComponentToApplication -component "MySQL Server" -application JKE
udclient addComponentToApplication -component "WebSphere Liberty Profile" -application JKE
udclient addComponentToApplication -component jke.db -application JKE
udclient addComponentToApplication -component jke.war -application JKE

# add security groups for JKE sample application
nova secgroup-create was-liberty-sg "WebSphere Liberty security group for your liberty hosted application servers."

# add security group rule to allow http access
nova secgroup-add-rule was-liberty-sg tcp 22 22 '0.0.0.0/0'
nova secgroup-add-rule was-liberty-sg tcp 80 80 '0.0.0.0/0'
nova secgroup-add-rule was-liberty-sg tcp 443 443 '0.0.0.0/0'
nova secgroup-add-rule was-liberty-sg tcp 9080 9080 '0.0.0.0/0'
nova secgroup-add-rule was-liberty-sg tcp 9443 9443 '0.0.0.0/0'

# add security groups for JKE sample application
nova secgroup-create mysql-sg "MySQL security group for your mysql servers."

#specific to websphere
nova secgroup-add-rule mysql-sg tcp 22 22 '0.0.0.0/0'
nova secgroup-add-rule mysql-sg tcp 3306 3306 '0.0.0.0/0'
