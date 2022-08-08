import React from 'react';
import ProvideFeedbackModal from '../components/common/CandidateModals/ProvideFeedbackModal';

export default {
    component: ProvideFeedbackModal,
    title: 'ProvideFeedbackModal'
};

const Template = args => <ProvideFeedbackModal {...args} />;

export const Default = Template.bind({});
Default.args = {
    at: 'JAWS',
    issues: ['Issue 1'],
    show: true,
    testPlan: 'Disclosure Navigation Example',
    username: 'evmiguel'
};
