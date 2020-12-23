
# init unit test database script

PASSWORD=${MYSQL_ROOT_PASSWORD:-root}

mysql -uroot -p${PASSWORD} -h127.0.0.1 -e 'DROP DATABASE IF EXISTS `xprofiler_console_unittest`; CREATE DATABASE `xprofiler_console_unittest`;'
mysql -uroot -p${PASSWORD} -h127.0.0.1 -D 'xprofiler_console_unittest' < ${PWD}/db/init.sql
mysql -uroot -p${PASSWORD} -h127.0.0.1 -D 'xprofiler_console_unittest' -e 'SHOW tables;'

mysql -uroot -p${PASSWORD} -h127.0.0.1 -e 'DROP DATABASE IF EXISTS `xprofiler_logs_unittest`; CREATE DATABASE `xprofiler_logs_unittest`;'
