FROM node:20.10.0

# Buat nodejs app direktori pada container
WORKDIR /usr/src/app

# Copy semua file package.json ke dalam direktori nodejs app di container
COPY package*.json ./

# Jalankan perintah npm install untuk menginstal dependensi yang diperlukan
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3001
CMD ["node", "app.js"]
