# Sử dụng Node dã chiến bản rớt mạng vẫn cài mượt
FROM node:20-alpine

# Cấp cho mảnh đất làm việc trong bụng con Docker
WORKDIR /app

# Copy nguyên đống rễ quản lý thư viện vô cắm hầm trước cho rễ hút nước
COPY package*.json ./

# Ép nó cài đặt mọi mớ bòng bong thư viện 
RUN npm install

# Copy sạch sành sanh ruột gan giao diện vô nối lưới điện
COPY . .

# Khui ổ khóa cho cổng 5173 phát sóng thông qua tường Docker
EXPOSE 5173

# Châm lửa kích hoạt mâm nướng Dev của Vite. Vuốt cọng cờ --host để cho nó lú đầu ra ngoài cho mầy xem!
CMD ["npm", "run", "dev", "--", "--host"]
