import React from 'react';
import ProvideFeedbackModal from '../components/CandidateTests/CandidateModals/ProvideFeedbackModal';

export default {
    component: ProvideFeedbackModal,
    title: 'ProvideFeedbackModal'
};

const Template = args => <ProvideFeedbackModal {...args} />;

export const Default = Template.bind({});
Default.args = {
    at: 'JAWS',
    changesRequestedIssues: [
        { author: 'evmiguel', feedbackType: 'feedback', link: 'link to issue' },
        { author: 'evmiguel', feedbackType: 'feedback', link: 'link to issue' }
    ],
    feedbackIssues: [
        {
            author: 'evmiguel',
            feedbackType: 'changes-requested',
            link: 'link to issue'
        },
        {
            author: 'evmiguel',
            feedbackType: 'changes-requested',
            link: 'link to issue'
        },
        {
            author: 'evmiguel',
            feedbackType: 'changes-requested',
            link: 'link to issue'
        }
    ],
    show: true,
    testPlan: 'Disclosure Navigation Example',
    username: 'evmiguel'
};
