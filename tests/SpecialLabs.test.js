const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const SpecialLab = require('../src/SpecialLabs/model');
const { addSpecialLab, removeSpecialLab, addFaculty, removeFaculty, getLabsNames, getLabDetailsById, FacultyGetLabDetails, FacultyUpdateLabDetails, addSlot, getSlots, getSlotsByLabId, deleteSlot, bookSlot, studentInterview, studentInterviewResult, studentInterviewRequest, GetstudentInterviewRequest, changeLabDateTime, changeLabResult } = require('../src/SpecialLabs/controller');

// Mock dependencies
jest.mock('../src/SpecialLabs/model');
jest.mock('jsonwebtoken');

// Setup an Express app
const app = express();
app.use(express.json());

// Routes for testing
app.post('/addSpecialLab', addSpecialLab);
app.delete('/removeSpecialLab', removeSpecialLab);
app.post('/addFaculty', addFaculty);
app.delete('/removeFaculty', removeFaculty);
app.get('/getlabsNames', getLabsNames);
app.get('/getLabDetailsById/:id', getLabDetailsById);
app.get('/faculty/getLabDetails', FacultyGetLabDetails);
app.post('/faculty/updateLabDetails', FacultyUpdateLabDetails);
app.post('/addSlot', addSlot);
app.get('/getSlots', getSlots);
app.get('/getSlotById/:id', getSlotsByLabId);
app.delete('/deleteSlot', deleteSlot);
app.post('/bookSlot/:id', bookSlot);
app.get('/student-interview', studentInterview);
app.post('/student-interview/result', studentInterviewResult);
app.post('/student-changeLab-request', studentInterviewRequest);
app.get('/student-changeLab-request', GetstudentInterviewRequest);
app.post('/changeLab-update-date-time', changeLabDateTime);
app.post('/changeLab-result', changeLabResult);

describe('SpecialLabs Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for Add User
  // Test for adding a new special lab successfully
test('should add a new special lab successfully', async () => {
  const newSpecialLab = {
    specialLabName: 'AI Lab',
    specialLabCode: 'AI123',
  };

  SpecialLab.findOne.mockResolvedValue(null); // No existing special lab
  SpecialLab.prototype.save = jest.fn().mockResolvedValueOnce();

  const response = await request(app).post('/addSpecialLab').send(newSpecialLab);

  expect(response.status).toBe(201);
  expect(response.body.message).toBe('Special Lab added successfully');
  expect(SpecialLab.findOne).toHaveBeenCalledWith({ specialLabCode: 'AI123' });
});

// Test for error when special lab already exists
test('should return error if special lab already exists in addSpecialLab', async () => {
  const existingSpecialLab = {
    specialLabName: 'AI Lab',
    specialLabCode: 'AI123',
  };

  SpecialLab.findOne.mockResolvedValue(existingSpecialLab); // Special lab already exists

  const response = await request(app)
    .post('/addSpecialLab')
    .send({ specialLabName: 'AI Lab', specialLabCode: 'AI123' });

  expect(response.status).toBe(200);
  expect(response.body.error).toBe('Special Lab already exists.');
});

// Test for successfully removing a special lab
test('should remove an existing special lab successfully', async () => {
  const specialLabToRemove = { specialLabCode: 'AI123' };

  // Mocking the behavior of SpecialLab.findOne to return an existing special lab
  SpecialLab.findOne.mockResolvedValue({
    specialLabName: 'AI Lab',
    specialLabCode: 'AI123',
  });

  // Mocking the behavior of SpecialLab.deleteOne to resolve successfully
  SpecialLab.deleteOne = jest.fn().mockResolvedValueOnce();

  const response = await request(app).delete('/removeSpecialLab').send(specialLabToRemove);

  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Special Lab removed successfully');
  expect(SpecialLab.findOne).toHaveBeenCalledWith({ specialLabCode: 'AI123' });
  expect(SpecialLab.deleteOne).toHaveBeenCalledWith({ specialLabCode: 'AI123' });
});

// Test for error when the special lab doesn't exist
test('should return error if special lab does not exist in removeSpecialLab', async () => {
  const specialLabToRemove = { specialLabCode: 'AI123' };

  // Mocking the behavior of SpecialLab.findOne to return null (indicating special lab doesn't exist)
  SpecialLab.findOne.mockResolvedValue(null);

  const response = await request(app).delete('/removeSpecialLab').send(specialLabToRemove);

  expect(response.status).toBe(201);
  expect(response.body.error).toBe('Special Lab does not exist.');
  expect(SpecialLab.findOne).toHaveBeenCalledWith({ specialLabCode: 'AI123' });
});

// Test for error when failing to fetch lab names
test('should return error if fetching lab names fails', async () => {
  SpecialLab.find.mockRejectedValue(new Error('Database error'));

  const response = await request(app).get('/getLabsNames');

  expect(response.status).toBe(500);
  expect(response.body.error).toBe('Internal Server Error');
});

test('should return 200 with "Special Lab does not exist" if the lab is not found', async () => {
  const req = {
      body: {
          specialLabCode: 'LAB001',
          facultyEmail: 'test@example.com',
      },
  };

  const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
  };

  // Mock SpecialLab.findOne to return null (special lab not found)
  SpecialLab.findOne.mockResolvedValue(null);

  await removeFaculty(req, res);

  expect(SpecialLab.findOne).toHaveBeenCalledWith({ specialLabCode: 'LAB001' });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ error: 'Special Lab does not exist.' });
});

test('should return 200 with lab details for a faculty', async () => {
  const req = { userEmail: 'faculty@example.com' };
  const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
  };

  const mockLabs = [{
      specialLabName: 'Lab 1',
      specialLabCode: 'LAB001',
      specialLabDescription: 'Test Description',
      faculties: [{ facultyName: 'John Doe', facultyEmail: 'faculty@example.com' }],
      promoVideo: 'http://promo.example.com',
  }];

  SpecialLab.find.mockResolvedValue(mockLabs);

  await FacultyGetLabDetails(req, res);

  expect(SpecialLab.find).toHaveBeenCalledWith({ 'faculties.facultyEmail': 'faculty@example.com' });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
      labDetails: {
          specialLabName: 'Lab 1',
          specialLabCode: 'LAB001',
          specialLabDescription: 'Test Description',
          faculties: [{ facultyName: 'John Doe', facultyEmail: 'faculty@example.com' }],
          promoVideoUrl: 'http://promo.example.com',
      },
  });
});

test('should update lab details and return 200', async () => {
  const req = {
      userEmail: 'faculty@example.com',
      body: { newDescription: 'Updated Description', newPromoVideo: 'http://newpromo.example.com' },
  };
  const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
  };

  const mockLab = {
      specialLabDescription: 'Old Description',
      promoVideo: 'http://oldpromo.example.com',
      save: jest.fn(),
  };

  SpecialLab.findOne.mockResolvedValue(mockLab);

  await FacultyUpdateLabDetails(req, res);

  expect(SpecialLab.findOne).toHaveBeenCalledWith({ 'faculties.facultyEmail': 'faculty@example.com' });
  expect(mockLab.specialLabDescription).toBe('Updated Description');
  expect(mockLab.promoVideo).toBe('http://newpromo.example.com');
  expect(mockLab.save).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ message: 'Special Lab details updated successfully' });
});

test('should return 200 when faculty does not have access', async () => {
  const req = {
      userEmail: 'faculty@example.com',
      body: { newDescription: 'Updated Description', newPromoVideo: 'http://newpromo.example.com' },
  };
  const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
  };

  SpecialLab.findOne.mockResolvedValue(null);

  await FacultyUpdateLabDetails(req, res);

  expect(SpecialLab.findOne).toHaveBeenCalledWith({ 'faculties.facultyEmail': 'faculty@example.com' });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ error: 'Faculty does not have access to this Special Lab.' });
});

test('should return 404 when lab not found by hashed ID', async () => {
  const req = {
    params: { id: 'hashed-lab-id' }
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  SpecialLab.find.mockResolvedValue([]); // Simulate no labs found

  await getSlotsByLabId(req, res);

  expect(SpecialLab.find).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ error: 'Lab not found' });
});






















});
