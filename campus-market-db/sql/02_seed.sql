-- 02_seed.sql
-- 题目给定初始数据

-- 默认密码统一为：Campus123!
INSERT INTO "user" (user_id, user_name, phone, password_hash) VALUES
('u001', 'ZhangSan', '13800000001', 'sha256$u001$49ecf81a5ba3da7948dfe42fd4129663ad6db915425d5c120758e0f7e0d2339f'),
('u002', 'LiSi', '13800000002', 'sha256$u002$6efa08f947200275a6864720e5d8df44bec999568141f4edbc0c461ffef7d54c'),
('u003', 'WangWu', '13800000003', 'sha256$u003$5cc180404cf02e448f388975f3ac02104e3177544cb476c3d9e2bf573b1efeb9'),
('u004', 'ZhaoLiu', '13800000004', 'sha256$u004$186380871cdb3cca17cdba426e6635dc0829c328d2d3a790eb57d89943323436')
ON CONFLICT (user_id) DO UPDATE
SET
	user_name = EXCLUDED.user_name,
	phone = EXCLUDED.phone,
	password_hash = EXCLUDED.password_hash;

INSERT INTO item (item_id, item_name, category, price, status, seller_id) VALUES
('i001', 'CalculusBook', 'Book', 20, 0, 'u001'),
('i002', 'DeskLamp', 'DailyGoods', 35, 1, 'u002'),
('i003', 'Microcontroller', 'Electronics', 80, 0, 'u001'),
('i004', 'Chair', 'Furniture', 50, 1, 'u003'),
('i005', 'WaterBottle', 'DailyGoods', 15, 0, 'u004')
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO orders (order_id, item_id, buyer_id, order_date) VALUES
('o001', 'i002', 'u001', '2024-05-01'),
('o002', 'i004', 'u002', '2024-05-03')
ON CONFLICT (order_id) DO NOTHING;
