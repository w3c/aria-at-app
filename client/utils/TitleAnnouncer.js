import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const TitleAnnouncer = () => {
    const location = useLocation();

    if (location.hash) {
        return null;
    }

    const [title, setTitle] = React.useState('');
    const onHelmetChange = ({ title }) => setTitle(title);

    return (
        <>
            <span aria-live="assertive" aria-atomic="true" className="sr-only">
                {title}
            </span>

            <Helmet onChangeClientState={onHelmetChange} />
        </>
    );
};

export default TitleAnnouncer;
