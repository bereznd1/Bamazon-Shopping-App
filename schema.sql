DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(200) NOT NULL,
  department_name VARCHAR(100),
  price DECIMAL(8,2) NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Signed Dr. Dre CD", "Music", 123.99, 4),("Wu Tang Hoodie", "Apparel", 29.99, 20),("Snoop Dogg Doggystyle Vinyl", "Music", 31.99, 10),
("Toaster Oven", "Appliances", 19.99, 100),("GTA San Andreas for PC", "Electronics", 21.95, 80),
("50 Inch Samsung LCD TV", "Electronics", 699.99, 26), ("Can of Pepsi", "Food", 1.99, 200),
("Mobb Deep Poster", "Music", 5.99, 12),("Refrigerator", "Appliances", 999.99, 62),("Limp Bizkit Red Baseball Cap", "Apparel", 12.99, 38);

SELECT item_id, product_name, department_name, price, stock_quantity 
FROM products;
