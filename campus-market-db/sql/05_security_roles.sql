-- 05_security_roles.sql
-- 安全性：最小权限角色（普通用户只读，写操作单独授权）
-- 说明：请使用数据库管理员账号执行本脚本。

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_readonly') THEN
    CREATE ROLE app_readonly NOLOGIN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_writer') THEN
    CREATE ROLE app_writer NOLOGIN;
  END IF;
END;
$$;

-- 角色可访问 public schema
GRANT USAGE ON SCHEMA public TO app_readonly, app_writer;

-- 普通用户：仅查询
GRANT SELECT ON TABLE "user", item, orders TO app_readonly;
REVOKE INSERT, UPDATE, DELETE ON TABLE "user", item, orders FROM app_readonly;

-- 写角色：允许读写
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "user", item, orders TO app_writer;

-- 购买函数仅允许写角色调用
REVOKE EXECUTE ON FUNCTION purchase_item(TEXT, TEXT, TEXT, DATE) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION purchase_item(TEXT, TEXT, TEXT, DATE) FROM app_readonly;
GRANT EXECUTE ON FUNCTION purchase_item(TEXT, TEXT, TEXT, DATE) TO app_writer;

-- 后续新增表的默认权限策略（基于执行脚本的所有者）
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO app_readonly;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE INSERT, UPDATE, DELETE ON TABLES FROM app_readonly;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_writer;

-- 按需创建登录用户并授予角色（幂等）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'readonly_user') THEN
    CREATE ROLE readonly_user LOGIN PASSWORD 'change_me_readonly';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'writer_user') THEN
    CREATE ROLE writer_user LOGIN PASSWORD 'change_me_writer';
  END IF;
END;
$$;

GRANT app_readonly TO readonly_user;
GRANT app_writer TO writer_user;
