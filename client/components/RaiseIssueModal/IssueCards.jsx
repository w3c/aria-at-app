import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import nextId from 'react-id-generator';
import moment from 'moment';
/*
issue(number: ...) {
    closed,
    closedAt,
    publishedAt,
    updatedAt,
    number,
    author {
      avatarUrl,
      login
    },
    state,
    title,
    body,
    bodyHTML
}
*/

const REPO_LINK = `https://github.com/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}`;

function IssueCard({ author, bodyHTML, number, publishedAt, title }) {
    const href = `${REPO_LINK}/issues/${number}`;
    const formattedPublishDate = moment(publishedAt).format('MMMM Do YYYY');
    return (
        <Card className="mb-2">
            <Card.Header>{title}</Card.Header>
            <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">
                    {author.login} created on {formattedPublishDate}
                </Card.Subtitle>
                <Card.Text dangerouslySetInnerHTML={{ __html: bodyHTML }} />
                <Card.Link href={href}>See on github.com</Card.Link>
            </Card.Body>
        </Card>
    );
}

IssueCard.propTypes = {
    closed: PropTypes.bool,
    closedAt: PropTypes.string,
    publishedAt: PropTypes.string,
    updatedAt: PropTypes.string,
    number: PropTypes.number,
    author: PropTypes.shape({
        avatarUrl: PropTypes.string,
        login: PropTypes.string
    }),
    state: PropTypes.string,
    title: PropTypes.string,
    body: PropTypes.string,
    bodyHTML: PropTypes.string
};

export default function IssueCards({ issues }) {
    return issues.map(issue => <IssueCard key={nextId()} {...issue} />);
}

IssueCards.propTypes = {
    issues: PropTypes.array
};
