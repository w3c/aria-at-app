import React from 'react';
import ProvideFeedbackModal from '../components/common/CandidateModals/ProvideFeedbackModal';

export default {
    component: ProvideFeedbackModal,
    title: 'ProvideFeedbackModal'
};

const Template = args => <ProvideFeedbackModal {...args} />;

export const Default = Template.bind({});
