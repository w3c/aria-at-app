const { createFeedbackIssue } = require('../services/GithubService');

const createIssue = async (req, res) => {
    const { labels, body, title } = req.body;
    const response = await createFeedbackIssue({
        title,
        body,
        labels
    });

    res.send(response.status);
};

module.exports = {
    createIssue
};
