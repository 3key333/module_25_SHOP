Sql запрос для таблицы схожих товаров:

1) таблица + колонки

CREATE TABLE similar_products (
    product_id VARCHAR(36),
    similar_product_id VARCHAR(36),
    
    UNIQUE KEY unique_pair (product_id, similar_product_id),
    
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (similar_product_id) REFERENCES products(id),
    
    CHECK (product_id != similar_product_id)
)

2) 

заполнение:

INSERT INTO similar_products (product_id, similar_product_id) 
VALUES 
    ('34e1a2a7-d0a9-4c7a-99f6-c2d5b5afaa06','88a3f826-9c3d-4f7c-a56e-156d7c3f3b28'),
    ('34e1a2a7-d0a9-4c7a-99f6-c2d5b5afaa06','9b4d4a1a-5224-4ad4-b4e3-053dcbfa0f3c'),
    ('36239a24-f71d-4f11-a93e-506775f882e9','34e1a2a7-d0a9-4c7a-99f6-c2d5b5afaa06')



