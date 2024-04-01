FROM node:20.10.0

#buat nodejs app direktori pada container

WORKDIR /usr/src/app

# copy semua file package.json ke dalam direktori nodejs app di container
COPY package*.json ./

Run npm install

#jalankan perintah npm install untuk menginstal dependensi yang diperlukan

#bundle app source

COPY . .

EXPOSE 3001
CMD ["node", "app.js"]
