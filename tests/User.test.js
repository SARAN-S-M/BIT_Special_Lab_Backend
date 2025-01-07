const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../src/User/model');
const { addUser, removeUser, blockUser, unblockUser, getRoleData, getStudentDetails, login } = require('../src/User/controller');

// Mock dependencies
jest.mock('../src/User/model');
jest.mock('jsonwebtoken');

// Setup an Express app
const app = express();
app.use(express.json());

// Routes for testing
app.post('/addUser', addUser);
app.post('/removeUser', removeUser);
app.post('/blockUser', blockUser);
app.post('/unblockUser', unblockUser);
app.post('/getRoleData', getRoleData);
app.post('/getStudentDetails', getStudentDetails);
app.post('/login', login);

describe('User Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for Add User
  test('should add a new user successfully', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john@example.com',
      rollNumber: '123456',
      role: 'user',
    };

    User.findOne.mockResolvedValue(null); // No existing user
    User.prototype.save = jest.fn().mockResolvedValueOnce();

    const response = await request(app).post('/addUser').send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User added successfully');
    expect(User.findOne).toHaveBeenCalledWith({ $or: [{ email: 'john@example.com' }, { rollnumber: '123456' }] });
  });

  test('should return error if user already exists in addUser', async () => {
    const existingUser = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      rollnumber: '654321',
      role: 'user',
    };

    User.findOne.mockResolvedValue(existingUser); // User already exists

    const response = await request(app)
      .post('/addUser')
      .send({ name: 'Jane Doe', email: 'jane@example.com', rollNumber: '654321', role: 'user' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('User with this email or roll number already exists');
  });

  // Test for Remove User
  test('should remove a user successfully', async () => {
    const userEmail = 'john@example.com';

    User.findOneAndDelete.mockResolvedValue({ email: userEmail });

    const response = await request(app).post('/removeUser').send({ email: userEmail });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User removed successfully');
    expect(User.findOneAndDelete).toHaveBeenCalledWith({ email: userEmail });
  });

  test('should return error if email is missing in removeUser', async () => {
    const response = await request(app).post('/removeUser').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email is required');
  });

  // Test for Block User
  test('should block a user successfully', async () => {
    const userEmail = 'john@example.com';

    User.findOneAndUpdate.mockResolvedValue({ email: userEmail, status: false });

    const response = await request(app).post('/blockUser').send({ email: userEmail });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User blocked successfully');
  });

  test('should return error if email is missing in blockUser', async () => {
    const response = await request(app).post('/blockUser').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email is required.');
  });

  // Test for Unblock User
  test('should unblock a user successfully', async () => {
    const userEmail = 'john@example.com';

    User.findOneAndUpdate.mockResolvedValue({ email: userEmail, status: true });

    const response = await request(app).post('/unblockUser').send({ email: userEmail });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User unblocked successfully');
  });

  test('should return error if email is missing in unblockUser', async () => {
    const response = await request(app).post('/unblockUser').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email is required.');
  });

  // Test for Get Role Data
  test('should get users by role successfully', async () => {
    const role = 'user';

    const mockUsers = [
      { _id: '1', name: 'John Doe', email: 'john@example.com', rollnumber: '123456' },
      { _id: '2', name: 'Jane Doe', email: 'jane@example.com', rollnumber: '654321' },
    ];

    User.find.mockResolvedValue(mockUsers);

    const response = await request(app).post('/getRoleData').send({ role });

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.users[0].name).toBe('John Doe');
  });

  // Test for Get Student Details
//   test('should get student details successfully', async () => {
//     const userEmail = 'student@example.com';

//     const mockStudent = {
//       name: 'Student Name',
//       email: userEmail,
//       rollnumber: '123456',
//       specialLab: 'Lab A',
//       specialLabCode: 'LAB123',
//       InterviewProgress: '50%',
//     };

//     User.findOne.mockResolvedValue(mockStudent);

//     const response = await request(app).post('/getStudentDetails').send({ email: userEmail });

//     expect(response.status).toBe(200);
//     console.log(response.body);
//     expect(response.body.studentDetails.name).toBe('Student Name');
//   });

  test('should return error if student not found in getStudentDetails', async () => {
    const userEmail = 'nonexistent@example.com';

    User.findOne.mockResolvedValue(null);

    const response = await request(app).post('/getStudentDetails').send({ email: userEmail });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Student not found.');
  });

  // Test for Login
  test('should login successfully', async () => {
    const userEmail = 'newuser@example.com';

    User.findOne.mockResolvedValue({ email: userEmail, role: 'user', _id: '12345' });
    jwt.sign.mockReturnValue('mocked_token');

    const response = await request(app).post('/login').send({ email: userEmail });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('mocked_token');
  });
});
