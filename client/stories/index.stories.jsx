import React from 'react';
import ThankYouModal from '../components/common/CandidateModals/ThankYouModal';

export default {
    component: ThankYouModal,
    title: 'ThankYouModal'
};

const Template = args => <ThankYouModal {...args} />;

export const Default = Template.bind({});
Default.args = {
    show: true
};
