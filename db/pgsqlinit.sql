-- File name: C:\Users\songxiaodong5\Desktop\pl\abc.sql
-- Created by DBConvert http://www.dbconvert.com


--
-- Table structure for table `apps`
--

CREATE TABLE "apps" (  "id" BIGSERIAL NOT NULL ,
  "name" VARCHAR(50) NOT NULL ,
  "owner" BIGINT NOT NULL ,
  "secret" VARCHAR(50) NOT NULL ,
  "gm_modified" TIMESTAMP NULL ,
  "gm_create" TIMESTAMP NULL ,
  PRIMARY KEY ("id"),
  UNIQUE ("owner","name")
); 
CREATE INDEX "apps_owner_2" ON "apps" ("owner");


--
-- Table structure for table `contacts`
--

CREATE TABLE "contacts" (  "id" BIGSERIAL NOT NULL ,
  "strategy" BIGINT NOT NULL ,
  "user" BIGINT NOT NULL ,
  "gm_modified" TIMESTAMP NULL ,
  "gm_create" TIMESTAMP NULL ,
  PRIMARY KEY ("id"),
  UNIQUE ("strategy","user")
); 
CREATE INDEX "contacts_strategy_2" ON "contacts" ("strategy");


--
-- Table structure for table `coredumps`
--

CREATE TABLE "coredumps" (  "id" BIGSERIAL NOT NULL ,
  "app" INTEGER NOT NULL ,
  "agent" VARCHAR(50) NOT NULL ,
  "file" VARCHAR(250) NOT NULL ,
  "file_storage" VARCHAR(250) NULL ,
  "file_status" SMALLINT NULL DEFAULT 0,
  "node" VARCHAR(250) NOT NULL ,
  "node_storage" VARCHAR(250) NULL ,
  "node_status" SMALLINT NULL DEFAULT 0,
  "user" BIGINT NOT NULL ,
  "favor" SMALLINT NULL DEFAULT 0,
  "token" VARCHAR(50) NULL ,
  "gm_modified" TIMESTAMP NULL ,
  "gm_create" TIMESTAMP NULL ,
  PRIMARY KEY ("id"),
  UNIQUE ("app","agent","file","file_storage")
); 
CREATE INDEX "coredumps_id" ON "coredumps" ("id","app");


--
-- Table structure for table `files`
--

CREATE TABLE "files" (  "id" BIGSERIAL NOT NULL ,
  "app" INTEGER NOT NULL ,
  "agent" VARCHAR(50) NOT NULL ,
  "type" VARCHAR(50) NOT NULL ,
  "file" VARCHAR(250) NOT NULL ,
  "storage" VARCHAR(250) NULL ,
  "user" BIGINT NOT NULL ,
  "status" SMALLINT NULL DEFAULT 0,
  "favor" SMALLINT NULL DEFAULT 0,
  "token" VARCHAR(50) NULL ,
  "gm_modified" TIMESTAMP NULL ,
  "gm_create" TIMESTAMP NULL ,
  PRIMARY KEY ("id"),
  UNIQUE ("app","agent","file","storage")
); 
CREATE INDEX "files_id" ON "files" ("id","app","type");


--
-- Table structure for table `strategies`
--

CREATE TABLE "strategies" (  "id" BIGSERIAL NOT NULL ,
  "app" INTEGER NOT NULL ,
  "context" VARCHAR(50) NOT NULL ,
  "push" VARCHAR(50) NOT NULL ,
  "webhook" SMALLINT NULL DEFAULT 0,
  "wtype" VARCHAR(20) NULL ,
  "waddress" VARCHAR(200) NULL ,
  "wsign" VARCHAR(100) NULL ,
  "expression" VARCHAR(150) NOT NULL ,
  "content" VARCHAR(150) NOT NULL ,
  "status" SMALLINT NULL DEFAULT 1.,
  "gm_modified" TIMESTAMP NULL ,
  "gm_create" TIMESTAMP NULL ,
  PRIMARY KEY ("id")
); 
CREATE INDEX "strategies_id" ON "strategies" ("id","app");


--
-- Table structure for table `user`
--

CREATE TABLE "user" (  "id" BIGSERIAL NOT NULL ,
  "name" VARCHAR(100) NOT NULL ,
  "nick" VARCHAR(100) NOT NULL ,
  "pass" VARCHAR(200) NOT NULL ,
  "identity" VARCHAR(20) NOT NULL ,
  "mail" VARCHAR(250) NOT NULL ,
  "gm_modified" TIMESTAMP NULL ,
  "gm_create" TIMESTAMP NULL ,
  PRIMARY KEY ("id"),
  UNIQUE ("name"),
  UNIQUE ("identity")
); 


--
-- Table structure for table `users`
--

CREATE TABLE "users" (  "id" BIGSERIAL NOT NULL ,
  "name" VARCHAR(100) NULL ,
  "created_at" VARCHAR(100) NULL ,
  "updated_at" VARCHAR(100) NULL ,
  PRIMARY KEY ("id")
); 