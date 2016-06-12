#!/bin/bash

# source environment variables for OpenStack and UCD
source ~/openrc

PATTERN_NAME=jke
PATTERN_HOME=/vagrant/patterns/$PATTERN_NAME

rm -rf /vagrant/tutorial/previous-TutorialContent.js
mv /vagrant/tutorial/TutorialContent.js /vagrant/tutorial/previous-TutorialContent.js
cp $PATTERN_HOME/tutorial/TutorialContent.js /vagrant/tutorial/TutorialContent.js

echo "\n"
echo "Open browser to http://192.168.27.100:9080/landscaper/view/tutorial"
echo "\n"