
# init unit test database script

mysql -uroot -h127.0.0.1 -e 'DROP DATABASE IF EXISTS `xprofiler_console_unittest`; CREATE DATABASE `xprofiler_console_unittest`;'
mysql -uroot -h127.0.0.1 -D 'xprofiler_console_unittest' < ${PWD}/db/init.sql
mysql -uroot -h127.0.0.1 -D 'xprofiler_console_unittest' -e 'SHOW tables;'

mysql -uroot -h127.0.0.1 -e 'DROP DATABASE IF EXISTS `xprofiler_logs_unittest`; CREATE DATABASE `xprofiler_logs_unittest`;'
