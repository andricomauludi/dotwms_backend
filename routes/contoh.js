const path = require('path'); // for getting file extension
const multer = require('multer'); // for uploading files
const uuidv4 = require('uuidv4'); // for naming files with random characters
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => { // setting destination of uploading files        
      if (file.fieldname === "resume") { // if uploading resume      
        cb(null, './assets/resumes');
      } else { // else uploading image
        cb(null, 'images');
      }
    },
    filename: (req, file, cb) => { // naming file
      cb(null, file.fieldname+"-"+uuidv4()+path.extname(file.originalname));
    }
  });
  
  const fileFilter = (req, file, cb) => {
    if (file.fieldname === "resume") { // if uploading resume
      if (
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) { // check file type to be pdf, doc, or docx
        cb(null, true);
      } else {
        cb(null, false); // else fails
      }
    } else { // else uploading image
      if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
      ) { // check file type to be png, jpeg, or jpg
        cb(null, true);
      } else {
        cb(null, false); // else fails
      }
    }
  };