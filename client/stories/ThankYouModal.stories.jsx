import React from 'react';
import ThankYouModal from '../components/CandidateTests/CandidateModals/ThankYouModal/index.jsx';

export default {
    component: ThankYouModal,
    title: 'ThankYouModal'
};

const Template = args => <ThankYouModal {...args} />;

export const Default = Template.bind({});
Default.args = {
    show: true
};
