import { v4 as uuidv4 } from "uuid";

uuidv4();

let users = []; //apabila ada perubahan delete maka tidak bisa dilakukan pada const, harus let

export const createUser = (req, res) => {
  const user = req.body;

  const userId = uuidv4(); //generate user id

  const userWithId = { ...user, id: userId }; // titik tiga untuk property user yang nanti kita tambahkan, tambahkan id didalam titik tiga itu

  users.push(userWithId);
  console.log(users);

  res.send(`user with the name ${user.first_name} added to the database`);
};

export const getAllUser = (req, res) => {
  res.send(users);
};

export const getUser = (req, res) => {
  const { id } = req.params;

  const foundUser = users.find((user) => user.id == id); //melakukan pengecekan dari json user id dengan id yang didapatkan dari params

  res.send(foundUser);
};

export const deleteUser = (req, res) => {
  const { id } = req.params;

  users = users.filter((user) => user.id !== id); //filter akan melakukan remove apabila function menjalankan false. sehingga logic yang di dalam harus melakukan return false agar gak didelete. kalo true maka otomatis akan didelete

  res.send(`User with the id ${id} deleted from the database`);
};

export const editUser = (req, res) => {
  const { id } = req.params;

  const userTobeUpdated = users.find((user) => user.id == id); //melakukan pencarian si users dengan params yang didapatkan dari constant id

  const { first_name, last_name, age } = req.body;

  if (first_name) userTobeUpdated.first_name = first_name;

  if (last_name) userTobeUpdated.last_name = last_name;

  if (age) userTobeUpdated.age = age;

  res.send(`user with the id ${id} has been updated`);
};
