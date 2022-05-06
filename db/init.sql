-- xprofiler_console

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`(
  `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'unique auto increment id',
  `user_name` VARCHAR(100) NOT NULL COMMENT 'user name',
  `nick` VARCHAR(100) NOT NULL COMMENT 'user nick name',
  `pass` VARCHAR(200) NOT NULL COMMENT 'user pass key',
  `identity` VARCHAR(20) NOT NULL COMMENT 'user identity sign',
  `mail` VARCHAR(250) NOT NULL COMMENT 'user mail address',
  `gm_modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'system modify timestamp',
  `gm_create` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'system create timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`user_name`),
  UNIQUE KEY (`identity`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT 'user info table';

DROP TABLE IF EXISTS `apps`;
CREATE TABLE `apps`(
  `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'unique auto increment id',
  `app_name` VARCHAR(50) NOT NULL COMMENT 'app name',
  `app_owner` BIGINT UNSIGNED NOT NULL COMMENT 'owner user unique id',
  `secret` VARCHAR(50) NOT NULL COMMENT 'app secret key',
  `gm_modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'system modify timestamp',
  `gm_create` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'system create timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`app_owner`, `app_name`),
  INDEX (`app_owner`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT 'app info table';

DROP TABLE IF EXISTS `members`;
CREATE TABLE `members`(
  `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'unique auto increment id',
  `app` BIGINT UNSIGNED NOT NULL COMMENT 'app unique id',
  `user` BIGINT UNSIGNED NOT NULL COMMENT 'user unique id',
  `member_status` INT UNSIGNED NOT NULL COMMENT '1: inviting, 2: joined',
  `gm_modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'system modify timestamp',
  `gm_create` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'system create timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`app`, `user`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT 'app members info table';

DROP TABLE IF EXISTS `files`;
CREATE TABLE `files`(
  `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'unique auto increment id',
  `app` BIGINT NOT NULL COMMENT 'app unique id',
  `agent` VARCHAR(50) NOT NULL COMMENT 'agent name',
  `type` VARCHAR(50) NOT NULL COMMENT 'file type',
  `file` VARCHAR(250) NOT NULL COMMENT 'file path',
  `storage` VARCHAR(250) DEFAULT "" COMMENT 'file storage path with custom',
  `user` BIGINT UNSIGNED NOT NULL COMMENT 'user unique id',
  `file_status` TINYINT UNSIGNED DEFAULT 0 COMMENT '0:creating, 1:created, 2:transferring, 3:transferred',
  `favor` TINYINT UNSIGNED DEFAULT 0 COMMENT '0:not favor, 1:has favor',
  `token` VARCHAR(50) DEFAULT "" COMMENT 'file token',
  `gm_modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'system modify timestamp',
  `gm_create` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'system create timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`app`, `agent`, `file`, `storage`),
  INDEX (`id`, `app`, `type`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT 'analyse file info table';

DROP TABLE IF EXISTS `coredumps`;
CREATE TABLE `coredumps`(
  `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'unique auto increment id',
  `app` BIGINT NOT NULL COMMENT 'app unique id',
  `agent` VARCHAR(50) NOT NULL COMMENT 'agent name',
  `file` VARCHAR(250) NOT NULL COMMENT 'file path',
  `file_storage` VARCHAR(250) DEFAULT "" COMMENT 'file storage with custom',
  `file_status` TINYINT UNSIGNED DEFAULT 0 COMMENT '0:creating, 1:created, 2:transferring, 3:transferred',
  `node` VARCHAR(250) NOT NULL COMMENT 'node path',
  `node_storage` VARCHAR(250) DEFAULT "" COMMENT 'node name',
  `node_status` TINYINT UNSIGNED DEFAULT 0 COMMENT '0:creating, 1:created, 2:transferring, 3:transferred, 99:create-failed',
  `user` BIGINT UNSIGNED NOT NULL COMMENT 'user unique id',
  `favor` TINYINT UNSIGNED DEFAULT 0 COMMENT '0:not favor, 1:has favor',
  `token` VARCHAR(50) DEFAULT "" COMMENT 'file token',
  `gm_modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'system modify timestamp',
  `gm_create` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'system create timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`app`, `agent`, `file`, `file_storage`),
  INDEX (`id`, `app`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT 'coredumps info table';

DROP TABLE IF EXISTS `strategies`;
CREATE TABLE `strategies`(
  `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'unique auto increment id',
  `app` BIGINT NOT NULL COMMENT 'app unique id',
  `strg_context` VARCHAR(50) NOT NULL COMMENT 'context type',
  `push` VARCHAR(50) NOT NULL COMMENT 'push level',
  `webhook` TINYINT UNSIGNED DEFAULT 0 COMMENT '0:close, 1:open',
  `wtype` VARCHAR(20) DEFAULT '' COMMENT 'webhook type',
  `waddress` VARCHAR(200) DEFAULT '' COMMENT 'webhook address',
  `wsign` VARCHAR(100) DEFAULT '' COMMENT 'webhook sign',
  `expression` VARCHAR(150) NOT NULL COMMENT 'alarm expression',
  `content` VARCHAR(150) NOT NULL COMMENT 'alarm content',
  `strg_status` TINYINT UNSIGNED DEFAULT 1 COMMENT '0:disable, 1:enable',
  `gm_modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'system modify timestamp',
  `gm_create` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'system create timestamp',
  PRIMARY KEY (`id`),
  INDEX (`id`, `app`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT 'strategies info table';

DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts`(
  `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'unique auto increment id',
  `strategy` BIGINT UNSIGNED NOT NULL COMMENT 'strategy unique id',
  `user` BIGINT UNSIGNED NOT NULL COMMENT 'user unique id',
  `gm_modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'system modify timestamp',
  `gm_create` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'system create timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY (`strategy`, `user`),
  INDEX (`strategy`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT 'strategy contacts info table';
