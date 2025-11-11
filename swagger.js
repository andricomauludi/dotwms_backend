import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'My API',
    description: 'Auto-generated Swagger for Express.js',
  },
  host: 'localhost:3001',
  schemes: ['http'],
};

const outputFile = './swagger.json';
const endpointsFiles = ['./app.js']; // file utama kamu (bisa juga routes/*.js)

swaggerAutogen()(outputFile, endpointsFiles, doc);
