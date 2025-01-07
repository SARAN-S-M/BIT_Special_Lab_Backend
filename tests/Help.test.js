const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const Help = require('../src/Help/model');
const { getHelpMaterials, addHelpMaterial, removeHelpMaterial } = require('../src/Help/controller');

jest.mock('../src/Help/model');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());

// Routes for testing
app.get('/HelpMaterials', getHelpMaterials);
app.post('/addHelpMaterial', addHelpMaterial);
app.delete('/removeHelpMaterial', removeHelpMaterial);

describe('POST /addHelpMaterial', () => {

    test('should return 500 when error occurs while adding help material', async () => {
        const newHelpMaterial = {
            question: 'What is Express?',
            answer: 'Express is a web framework for Node.js.',
        };

        Help.mockImplementationOnce(() => ({
            save: jest.fn().mockRejectedValue(new Error('Failed to save')),
        }));

        const response = await request(app)
            .post('/addHelpMaterial')
            .send(newHelpMaterial);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to save');
    });
});

describe('DELETE /removeHelpMaterial', () => {
    test('should return 404 when help material does not exist', async () => {
        const helpMaterialId = 'non-existent-id';
        Help.findById.mockResolvedValue(null);

        const response = await request(app)
            .delete('/removeHelpMaterial')
            .send({ id: helpMaterialId });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Help Material does not exist.');
    });

    test('should remove an existing help material successfully', async () => {
        const helpMaterialId = 'existing-id';
        const mockHelpMaterial = { id: 'existing-id', question: 'What is Node?', answer: 'Node is a JS runtime' };

        Help.findById.mockResolvedValue(mockHelpMaterial);
        Help.deleteOne.mockResolvedValue({});

        const response = await request(app)
            .delete('/removeHelpMaterial')
            .send({ id: helpMaterialId });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Help Material removed successfully');
    });

    test('should return 500 when error occurs while removing help material', async () => {
        const helpMaterialId = 'existing-id';
        const mockHelpMaterial = { id: 'existing-id', question: 'What is Node?', answer: 'Node is a JS runtime' };

        Help.findById.mockResolvedValue(mockHelpMaterial);
        Help.deleteOne.mockRejectedValue(new Error('Failed to delete'));

        const response = await request(app)
            .delete('/removeHelpMaterial')
            .send({ id: helpMaterialId });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to delete');
    });
});
