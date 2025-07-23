import axios from 'axios';

// SINGLE base URL
const api = axios.create({
    baseURL: 'http://localhost:5200/api',
});

// Get Questions (for admin survey view)
export const getQuestions = async () => {
    const res = await api.get('/questions');
    console.log("Response from getQuestions:", res);
    return res.data;
};

// Get Survey By Token (for rater survey fill)
export const getSurveyByToken = async (token) => {
    const res = await api.get(`/survey/fill/${token}`);
    console.log("Response from getSurveyByToken:", res);
    return res.data;
};

export const submitSurvey = async (token, answers) => {
    const payload = {
        answers: Object.keys(answers).map((questionId) => ({
            questionId: parseInt(questionId),
            answer: answers[questionId],
        })),
    };

    console.log(" Submitting payload:", JSON.stringify(payload, null, 2));

    const res = await api.post(`/survey/fill/${token}/submit`, payload);
    return res.data;
};

export const getVendors = async () => {
    const res = await api.get('/vendor');
    return res.data;
};

export const createVendor = async (data) => {
    const res = await api.post('/vendor', data);
    return res.data;
};

export const updateVendor = async (id, data) => {
    const res = await api.put(`/vendor/${id}`, data);
    return res.data;
};

export const deleteVendor = async (id) => {
    const res = await api.delete(`/vendor/${id}`);
    return res.data;
};

export const getVendorSurveyDetails = async (vendorId) => {
    const res = await api.get(`/vendor/${vendorId}/survey-details`);
    return res.data;
};

// Department Endpoints
export const getDepartments = async () => {
    const res = await api.get('/department');
    return res.data;
};

export const createDepartment = async (data) => {
    const res = await api.post('/department', data);
    return res.data;
};

export const updateDepartment = async (id, data) => {
    const res = await api.put(`/department/${id}`, data);
    return res.data;
};

export const deleteDepartment = async (id) => {
    const res = await api.delete(`/department/${id}`);
    return res.data;
};

// Users Endpoints
export const getUsers = async () => {
    const res = await api.get('/user');
    console.log("uuuuuuuuuuusssseeeeerrrrrrr",res.data);
    return res.data;
};

export const createUser = async (data) => {
    const res = await api.post('/user', data);
    return res.data;
};

export const updateUser = async (id, data) => {
    const res = await api.put(`/user/${id}`, data);
    return res.data;
};

export const deleteUser = async (id) => {
    const res = await api.delete(`/user/${id}`);
    return res.data;
};

// GET: All raters for dropdown
export const getRaters = async () => {
    const res = await api.get('/user');
    // Filter only raters
    return res.data.filter((user) => user.role === 'rater');
};

// GET: Grouped survey responses by department
export const getSurveyResponsesGroupedByDepartment = async () => {
    const res = await api.get('/survey/responses/grouped-by-department');
    return res.data;
};

// POST: Assign surveys to multiple users
export const assignMultipleSurveys = async (payload) => {
    const res = await api.post('/survey/assign-multiple', payload);
    return res.data;
};

export const getPendingSurveys = async () => {
    const res = await api.get('/survey/pending');
    console.log("This is data for pending surveys", res);
    return res.data;
};

