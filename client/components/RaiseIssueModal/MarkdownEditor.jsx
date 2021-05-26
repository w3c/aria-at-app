import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactMde from 'react-mde';
import { Converter } from 'showdown';
import 'react-mde/lib/styles/css/react-mde-all.css';

const converter = new Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
});

export default function MarkdownEditor({ onChange, defaultValue, name }) {
    const [value, setValue] = useState(defaultValue);
    const [selectedTab, setSelectedTab] = useState('write');

    useEffect(() => {
        // This non-sense is so that both the MarkdownEditor
        // and Form.Control input can use the same handler
        // in RaiseIssueModal
        onChange({ target: { name, value } });
    }, [value]);

    return (
        <ReactMde
            value={value}
            onChange={setValue}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            generateMarkdownPreview={(markdown) =>
                Promise.resolve(converter.makeHtml(markdown))
            }
            toolbarCommands={[
                ['header', 'bold', 'italic', 'strikethrough'],
                ['quote', 'code', 'link'],
                ['unordered-list', 'ordered-list', 'checked-list'],
            ]}
        />
    );
}

MarkdownEditor.propTypes = {
    onChange: PropTypes.func,
    defaultValue: PropTypes.string,
    name: PropTypes.string,
};
