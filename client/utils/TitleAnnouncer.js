import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const TitleAnnouncer = () => {
    const location = useLocation();

    if (location.hash) {
        return null;
    }

    const [title, setTitle] = React.useState('');
    const titleRef = React.createRef();
    const onHelmetChange = ({ title }) => setTitle(title);

    React.useEffect(() => {
        if (titleRef.current) titleRef.current.focus();
    }, [location.pathname]);

    return (
        <>
            <p tabIndex={-1} ref={titleRef} className="sr-only">
                {title}
            </p>

            <Helmet onChangeClientState={onHelmetChange} />
        </>
    );
};

export default TitleAnnouncer;
